import { supabaseServer } from '@/lib/supabase/server';
import ProfileAdjustForm from '@/components/adjust/ProfileAdjustForm';

export default async function IdentityAdjustPage() {
  const supabase = await supabaseServer();
  const { data: auth } = await supabase.auth.getUser();

  if (!auth?.user) {
    return (
      <div className="mx-auto max-w-xl p-6">
        <p className="text-sm text-neutral-600">Please sign in.</p>
      </div>
    );
  }

  const { data: profile } = await supabase
    .from('profile')
    .select('identity_statement')
    .eq('user_id', auth.user.id)
    .single();

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-14 space-y-10">
      <div className="mb-6">
        <h1 className="text-[11px] uppercase tracking-widest text-muted-foreground/80">Adjust identity</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Make a soft adjustment — but leave a brief reflection first.
        </p>
      </div>
      
      <div className="pt-2" />
      <ProfileAdjustForm initialIdentity={profile?.identity_statement ?? ''} />
    </div>
  );
}
