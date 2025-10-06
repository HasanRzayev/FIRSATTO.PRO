"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Card from "@/components/Card";
import EditModal from "@/components/EditModal";
import { useTranslations } from 'next-intl';

export default function ProfilePage() {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [userAds, setUserAds] = useState<any[]>([]);
  const [editingAd, setEditingAd] = useState<any>(null);

  useEffect(() => {
    async function loadUser() {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/sign-in");
        return;
      }

      setUser(user);

      const { data: profileData } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      setProfile(profileData);

      const { data: adsData, error } = await supabase
        .from("user_ads")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (!error) {
        setUserAds(adsData || []);
      }
    }

    loadUser();
  }, []);

  async function handleDeleteAd(adId: string) {
    const { error } = await supabase.from("user_ads").delete().eq("id", adId);
    if (error) {
      alert(t("profildeleteerror") + ": " + error.message);
    } else {
      setUserAds((prev) => prev.filter((ad) => ad.id !== adId));
    }
  }

  async function handleSaveEdit(updatedAd: any) {
    const { error } = await supabase
      .from("user_ads")
      .update({
        title: updatedAd.title,
        description: updatedAd.description,
        price: updatedAd.price,
      })
      .eq("id", updatedAd.id);

    if (error) {
      alert(t("profilupdateerror") + ": " + error.message);
    } else {
      setUserAds((prev) =>
        prev.map((ad) => (ad.id === updatedAd.id ? updatedAd : ad))
      );
      setEditingAd(null);
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative section-padding">
          <div className="container-max text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t("profilprofile")}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Manage your profile and listings
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
      </section>

      {/* Profile Info Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-max">
          {profile && (
            <div className="glass-effect rounded-2xl p-8 shadow-xl mb-12">
              <div className="flex flex-col items-center text-center lg:flex-row lg:text-left lg:items-start lg:gap-10">
                {/* Profile Picture */}
                <div className="shrink-0 mb-6 lg:mb-0">
                  <div className="w-32 h-32 lg:w-40 lg:h-40 rounded-full overflow-hidden border-4 border-white shadow-lg">
                    {profile.profile_picture ? (
                      <img
                        src={profile.profile_picture}
                        alt={t("profilprofilepicture")}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600 text-white text-3xl font-bold">
                        {(profile.full_name || 'U')[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </div>

                {/* User Information */}
                <div className="flex-1 space-y-4">
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    {profile.full_name}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-white/50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-600 mb-1">{t("profilname")}</p>
                      <p className="text-gray-800">{profile.full_name}</p>
                    </div>
                    <div className="p-4 bg-white/50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-600 mb-1">{t("profilbio")}</p>
                      <p className="text-gray-800">{profile.bio || t("profilnone")}</p>
                    </div>
                    <div className="p-4 bg-white/50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-600 mb-1">{t("profillocation")}</p>
                      <p className="text-gray-800">{profile.location || t("profilnone")}</p>
                    </div>
                    <div className="p-4 bg-white/50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-600 mb-1">{t("profilbirthdate")}</p>
                      <p className="text-gray-800">{profile.birth_date || t("profilnone")}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-white/50 rounded-lg">
                    <p className="text-sm font-semibold text-gray-600 mb-1">{t("profilcreatedat")}</p>
                    <p className="text-gray-800">{new Date(profile.created_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <h2 className="text-4xl md:text-5xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent mb-12">
            {t("profilyourads")}
          </h2>

          {userAds.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Ads Yet</h3>
              <p className="text-gray-500 mb-6">{t("profilnoads")}</p>
              <a href="/ads" className="btn-primary inline-flex items-center gap-2">
                Create Your First Ad
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </a>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {userAds.map((ad) => (
                <div
                  key={ad.id}
                  className="relative group overflow-hidden rounded-2xl shadow-lg card-hover"
                  onClick={() => {
                    router.push(`/details/${ad.id}`);
                  }}
                >
                  {/* Hover overlay with action buttons */}
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-300 z-10 flex items-center justify-center gap-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        handleDeleteAd(ad.id);
                      }}
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-colors"
                      title={t("profildelete")}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation(); 
                        setEditingAd(ad);
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white p-3 rounded-full shadow-lg transition-colors"
                      title={t("profiledit")}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                  </div>

                  {/* Card component */}
                  <Card
                    ad={{
                      ...ad,
                      user: {
                        id: user.id,
                        userName: profile?.user_name || t("profilnone"),
                      },
                      user_profiles: {
                        full_name: profile?.full_name || "",
                      },
                    }}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Edit modal */}
          {editingAd && (
            <EditModal
              ad={editingAd}
              onSave={handleSaveEdit}
              onClose={() => setEditingAd(null)}
            />
          )}
        </div>
      </section>
    </div>
  );
}
