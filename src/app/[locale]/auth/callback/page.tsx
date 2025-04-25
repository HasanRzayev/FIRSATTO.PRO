'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

export default function AuthCallbackPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const handleAuth = async () => {
      try {
        // Supabase session yoxla
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (!session || !session.user) {
          console.error('Session tapılmadı:', sessionError?.message);
          return;
        }

        const user = session.user;

        // Profil yoxla və ya yarat
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

          const { error: insertError } = await supabase.from('user_profiles').insert([
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

          console.log('Yeni profil yaradıldı');
        } else {
          console.log('Profil artıq mövcuddur');
        }

        // URL-dən locale götür
        const urlParams = new URLSearchParams(window.location.search);
        const locale = urlParams.get('locale') || 'en';

        // Yönləndir
        window.location.href = `/${locale}/settings`;
      } catch (error) {
        console.error('Callback səhifəsində xəta:', error);
      }
    };

    handleAuth();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Giriş edilir...</p>
    </div>
  );
}
