'use client';

import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';

export default function GoogleSignInButton({ label = 'Google ilə Daxil Ol' }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  const locale = pathname?.split('/')[1] || 'en';

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        // Redirect URL-də locale əlavə edirik
        redirectTo: `${location.origin}/auth/callback?locale=${locale}`, // locale parametri əlavə olundu
      },
    });

    if (error) {
      console.error('Google login error:', error.message);
    } else {
      console.log('Redirecting to Google...');
    }
  };

  return (
    <button
      type="button"
      onClick={signInWithGoogle}
      className="bg-red-500 hover:bg-red-600 text-white rounded-lg py-2 px-4"
    >
      {label}
    </button>
  );
}
