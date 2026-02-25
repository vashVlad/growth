import { supabaseServer } from "@/lib/supabase/server";
import ProfileAdjustForm from '@/components/adjust/ProfileAdjustForm';

export default async function ProfileAdjustPage() {
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
    <div className="mx-auto max-w-2xl p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Adjust identity</h1>
        <p className="mt-1 text-sm text-neutral-600">
          Make a soft adjustment — but leave a brief reflection first.
        </p>
      </div>

      <ProfileAdjustForm initialIdentity={profile?.identity_statement ?? ''} />
    </div>
  );
}
