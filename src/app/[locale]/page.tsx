"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Card from "../../../components/Card";
import { useTranslations } from 'next-intl';
import { categories } from './data/categories';
import locationData from './data/locationData';
import { FaSearch, FaMapMarkerAlt, FaBicycle, FaFilter, FaArrowRight } from "react-icons/fa";

export default function HomePage() {
  const supabase = createClient();
  const [ads, setAds] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const t = useTranslations();

  const [countriesWithCities, setCountriesWithCities] = useState<{ country: string, city: string }[]>([]);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastAdRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  useEffect(() => {
    const flattened = locationData.flatMap(({ country, cities }) =>
      cities.map((city) => ({ country, city }))
    );

    setCountriesWithCities(flattened);
  }, []);

  const fetchAds = async (reset = false) => {
    setLoading(true);

    try {
      // Build Query String for internal API
      const params = new URLSearchParams();
      if (searchTerm) params.append('q', searchTerm);
      if (selectedCountry) params.append('location', selectedCountry);
      if (selectedCategory) params.append('category', selectedCategory);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      params.append('page', page.toString());

      // Fetch from internal MongoDB API
      const response = await fetch(`/api/ads?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to fetch ads');
      }

      const data = await response.json();

      if (reset) {
        setAds(data || []);
      } else {
        setAds((prev) => [...prev, ...(data || [])]);
      }
      setHasMore((data?.length || 0) === 10);

    } catch (error) {
      console.error("Fetch Error:", error);
      // Fallback Mock Data on Error
      const mockData = [
        {
          id: "1",
          title: "Mountain Bike Trek X-Caliber 9",
          description: "High-performance mountain bike, excellent condition. 29er wheels, hydraulic disc brakes.",
          category: "mountain-bike",
          image_urls: ["https://images.unsplash.com/photo-1532298229144-0ec0c57515c7?q=80&w=2072&auto=format&fit=crop"],
          location: "Baku, Azerbaijan",
          price: 850,
          user_profiles: { full_name: "Elvin Mammadov", id: "1", profile_picture: "" }
        },
        {
          id: "2",
          title: "Vintage Road Bike Peugeot",
          description: "Classic 1980s road bike. Fully restored, new tires and bar tape. A collector's piece.",
          category: "road-bike",
          image_urls: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?q=80&w=2070&auto=format&fit=crop"],
          location: "Istanbul, Turkey",
          price: 450,
          user_profiles: { full_name: "Mehmet Yilmaz", id: "2" }
        },
        {
          id: "3",
          title: "Specialized Sirrus X 4.0",
          description: "Perfect for city commuting and light gravel. Lightweight alloy frame.",
          category: "hybrid-bike",
          image_urls: ["https://images.unsplash.com/photo-1507035895480-2b329994be05?q=80&w=2068&auto=format&fit=crop"],
          location: "Tbilisi, Georgia",
          price: 600,
          user_profiles: { full_name: "Giorgi", id: "3" }
        },
        {
          id: "4",
          title: "Cannondale Synapse Carbon",
          description: "Endurance road bike. Carbon frame, 105 groupset. Ready for long rides.",
          category: "road-bike",
          image_urls: ["https://images.unsplash.com/photo-1576435728672-007dd62f9095?q=80&w=2072&auto=format&fit=crop"],
          location: "Baku, Azerbaijan",
          price: 1200,
          user_profiles: { full_name: "Leyla Aliyeva", id: "4" }
        },
      ];

      if (reset) {
        setAds(mockData);
      } else {
        // Only append mock data if we have no real data yet to avoid duplicates
        if (ads.length === 0) setAds(mockData);
      }
      setHasMore(false);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAds(true);
  }, [searchTerm, selectedCountry, selectedCategory, minPrice, maxPrice]);

  useEffect(() => {
    if (page > 1) {
      fetchAds();
    }
  }, [page]);

  return (
    <div className="flex flex-col gap-16">

      {/* 🚴 PREMIUM HERO SECTION */}
      <section className="relative w-full h-[600px] rounded-3xl overflow-hidden shadow-2xl mx-auto transform transition-all hover:shadow-cyan-500/20">
        <div className="absolute inset-0 bg-black/40 z-10"></div>
        <img
          src="https://images.unsplash.com/photo-1571068316344-75bc76f778f7?q=80&w=2070&auto=format&fit=crop"
          alt="Bicycle Adventure"
          className="w-full h-full object-cover animate-pulse-slow"
        />

        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
          <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight animate-fade-in-up">
            Ride Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Dream</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-2xl font-light leading-relaxed animate-fade-in-up delay-100">
            The world's premium marketplace for buying, selling, and discovering exceptional bicycles.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in-up delay-200">
            <a href="/ads" className="btn-primary flex items-center gap-2 text-lg px-8 py-4">
              <FaSearch className="w-5 h-5" />
              {t('Find a Bike')}
            </a>
            <a href="/about" className="px-8 py-4 rounded-full border-2 border-white/30 text-white font-semibold hover:bg-white/10 backdrop-blur-sm transition-all text-lg flex items-center gap-2">
              {t('Learn More')}
              <FaArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* 🔍 SEARCH & FILTERS - GLASSMORPHISM */}
      <section className="sticky top-24 z-30 -mt-10 px-4">
        <div className="container-max">
          <div className="glass-card p-6 md:p-8 transform -translate-y-8 animate-float">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900 rounded-lg text-indigo-600 dark:text-indigo-400">
                <FaFilter />
              </div>
              <h2 className="text-xl font-bold">{t('Find your perfect ride')}</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
              {/* Search Input */}
              <div className="md:col-span-4 relative group">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <input
                  type="text"
                  placeholder={t('keywords')}
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="input-field pl-12"
                />
              </div>

              {/* Category Select */}
              <div className="md:col-span-3 relative group">
                <FaBicycle className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <select
                  value={selectedCategory}
                  onChange={(e) => { setSelectedCategory(e.target.value); setPage(1); }}
                  className="input-field pl-12 appearance-none cursor-pointer"
                >
                  <option value="">{t('All Categories')}</option>
                  {categories?.map((cat) => (
                    <option key={cat.name} value={cat.slug}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Location Select */}
              <div className="md:col-span-3 relative group">
                <FaMapMarkerAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                <select
                  value={selectedCountry}
                  onChange={(e) => { setSelectedCountry(e.target.value); setPage(1); }}
                  className="input-field pl-12 appearance-none cursor-pointer"
                >
                  <option value="">{t('Worldwide')}</option>
                  {countriesWithCities.map(({ country, city }, index) => (
                    <option key={index} value={`${country}, ${city}`}>
                      {country}, {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Inputs */}
              <div className="md:col-span-2 flex gap-2">
                <input
                  type="number"
                  placeholder="Min $"
                  value={minPrice}
                  onChange={(e) => { setMinPrice(e.target.value); setPage(1); }}
                  className="input-field text-center px-2"
                />
                <input
                  type="number"
                  placeholder="Max $"
                  value={maxPrice}
                  onChange={(e) => { setMaxPrice(e.target.value); setPage(1); }}
                  className="input-field text-center px-2"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📦 AD LISTINGS */}
      <section className="container-max pb-20">
        <div className="flex items-center justify-between mb-8 px-4">
          <h2 className="text-3xl font-bold text-gradient">
            Featured Listings
          </h2>
          <span className="text-sm font-medium text-gray-500 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full">
            {ads.length} items found
          </span>
        </div>

        {ads.length === 0 && !loading ? (
          <div className="text-center py-20 bg-gray-50 dark:bg-slate-900 rounded-3xl border border-dashed border-gray-300 dark:border-slate-800 mx-4">
            <div className="w-24 h-24 mx-auto mb-6 bg-indigo-100 dark:bg-indigo-900/50 rounded-full flex items-center justify-center animate-bounce">
              <FaBicycle className="w-10 h-10 text-indigo-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Bicycles Found</h3>
            <p className="text-gray-500 max-w-sm mx-auto mb-8">
              We couldn't find any listings matching your search. Try adjusting your filters or search terms.
            </p>
            <button
              onClick={() => {
                setSearchTerm(""); setSelectedCategory(""); setSelectedCountry(""); setMinPrice(""); setMaxPrice("");
              }}
              className="btn-secondary"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 px-4">
            {ads.map((ad, index) => {
              const isLast = ads.length === index + 1;
              return (
                <div key={ad.id} ref={isLast ? lastAdRef : null}>
                  <Card ad={ad} />
                </div>
              );
            })}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="relative">
              <div className="w-12 h-12 rounded-full border-4 border-indigo-200 border-t-indigo-600 animate-spin"></div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
