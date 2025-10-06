"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useTranslations } from "next-intl";
interface Profile {
  full_name: string;
  username: string;
  bio: string;
  location: string;
  birth_date: string;
  profile_picture?: string | null;
}

export default function SettingsPage() {
  const t = useTranslations();
  const supabase = createClient();
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // Typed profile
  const [profilePicture, setProfilePicture] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFirstTime, setIsFirstTime] = useState<boolean>(false);

  useEffect(() => {
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

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

      if (profileData) {
        setProfile(profileData);
        setProfilePicture(profileData.profile_picture || null);

        if (
          !profileData.full_name ||
          !profileData.username ||
          !profileData.bio ||
          !profileData.location ||
          !profileData.birth_date
        ) {
          setIsFirstTime(true);
        }
      }
    }

    loadUser();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      uploadToCloudinary(file);
    }
  };

  const uploadToCloudinary = async (file: File) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ml_default");
    formData.append("cloud_name", "dj997ctyw");

    const res = await fetch("https://api.cloudinary.com/v1_1/dj997ctyw/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setProfilePicture(data.secure_url);
  };

  const handleSave = async () => {
    if (!profile) {
      alert(t("settingsprofiledataNotLoaded"));
      return;
    }

    const { full_name, username, bio, location, birth_date } = profile;

    if (
      !full_name?.trim() ||
      !username?.trim() ||
      !bio?.trim() ||
      !location?.trim() ||
      !birth_date?.trim()
    ) {
      alert(t("settingsfillAllFields"));
      return;
    }

    setIsLoading(true);

    const updatedProfile = {
      full_name: full_name.trim(),
      username: username.trim(),
      bio: bio.trim(),
      location: location.trim(),
      birth_date: birth_date.trim(),
      profile_picture: profilePicture,
    };

    const { error } = await supabase
      .from("user_profiles")
      .update(updatedProfile)
      .eq("id", user?.id);

    if (error) {
      alert(t("settingsprofileUpdateError") + error.message);
    } else {
      alert(t("settingsprofileUpdated"));
      setIsFirstTime(false);
    }

    setIsLoading(false);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative section-padding">
          <div className="container-max text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t("settingssettings")}
            </h1>
            <p className="text-xl md:text-2xl text-indigo-100 max-w-3xl mx-auto leading-relaxed">
              Customize your profile and preferences
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 right-10 w-24 h-24 bg-purple-300/20 rounded-full blur-xl"></div>
      </section>

      {/* Settings Form Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            {profile && (
              <div className="glass-effect rounded-2xl p-8 shadow-xl">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column - Basic Info */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Basic Information</h3>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t("settingsfullName")}</label>
                      <input
                        type="text"
                        className="input-field"
                        value={profile.full_name || ""}
                        onChange={(e) =>
                          setProfile((prev) => prev ? { ...prev, full_name: e.target.value } : prev)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t("settingsusername")}</label>
                      <input
                        type="text"
                        className="input-field"
                        value={profile.username || ""}
                        onChange={(e) =>
                          setProfile((prev) => prev ? { ...prev, username: e.target.value } : prev)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t("settingsbio")}</label>
                      <textarea
                        className="input-field resize-none"
                        rows={4}
                        value={profile.bio || ""}
                        onChange={(e) =>
                          setProfile((prev) => prev ? { ...prev, bio: e.target.value } : prev)
                        }
                      />
                    </div>
                  </div>

                  {/* Right Column - Additional Info */}
                  <div className="space-y-6">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Additional Details</h3>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t("settingslocation")}</label>
                      <input
                        type="text"
                        className="input-field"
                        value={profile.location || ""}
                        onChange={(e) =>
                          setProfile((prev) => prev ? { ...prev, location: e.target.value } : prev)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t("settingsbirthDate")}</label>
                      <input
                        type="date"
                        className="input-field"
                        value={profile.birth_date || ""}
                        onChange={(e) =>
                          setProfile((prev) => prev ? { ...prev, birth_date: e.target.value } : prev)
                        }
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">{t("settingsprofilePicture")}</label>
                      {profilePicture && (
                        <div className="mb-4">
                          <Image
                            src={profilePicture}
                            alt="Profile Picture"
                            width={120}
                            height={120}
                            className="rounded-full shadow-lg border-4 border-white"
                          />
                        </div>
                      )}
                      <div className="flex items-center gap-4">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="input-field"
                        />
                        <div className="text-sm text-gray-500">
                          <p>Recommended: 400x400px</p>
                          <p>Max size: 5MB</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <button
                    onClick={handleSave}
                    className="btn-primary w-full md:w-auto disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        {t("settingssaving")}
                      </>
                    ) : (
                      <>
                        {t("settingssaveChanges")}
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {isFirstTime && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                  <p className="text-amber-800">{t("settingsfillInAllFields")}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
