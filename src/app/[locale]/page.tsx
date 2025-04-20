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

    console.log("Fetched Ads Data:", data);

    if (error) {
      console.error("Error loading ads:", error.message);
    } else {
      if (reset) {
        setAds(data || []);
      } else {
        setAds((prev) => [...prev, ...(data || [])]);
      }
      setHasMore((data?.length || 0) === 10);
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
    <div className="px-4 py-8 max-w-screen-xl mx-auto bg-[#F5F5F5]">
      <section className="bg-center bg-no-repeat bg-[url('https://flowbite.s3.amazonaws.com/docs/jumbotron/conference.jpg')] bg-gray-700 bg-blend-multiply">
        <div className="px-4 mx-auto max-w-screen-xl text-center py-24 lg:py-56">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-white md:text-5xl lg:text-6xl">
            {t('title')}
          </h1>
          <p className="mb-8 text-lg font-normal text-gray-300 lg:text-xl sm:px-16 lg:px-48">
            {t('homepage_description')}
          </p>
          <div className="flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
            <a
              href="#"
              className="inline-flex justify-center items-center py-3 px-5 text-base font-medium text-center text-white rounded-lg bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-900"
            >
              {t('List an Ad')}
              <svg
                className="w-3.5 h-3.5 ms-2 rtl:rotate-180"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 14 10"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M1 5h12m0 0L9 1m4 4L9 9"
                />
              </svg>
            </a>
            <a
              href="#"
              className="inline-flex justify-center hover:text-gray-900 items-center py-3 px-5 sm:ms-4 text-base font-medium text-center text-white rounded-lg border border-white hover:bg-gray-100 focus:ring-4 focus:ring-gray-400"
            >
              {t('Learn More')}
            </a>
          </div>
        </div>
      </section>

      <h1 className="text-4xl font-extrabold mb-6 text-center text-[#2F4F4F]">
        {t('All Announcements')}
      </h1>

      {/* 🔍 Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-10 max-w-5xl mx-auto bg-white p-4 rounded-lg shadow-md">
        {/* Axtarış */}
        <input
          type="text"
          placeholder={t('keywords')}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
          className="col-span-1 md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring focus:border-blue-400"
        />

        {/* Ölkə seçimi */}
        <select
          value={selectedCountry}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
        >
          <option value="">{t('country')}</option>
          {countriesWithCities.map(({ country, city }, index) => (
            <option key={index} value={`${country}, ${city}`}>
              {country}, {city}
            </option>
          ))}
        </select>

        {/* Kategoriya seçimi */}
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 rounded-lg shadow-sm"
        >
          <option value="">{t('catagory')}</option>
          {categories?.map((cat) => (
            <option key={cat.name} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>

        {/* Qiymət aralığı */}
        <div className="flex gap-2">
          <input
            type="number"
            placeholder={`${t('minimum')}`}
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="number"
            placeholder={`${t('maximum')}`}
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
          />
        </div>
      </div>

      {/* 📦 Cards */}
      {ads.length === 0 && !loading ? (
        <p className="text-center text-gray-500">{t('matching')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-8">
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

      {loading && <p className="text-center mt-4 text-blue-500">{t('loading')}</p>}
    </div>
  );
}
