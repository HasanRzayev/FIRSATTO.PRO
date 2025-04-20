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
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-semibold text-gray-800 mb-6">{t("settingssettings")}</h1>

      {profile && (
        <div>
          <div className="mb-6">
            <label className="block text-lg font-medium">{t("settingsfullName")}</label>
            <input
              type="text"
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              value={profile.full_name || ""}
              onChange={(e) =>
                setProfile((prev) => prev ? { ...prev, full_name: e.target.value } : prev) // Proper type handling here
              }
            />
          </div>

          <div className="mb-6">
            <label className="block text-lg font-medium">{t("settingsusername")}</label>
            <input
              type="text"
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              value={profile.username || ""}
              onChange={(e) =>
                setProfile((prev) => prev ? { ...prev, username: e.target.value } : prev) // Proper type handling here
              }
            />
          </div>

          <div className="mb-6">
            <label className="block text-lg font-medium">{t("settingsbio")}</label>
            <textarea
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              value={profile.bio || ""}
              onChange={(e) =>
                setProfile((prev) => prev ? { ...prev, bio: e.target.value } : prev) // Proper type handling here
              }
            />
          </div>

          <div className="mb-6">
            <label className="block text-lg font-medium">{t("settingslocation")}</label>
            <input
              type="text"
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              value={profile.location || ""}
              onChange={(e) =>
                setProfile((prev) => prev ? { ...prev, location: e.target.value } : prev) // Proper type handling here
              }
            />
          </div>

          <div className="mb-6">
            <label className="block text-lg font-medium">{t("settingsbirthDate")}</label>
            <input
              type="date"
              className="mt-1 p-2 border border-gray-300 rounded-md w-full"
              value={profile.birth_date || ""}
              onChange={(e) =>
                setProfile((prev) => prev ? { ...prev, birth_date: e.target.value } : prev) // Proper type handling here
              }
            />
          </div>

          <div className="mb-6">
            <label className="block text-lg font-medium">{t("settingsprofilePicture")}</label>
            {profilePicture && (
              <div className="mb-4">
                <Image
                  src={profilePicture}
                  alt="Profile Picture"
                  width={100}
                  height={100}
                  className="rounded-full"
                />
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="p-2 border border-gray-300 rounded-md"
            />
          </div>

          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
            disabled={isLoading}
          >
            {isLoading ? t("settingssaving") : t("settingssaveChanges")}
          </button>
        </div>
      )}

      {isFirstTime && (
        <p className="text-red-600 mt-4">{t("settingsfillInAllFields")}</p>
      )}
    </div>
  );
}
