'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Card from '@/components/Card';
import { useTranslations } from 'next-intl';

interface Ad {
  id: string;
  title: string;
  description: string;
  category?: string;
  image_urls: string[];
  video_urls?: string[];
  location: string;
  price: number;
  user?: {
    id: string;
    userName: string;
  };
  user_profiles?: {
    id?: string;
    full_name: string;
  };
}

interface SavedAdResponse {
  id: string;
  user_id: string;
  ad_id: string;
  ads: Ad | null;
}

const LIMIT = 12;

const SavedAdsPage: React.FC = () => {
  const t = useTranslations();
  const [savedAds, setSavedAds] = useState<Ad[]>([]);
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
      router.push('/sign-in');
      return;
    }

    const { data, error } = await supabase
      .from('user_saved_ads')
      .select(`
        id,
        user_id,
        ad_id,
        ads:user_ads (
          id,
          title,
          description,
          category,
          image_urls,
          video_urls,
          location,
          price,
          user_profiles (
            id,
            full_name
          )
        )
      `)
      .eq('user_id', session.user.id)
      .range(offset, offset + LIMIT - 1);

    if (error || !data) {
      console.error('Error fetching saved ads:', error);
      setLoading(false);
      return;
    }

    const savedData = (data as any[]).filter(
      (item): item is SavedAdResponse => item.ads !== null && item.ads !== undefined
    );

    const ads: Ad[] = savedData.map((item) => item.ads!);

    if (ads.length < LIMIT) {
      setHasMore(false);
    }

    setSavedAds((prev) => [...prev, ...ads]);
    setOffset((prev) => prev + LIMIT);
    setLoading(false);
  }, [offset, supabase, router]);

  useEffect(() => {
    fetchSavedAds();
  }, []);

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
        {savedAds.map((ad) => (
          <Card key={ad.id} ad={ad} />
        ))}
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
