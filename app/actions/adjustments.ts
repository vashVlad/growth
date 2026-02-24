'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase/server';

export type ActionResult =
  | { ok: true; redirectTo?: string }
  | { ok: false; error: string };

function getString(fd: FormData, key: string) {
  const v = fd.get(key);
  return typeof v === 'string' ? v : '';
}

function clean(s: string) {
  return s.trim();
}

function requireNonEmpty(label: string, value: string) {
  if (!clean(value)) throw new Error(`${label} is required.`);
}

function requireOneOf(label: string, value: string, allowed: string[]) {
  if (!allowed.includes(value)) {
    throw new Error(`${label} must be one of: ${allowed.join(', ')}`);
  }
}

function changedOrThrow(fields: Array<{ label: string; next: string; current: string }>) {
  const anyChanged = fields.some((f) => clean(f.next) !== clean(f.current));
  if (!anyChanged) throw new Error('No changes detected.');
  for (const f of fields) {
    if (clean(f.next) === '' && clean(f.next) !== clean(f.current)) {
      throw new Error(`${f.label} cannot be blank.`);
    }
  }
}

function validateAdjustmentReflection(fd: FormData) {
  const reason_misaligned = getString(fd, 'reason_misaligned');
  const what_changed = getString(fd, 'what_changed');
  const evo = getString(fd, 'evolution_or_avoidance');

  requireNonEmpty('What feels misaligned right now?', reason_misaligned);
  requireNonEmpty('What changed since you set this?', what_changed);
  requireOneOf('Evolution vs avoidance', evo, ['evolution', 'avoidance']);

  return {
    reason_misaligned: clean(reason_misaligned),
    what_changed: clean(what_changed),
    evolution_or_avoidance: evo as 'evolution' | 'avoidance',
  };
}

/**
 * Profile adjust: identity_statement only
 * Inserts adjustment reflection first, then updates profile.
 */
export async function adjustProfileIdentity(fd: FormData): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();

    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData.user) return { ok: false, error: 'Not authenticated.' };
    const userId = authData.user.id;

    const nextIdentity = clean(getString(fd, 'identity_statement'));
    if (!nextIdentity) return { ok: false, error: 'Identity statement cannot be blank.' };

    const { data: profile, error: pErr } = await supabase
      .from('profile')
      .select('user_id, identity_statement')
      .eq('user_id', userId)
      .single();

    if (pErr || !profile) return { ok: false, error: 'Profile not found.' };

    changedOrThrow([
      { label: 'Identity statement', next: nextIdentity, current: profile.identity_statement ?? '' },
    ]);

    const reflection = validateAdjustmentReflection(fd);

    const { error: aErr } = await supabase.from('adjustments').insert({
      user_id: userId,
      entity_type: 'profile',
      entity_id: userId,
      ...reflection,
    });

    if (aErr) return { ok: false, error: `Failed to save adjustment reflection: ${aErr.message}` };

    const { error: uErr } = await supabase
      .from('profile')
      .update({ identity_statement: nextIdentity, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    if (uErr) return { ok: false, error: `Failed to update profile: ${uErr.message}` };

    revalidatePath('/home');
    revalidatePath('/identity');

    return { ok: true, redirectTo: '/identity' };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Something went wrong.' };
  }
}

/**
 * Goal adjust: title, milestone, next_action
 * Inserts adjustment reflection first, then updates the goal.
 * HARD FAILS if the update affects 0 rows (prevents silent "success").
 */
export async function adjustGoal(fd: FormData): Promise<ActionResult> {
  try {
    const supabase = await supabaseServer();

    const { data: authData, error: authErr } = await supabase.auth.getUser();
    if (authErr || !authData.user) return { ok: false, error: 'Not authenticated.' };
    const userId = authData.user.id;

    const goalId = clean(getString(fd, 'goal_id'));
    if (!goalId) return { ok: false, error: 'Missing goal id.' };

    // Fetch goal (ownership enforced here)
    const { data: goal, error: gErr } = await supabase
      .from('goals')
      .select('id, user_id, title, milestone, next_action')
      .eq('id', goalId)
      .eq('user_id', userId)
      .single();

    if (gErr || !goal) return { ok: false, error: 'Goal not found or not yours.' };

    const nextTitle = clean(getString(fd, 'title'));
    const nextMilestone = clean(getString(fd, 'milestone'));
    const nextNextAction = clean(getString(fd, 'next_action'));

    // Prevent blank edits AND require at least one change
    changedOrThrow([
      { label: 'Title', next: nextTitle || goal.title, current: goal.title ?? '' },
      {
        label: 'Milestone',
        next: nextMilestone || (goal.milestone ?? ''),
        current: goal.milestone ?? '',
      },
      {
        label: 'Next action',
        next: nextNextAction || (goal.next_action ?? ''),
        current: goal.next_action ?? '',
      },
    ]);

    // Build payload (empty input = unchanged, NOT clearing)
    const payload: Record<string, string> = {};
    if (nextTitle && nextTitle !== clean(goal.title ?? '')) payload.title = nextTitle;
    if (nextMilestone && nextMilestone !== clean(goal.milestone ?? ''))
      payload.milestone = nextMilestone;
    if (nextNextAction && nextNextAction !== clean(goal.next_action ?? ''))
      payload.next_action = nextNextAction;

    if (Object.keys(payload).length === 0) return { ok: false, error: 'No changes detected.' };

    const reflection = validateAdjustmentReflection(fd);

    // Insert adjustment first
    const { error: aErr } = await supabase.from('adjustments').insert({
      user_id: userId,
      entity_type: 'goal',
      entity_id: goal.id,
      ...reflection,
    });

    if (aErr) return { ok: false, error: `Failed to save adjustment reflection: ${aErr.message}` };

    // Apply edit after (FORCE updated_at + REQUIRE returned row)
    const updatePayload = { ...payload, updated_at: new Date().toISOString() };

    const { data: updated, error: uErr } = await supabase
      .from('goals')
      .update(updatePayload)
      .eq('id', goal.id)
      .eq('user_id', userId)
      .select('id, user_id, title, milestone, next_action, updated_at')
      .maybeSingle();

    if (uErr) return { ok: false, error: `Failed to update goal: ${uErr.message}` };
    if (!updated) {
      return {
        ok: false,
        error:
          'Update affected 0 rows. Check RLS UPDATE policy on goals and confirm you are editing the correct goal.',
      };
    }

    revalidatePath('/home');
    revalidatePath('/progress');
    revalidatePath(`/goals/${goal.id}`);

    return { ok: true, redirectTo: '/home' };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Something went wrong.' };
  }
}