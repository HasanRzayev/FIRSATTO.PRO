"use client";

import { useEffect, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';

const supabase = createClient(); 
export default function Dashboard() {
  const [isMounted, setIsMounted] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return; 

    const fetchData = async () => {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user || user.email !== 'hsnrz2002@gmail.com') {
        router.push('/admin');
        return;
      }
    };

    fetchData();
  }, [router, isMounted]);

  const goToUsersPage = () => {
    router.push('/admin-users');
  };

  const goToAdsPage = () => {
    router.push('/admin-ads');
  };
const goToHomePage = () => {
    router.push('/');
  };
  
  if (!isMounted) {
    return null;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Panel</h1>
      
      <div className="mb-8 flex space-x-4 justify-center">
        <button
          onClick={goToUsersPage}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Go to Users
        </button>
        <button
          onClick={goToAdsPage}
          className="bg-green-500 text-white px-4 py-2 rounded-md"
        >
          Go to Ads
        </button>
        <button
    onClick={goToHomePage}
    className="bg-gray-500 text-white px-4 py-2 rounded-md"
  >
    Go to Home
  </button>
      </div>
    </div>
  );
}
