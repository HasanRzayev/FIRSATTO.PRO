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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative section-padding">
          <div className="container-max text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              💖 Saved Bicycles
            </h1>
            <p className="text-xl md:text-2xl text-purple-100 max-w-3xl mx-auto leading-relaxed">
              Your favorite bikes in one place
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-pink-300/20 rounded-full blur-2xl"></div>
      </section>

      {/* Saved Ads Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-max">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {savedAds.map((ad) => (
              <div key={ad.id} className="card-hover">
                <Card ad={ad} />
              </div>
            ))}
          </div>
          {hasMore && (
            <div ref={loaderRef} className="py-8 text-center">
              <div className="inline-flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-600 font-medium">{t('loadMore')}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default SavedAdsPage;
