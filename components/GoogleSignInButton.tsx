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
      console.log('Google sign-in error:', error.message);
      return;
    }

    const checkInterval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session && session.user) {
        clearInterval(checkInterval);

        const user = session.user;

        const { data: existingProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('id', user.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profil yoxlanarkən xəta:', profileError.message);
          return;
        }

        if (!existingProfile) {
          const fullName = user.user_metadata?.full_name || 'Default Name';

          const { error: insertError } = await supabase
            .from('user_profiles')
            .insert([
              {
                id: user.id,
                full_name: fullName,
                is_expert: false,
              },
            ]);

          if (insertError) {
            console.error('Profil yaradılarkən xəta:', insertError.message);
            return;
          }

          console.log('Profil uğurla yaradıldı');
        }

        // Yönləndirmə URL-ə locale parametri əlavə edilərək edilir
        router.push(`/${locale}/settings`);
      }
    }, 1000);
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
