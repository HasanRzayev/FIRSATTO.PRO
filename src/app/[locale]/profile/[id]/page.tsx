'use client';

import { use } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import Card from '@/components/Card';
import { useTranslations } from 'next-intl';

const ProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const router = useRouter();
  const supabase = createClient();
  const t = useTranslations();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userAds, setUserAds] = useState<any[]>([]);

  useEffect(() => {
    async function loadUserData() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/sign-in');
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', id)
        .single();

      setProfile(profileData);

      const { data: adsData, error } = await supabase
        .from('user_ads')
        .select('*')
        .eq('user_id', id)
        .order('created_at', { ascending: false });

      if (!error) {
        setUserAds(adsData || []);
      }
    }

    loadUserData();
  }, [id]);

  if (!profile) return <p>{t('profilloading')}</p>;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
        <div className="shrink-0">
          <div className="w-36 h-36 sm:w-40 sm:h-40 rounded-full overflow-hidden border-4 border-gray-300 shadow-lg">
            {profile.profile_picture ? (
              <img
                src={profile.profile_picture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xl">
                {t('profilnoimage')}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-2 text-center sm:text-left">
          <h2 className="text-3xl font-extrabold text-gray-800">
            {profile.full_name}
          </h2>
          <p className="text-gray-600">
            <strong>{t('profilusername')}:</strong> {profile.username}
          </p>
          <p className="text-gray-600">
            <strong>{t('profilbio')}:</strong> {profile.bio || t('profilyoxdur')}
          </p>
          <p className="text-gray-600">
            <strong>{t('profillocation')}:</strong> {profile.location || t('profilyoxdur')}
          </p>
          <p className="text-gray-600">
            <strong>{t('profilbirthdate')}:</strong> {profile.birth_date || t('profilyoxdur')}
          </p>
          <p className="text-gray-600">
            <strong>{t('profilcreatedat')}:</strong>{' '}
            {new Date(profile.created_at).toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">
          {t('profilads')}
        </h2>
        {userAds.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {userAds.map((ad) => (
              <Card
                key={ad.id}
                ad={{
                  ...ad,
                  user: {
                    id: user.id,
                    userName: profile?.user_name || 'Unknown',
                  },
                  user_profiles: {
                    full_name: profile?.full_name || '',
                  },
                }}
              />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">{t('profilnoads')}</p>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
