"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import locationData from '../data/locationData';
import { categories } from '../data/categories';
import { useTranslations } from 'next-intl';

const badWords = ["sex", "porn", "fuck", "xxx", "18+", "nude", "naked", "sikiş", "amcıq", "sik", "orospu", "analsex"];

export default function CreateAdPage() {
  const supabase = createClient();
  const router = useRouter();
  const t = useTranslations();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [price, setPrice] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const selected = locationData.find((item) => item.country === country);
    setCities(selected ? selected.cities : []);
    setCity("");
  }, [country]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const totalImages = imageFiles.length + selectedFiles.length;
  
      if (totalImages > 5) {
        alert("Maksimum 5 şəkil əlavə edə bilərsiniz.");
        return;
      }
  
      setImageFiles([...imageFiles, ...selectedFiles]);
    }
  };
  

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setVideoFile(e.target.files[0]);
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(imageFiles.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideoFile(null);
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
    return data.secure_url;
  };

  // Profanity filtering
  const filterProfanity = (text: string) => {
    let result = text;
    badWords.forEach((word) => {
      const regex = new RegExp(word, "gi");
      result = result.replace(regex, "***");
    });
    return result;
  };

  // Content moderation: returns true if inappropriate content found
  const moderateContent = (text: string) => {
    const lower = text.toLowerCase();
    return badWords.some((word) => lower.includes(word));
  };

  const checkMediaFileName = (file: File) => {
    const lowerName = file.name.toLowerCase();
    return badWords.some((word) => lowerName.includes(word));
  };

  const validateForm = () => {
    if (!title || !description || !category || !country || !city || !price) {
      alert("Please fill in all fields.");
      return false;
    }

    if (moderateContent(title) || moderateContent(description) || moderateContent(category)) {
      alert("18+ or inappropriate content detected.");
      return false;
    }

    if (checkMediaFileName(videoFile || new File([], "")) || imageFiles.some(checkMediaFileName)) {
      alert("File names contain 18+ or inappropriate words.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setUploading(true);

    try {
      const imageUrls = await Promise.all(imageFiles.map(uploadToCloudinary));
      const videoUrl = videoFile ? await uploadToCloudinary(videoFile) : null;

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from("user_ads")
        .insert({
          user_id: user?.id,
          title: filterProfanity(title),
          description: filterProfanity(description),
          category: filterProfanity(category),
          image_urls: imageUrls,
          video_urls: videoUrl ? [videoUrl] : [],
          location: `${country} - ${city}`,
          price,
        })
        .select();

      if (!error && data) {
        router.push("/profile");
      } else {
        alert("Error occurred: " + error?.message);
      }
    } catch (err) {
      alert("Error during upload.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t("detailsAdd")}</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder={t("detailstitle")}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />

<textarea
  placeholder={t("detailsdescription")}
  onChange={(e) => setDescription(e.target.value)}
  className="border p-2 w-full rounded"
  required
/>

        <input
          list="category-options"
          placeholder={t("detailscategory")}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />
        <datalist id="category-options">
          {categories?.map((cat) => (
            <option key={cat.name} value={cat.slug} />
          ))}
        </datalist>

        <div className="grid grid-cols-2 gap-4">
          <div>
          <label className="block mb-1">{t("detailscountry")}</label>
          <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="border p-2 w-full rounded"
              required
            >
              <option value="">Select</option>
              {locationData.map((item) => (
                <option key={item.country} value={item.country}>
                  {item.country}
                </option>
              ))}
            </select>
          </div>

          <div>
          <label className="block mb-1">{t("detailscity")}</label>
          <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border p-2 w-full rounded"
              required
              disabled={!cities.length}
            >
              <option value="">Select</option>
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>
        </div>

        <input
          type="number"
          placeholder={t("detailsprice")}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border p-2 w-full rounded"
          required
        />

        <div>
        <label className="block">{t("detailsimages")}</label>
        {imageFiles.length < 5 && (
  <input type="file" accept="image/*" multiple onChange={handleImageChange} />
)}
          <div className="flex gap-2 flex-wrap mt-2">
            {imageFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Image"
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 text-red-500"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div>
        <label className="block">{t("detailsvideo")}</label>
        <input type="file" accept="video/*" onChange={handleVideoChange} />
          {videoFile && (
            <div className="mt-2 text-sm">
              {videoFile.name}
              <button
                type="button"
                onClick={removeVideo}
                className="text-red-500 ml-2"
              >
                Remove
              </button>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white p-2 w-full rounded"
          disabled={uploading}
        >
    {uploading ? t("detailsuploading") : t("detailssaveAd")}
    </button>
      </form>
    </div>
  );
}
