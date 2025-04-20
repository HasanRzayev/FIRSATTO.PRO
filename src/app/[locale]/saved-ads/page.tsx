'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import { useTranslations } from 'next-intl';
interface SavedAd {
  id: string;
  user_id: string;
  ad_id: string;
  ads: {
    id: string;
    title: string;
    description: string;
    category: string;
    image_urls: string[];
    video_urls: string[];
    location: string;
    price: number;
    user: {
      id: string;
      userName: string;
    };
    user_profiles?: {
      id: string;
      full_name: string;
    }[];
  }[];
}


const LIMIT = 12;

const SavedAdsPage: React.FC = () => {
  const t = useTranslations();
  const [savedAds, setSavedAds] = useState<SavedAd[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const supabase = createClient();
  const router = useRouter();
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const fetchSavedAds = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
  
    if (!session?.user?.id) {
      router.push('/login');
      return;
    }
  
    const { data, error } = await supabase
      .from('user_saved_ads')
      .select(` 
        id,
        user_id,
        ad_id,
        ads: user_ads (
          id,
          title,
          description,
          image_urls,
          location,
          price,
          category,
          video_urls,
          user_profiles (
            id,
            full_name
          )
        )
      `)
      .eq('user_id', session.user.id)
      .range(offset, offset + LIMIT - 1);
  
    // BU KISMI EKLİYORUZ ↓
    if (error) {
      console.error('Error fetching saved ads:', error);
    } else {
      if (data.length < LIMIT) {
        setHasMore(false);
      }
    
      const transformedData: SavedAd[] = data.map(item => {
        const ad = item.ads?.[0] ?? {
          id: '',
          title: '',
          description: '',
          image_urls: [],
          location: '',
          price: 0,
          category: '',
          video_urls: [],
          user: { id: '', userName: '' },
          user_profiles: []
        };
      
        const userProfile = ad.user_profiles?.[0];
      
        return {
          ...item,
          ads: [{
            ...ad,
            user: {
              id: userProfile?.id || '',
              userName: userProfile?.full_name || 'User'
            },
            user_profiles: userProfile
              ? [{ id: userProfile.id, full_name: userProfile.full_name }]
              : []
          }]
        };
      });
      
      
    
      setSavedAds((prev) => [...prev, ...transformedData]);
      setOffset(prev => prev + LIMIT);
    
    }
    // BU KISMI EKLİYORUZ ↑
  
    setLoading(false);
  }, [offset, supabase, router]);

  useEffect(() => {
    fetchSavedAds();
  }, []); // İlk dəfə yüklə

  // Infinite scroll observer
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          fetchSavedAds();
        }
      },
      { threshold: 1.0 }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [fetchSavedAds, hasMore, loading]);

  if (loading && savedAds.length === 0) {
    return <p className="p-4 text-gray-600">{t('loading')}</p>;
  }

  if (!loading && savedAds.length === 0) {
    return <p className="p-4 text-gray-600">{t('noSavedAds')}</p>;
  }

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {savedAds.map((item) => {
  const ad = item.ads[0];
  if (!ad) return null; // əgər ad undefined-dirsə, heç nə göstərmə

  return (
<Card 
  key={ad.id} 
  ad={{
    ...ad,
    user_profiles: ad.user_profiles?.[0] // yalnız ilk profili ötür
  }} 
/>

  );
})}

      </div>
      {hasMore && (
        <div ref={loaderRef} className="py-6 text-center text-gray-500">
          {t('loadMore')}
        </div>
      )}
    </div>
  );
};

export default SavedAdsPage;
