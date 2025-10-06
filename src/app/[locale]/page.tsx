"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import Card from "../../../components/Card";
import { useTranslations } from 'next-intl';
import { categories } from './data/categories';
import locationData from './data/locationData';




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
      let query = supabase
        .from("user_ads")
        .select(`
          *, 
          user_profiles (
            full_name,
            id
          )
        `)
        .order("created_at", { ascending: false });

      if (searchTerm.trim()) {
        query = query.or(
          `title.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,location.ilike.%${searchTerm}%`
        );
      }

      if (selectedCountry) {
        query = query.eq("location", selectedCountry);
      }

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      if (minPrice) {
        query = query.gte("price", Number(minPrice));
      }

      if (maxPrice) {
        query = query.lte("price", Number(maxPrice));
      }

      const { data, error } = await query.range((page - 1) * 10, page * 10 - 1);

      if (error) {
        console.error("Supabase Error:", error.message);
        // Mock data for development when Supabase is not configured
        const mockData = [
          {
            id: "1",
            title: "Sample Ad 1",
            description: "This is a sample ad for demonstration purposes.",
            category: "electronics",
            image_urls: ["https://via.placeholder.com/400x300"],
            location: "Baku, Azerbaijan",
            price: 100,
            user_profiles: { full_name: "John Doe", id: "1" }
          },
          {
            id: "2", 
            title: "Sample Ad 2",
            description: "Another sample ad to show the interface.",
            category: "furniture",
            image_urls: ["https://via.placeholder.com/400x300"],
            location: "Istanbul, Turkey",
            price: 250,
            user_profiles: { full_name: "Jane Smith", id: "2" }
          }
        ];
        
        if (reset) {
          setAds(mockData);
        } else {
          setAds((prev) => [...prev, ...mockData]);
        }
        setHasMore(false);
      } else {
        if (reset) {
          setAds(data || []);
        } else {
          setAds((prev) => [...prev, ...(data || [])]);
        }
        setHasMore((data?.length || 0) === 10);
      }
    } catch (error) {
      console.error("Network Error:", error);
      // Show empty state on network errors
      if (reset) {
        setAds([]);
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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative section-padding">
          <div className="container-max text-center">
            <h1 className="mb-6 text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight">
              {t('title')}
            </h1>
            <p className="mb-8 text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              {t('homepage_description')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <a
                href="/ads"
                className="btn-primary inline-flex items-center gap-2"
              >
                {t('List an Ad')}
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </a>
              <a
                href="/about"
                className="btn-secondary inline-flex items-center"
              >
                {t('Learn More')}
              </a>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-blue-300/20 rounded-full blur-lg"></div>
      </section>

      {/* Search and Filter Section */}
      <section className="section-padding bg-white/50 backdrop-blur-sm">
        <div className="container-max">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-12 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            {t('All Announcements')}
          </h2>
          {/* 🔍 Search and Filters */}
          <div className="glass-effect rounded-2xl p-8 mb-12 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              {/* Search */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('keywords')}
                </label>
                <input
                  type="text"
                  placeholder={t('keywords')}
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                />
              </div>

              {/* Country selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('country')}
                </label>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                >
                  <option value="">{t('country')}</option>
                  {countriesWithCities.map(({ country, city }, index) => (
                    <option key={index} value={`${country}, ${city}`}>
                      {country}, {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Category selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('catagory')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="input-field"
                >
                  <option value="">{t('catagory')}</option>
                  {categories?.map((cat) => (
                    <option key={cat.name} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Price Range
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder={t('minimum')}
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value);
                      setPage(1);
                    }}
                    className="w-full input-field"
                  />
                  <input
                    type="number"
                    placeholder={t('maximum')}
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value);
                      setPage(1);
                    }}
                    className="w-full input-field"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 📦 Cards Section */}
      <section className="section-padding">
        <div className="container-max">
          {ads.length === 0 && !loading ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Results Found</h3>
              <p className="text-gray-500">{t('matching')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {ads.map((ad, index) => {
                const isLast = ads.length === index + 1;
                return (
                  <div key={ad.id} ref={isLast ? lastAdRef : null} className="card-hover">
                    <Card ad={ad} />
                  </div>
                );
              })}
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-blue-600 font-medium">{t('loading')}</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
