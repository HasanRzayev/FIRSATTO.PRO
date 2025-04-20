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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">
        {t("profilprofile")}
      </h1>
      {profile && (
        <div className="mb-10 flex flex-col items-center text-center sm:flex-row sm:text-left sm:items-start sm:gap-10">
          {/* Profil şəkli */}
          <div className="shrink-0">
            <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-300 shadow-md">
              {profile.profile_picture ? (
                <img
                  src={profile.profile_picture}
                  alt={t("profilprofilepicture")}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-2xl">
                  {t("profilnoimage")}
                </div>
              )}
            </div>
          </div>

          {/* İstifadəçi məlumatları */}
          <div className="mt-6 sm:mt-0 space-y-2">
            <h2 className="text-2xl font-bold text-gray-800">{profile.full_name}</h2>
            <p className="text-gray-600 text-base">
              <strong>{t("profilname")}:</strong> {profile.full_name}
            </p>
            <p className="text-gray-600 text-base">
              <strong>{t("profilbio")}:</strong> {profile.bio || t("profilnone")}
            </p>
            <p className="text-gray-600 text-base">
              <strong>{t("profillocation")}:</strong> {profile.location || t("profilnone")}
            </p>
            <p className="text-gray-600 text-base">
              <strong>{t("profilbirthdate")}:</strong> {profile.birth_date || t("profilnone")}
            </p>
            <p className="text-gray-600 text-base">
              <strong>{t("profilcreatedat")}:</strong>{" "}
              {new Date(profile.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      )}

      <hr className="my-6 border-gray-300" />
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        {t("profilyourads")}
      </h2>

      {userAds.length === 0 ? (
        <p className="text-gray-500">{t("profilnoads")}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {userAds.map((ad) => (
            <div
              key={ad.id}
              className="relative group overflow-hidden rounded-lg shadow-md"
              onClick={() => {
                router.push(`/details/${ad.id}`);
              }}
            >
              {/* Hover zamanı görünən blur qat */}
              <div className="absolute inset-0 bg-white/30 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition duration-300 z-10 pointer-events-none" />

              {/* Edit və Delete düymələri */}
              <div className="absolute inset-0 z-20 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition duration-300 pointer-events-auto">
                {/* Silmək düyməsi */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Card klikini blokla
                    handleDeleteAd(ad.id);
                  }}
                  className="bg-red-600 text-white text-sm px-4 py-2 rounded-md hover:bg-red-700"
                >
                  <img
                    src="https://img.icons8.com/ios-filled/50/ffffff/delete.png"
                    alt={t("profildelete")}
                    className="w-5 h-5"
                  />
                </button>

                {/* Redaktə etmə düyməsi */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // Card klikini blokla
                    setEditingAd(ad);
                  }}
                  className="bg-blue-600 text-white text-sm px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  <img
                    src="https://img.icons8.com/ios-filled/50/ffffff/pencil.png"
                    alt={t("profiledit")}
                    className="w-5 h-5"
                  />
                </button>
              </div>

              {/* Card komponenti */}
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

      {/* Edit modalı */}
      {editingAd && (
        <EditModal
          ad={editingAd}
          onSave={handleSaveEdit}
          onClose={() => setEditingAd(null)}
        />
      )}
    </div>
  );
}
