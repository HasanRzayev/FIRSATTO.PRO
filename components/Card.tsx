'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';

interface CardProps {
  ad: {
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
  };
}

const Card: React.FC<CardProps> = ({ ad }) => {
  const { id, title, description, image_urls, location, user_profiles, price } = ad;
  const router = useRouter();
  const supabase = createClient();
  const [isHovered, setIsHovered] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';

  useEffect(() => {
    const getUserId = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.id) {
        setUserId(session.user.id);
      }
    };
    getUserId();
  }, []);

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
  }, [ad.id, userId]);

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
    router.push(`/${locale}/profile/${user_profiles?.id}`);
  };

  return (
    <div
      className="relative w-full h-[420px] rounded-2xl shadow-lg overflow-hidden cursor-pointer bg-white group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      {/* Image */}
      <div className="relative w-full h-48 overflow-hidden">
        <img
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          src={image_urls?.[0] || '/default.jpg'}
          alt={title}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
        
        {/* Save button */}
        <button
          onClick={handleSaveClick}
          className="absolute top-3 right-3 p-2 rounded-full bg-white/90 hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <svg
            className={`w-5 h-5 transition-colors duration-200 ${
              isSaved ? 'text-red-500' : 'text-gray-600'
            }`}
            fill={isSaved ? 'currentColor' : 'none'}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col h-[172px]">
        <div className="flex-1">
          <h2 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 leading-tight">
            {title}
          </h2>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">
            {description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">
                {(user_profiles?.full_name || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div>
              <p 
                className="text-sm font-medium text-gray-700 hover:text-blue-600 cursor-pointer transition-colors"
                onClick={handleUserNameClick}
              >
                {user_profiles?.full_name || 'User'}
              </p>
              <p className="text-xs text-gray-500">{location}</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">
              {price ? `$${price}` : 'Free'}
            </p>
          </div>
        </div>
      </div>

      {/* Hover overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5 transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="text-white">
          <h3 className="text-xl font-bold mb-2">{title}</h3>
          <p className="text-sm opacity-90 line-clamp-2">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default Card;
