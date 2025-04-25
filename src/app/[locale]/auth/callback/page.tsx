'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

const getLocale = () => {
  const knownLocales = ['az', 'ru', 'en'];
  const urlParams = new URLSearchParams(window.location.search);
  const paramLocale = urlParams.get('locale');
  return knownLocales.includes(paramLocale || '') ? paramLocale! : 'az';
};

export default function AuthCallbackPage() {
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const handleAuthCallback = async () => {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError || !session || !session.user) {
        console.error('Session tapılmadı və ya xətalıdır:', sessionError?.message);
        return;
      }

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

        const { error: insertError } = await supabase.from('user_profiles').insert([
          {
            id: user.id,
            full_name: fullName,
            is_expert: false,
          },
        ]);

        if (insertError) {
          console.error('Profil əlavə olunarkən xəta:', insertError.message);
          return;
        }

        console.log('Yeni profil əlavə olundu');
      } else {
        console.log('Profil artıq mövcuddur');
      }

      const locale = getLocale();
      const targetPath = `/${locale}/settings`;
      window.location.href = targetPath;
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="flex justify-center items-center h-screen">
      <p>Giriş edilir...</p>
    </div>
  );
}
