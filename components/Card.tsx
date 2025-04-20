'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { usePathname } from 'next/navigation'

interface CardProps {
  ad: {
    id: string;
    title: string;
    description: string;
    category: string;
    image_urls: string[];
    video_urls: string[];
    location: string;
    user: {
      id: string;
      userName: string;
    };
    user_profiles?: {
      id?: string;
      full_name: string;
    };
    price: number;
  };
}

const Card: React.FC<CardProps> = ({ ad }) => {
  const { id, title, description, image_urls, location, user, user_profiles, price } = ad;
  const router = useRouter();
  const supabase = createClient();
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname()
  const locale = pathname.split('/')[1] // URL-dəki locale dəyərini alırıq
  // Supabase session vasitəsilə user ID-ni əldə et
  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    getUserId();
  }, [supabase]);

  // İstifadəçi həmin elanı artıq qeyd edibmi yoxla
  useEffect(() => {
    const checkIfSaved = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from('user_saved_ads')
        .select('*')
        .eq('user_id', userId)
        .eq('ad_id', ad.id);

      if (error) {
        console.log('Error checking saved ad:', error);
        return;
      }

      setIsSaved(data.length > 0);
    };

    checkIfSaved();
  }, [ad.id, userId, supabase]);

  const handleSaveClick = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!userId) {
      alert('Zəhmət olmasa əvvəlcə daxil olun.');
      return;
    }

    if (isSaved) {
      const { error } = await supabase
        .from('user_saved_ads')
        .delete()
        .eq('user_id', userId)
        .eq('ad_id', ad.id);

      if (error) {
        console.error('Error removing saved ad:', error);
        return;
      }

      setIsSaved(false);
    } else {
      const { error } = await supabase
        .from('user_saved_ads')
        .insert([{ user_id: userId, ad_id: ad.id }]);

      if (error) {
        console.error('Error saving ad:', error);
        return;
      }

      setIsSaved(true);
    }
  };

  const handleCardClick = () => {
    router.push(`/${locale}/details/${id}`);
  };

  const handleUserNameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/${locale}/profile/${ad.user_profiles?.id}`);
  };

  return (
    <div
      className="relative w-full h-[380px] rounded-xl shadow-md overflow-hidden cursor-pointer bg-white"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <img
        className="w-full h-full object-cover transition-all duration-500"
        src={ad.image_urls?.[0] || '/default.jpg'}
        alt={ad.title}
      />

      <div
        className={`absolute inset-0 p-4 flex flex-col justify-between bg-black bg-opacity-70 text-white transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div>
          <h2 className="text-lg font-semibold truncate">{ad.title}</h2>
          <p className="text-sm mt-1 line-clamp-3">{ad.description}</p>
        </div>

        <div className="absolute bottom-8 left-4 text-sm">
          <span className="hover:underline cursor-pointer" onClick={handleUserNameClick}>
            {ad.user_profiles?.full_name || 'User'}
          </span>
          <br />
          <span>{ad.location}</span>
        </div>

        <div className="absolute bottom-8 right-4 text-sm font-semibold">
          <span>{price ? `${price} USD` : 'No Price'}</span>
        </div>

        <button
  onClick={handleSaveClick}
  className="absolute top-4 right-4 p-2 rounded-lg bg-white bg-opacity-80 hover:bg-opacity-100 transition"
>
  <img
    src={
      isSaved
        ? 'https://cdn-icons-png.flaticon.com/512/102/102279.png'
        : 'https://cdn-icons-png.flaticon.com/512/5662/5662990.png'
    }
    alt="Save"
    className="w-6 h-6"
  />
</button>

      </div>
    </div>
  );
};

export default Card;
