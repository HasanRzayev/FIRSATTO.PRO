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
    const checkUser = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (error) {
        console.log("Error getting session", error);
        return;
      }

      if (!session) {
        router.push("/sign-in");
      } 
    };

    checkUser();
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

 
  const filterProfanity = (text: string) => {
    let result = text;
    badWords.forEach((word) => {
      const regex = new RegExp(word, "gi");
      result = result.replace(regex, "***");
    });
    return result;
  };

 
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
          location: `${country}, ${city}`,
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
          className="border p-2 w-full rounded placeholder-black text-black dark:placeholder-black dark:text-black"
          required
        />

        <textarea
          placeholder={t("detailsdescription")}
          onChange={(e) => setDescription(e.target.value)}
          className="block p-2.5 w-full text-sm text-black bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 placeholder-black dark:bg-gray-700 dark:border-gray-600 dark:placeholder-black dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
          rows={4}
          required
        />

        <div className="max-w-sm ml-0">
          <label htmlFor="category-options" className="block mb-2 text-sm font-medium text-black dark:text-black">
            {t("detailscategory")}
          </label>
          <select
            id="category-options"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="bg-gray-50 border border-gray-300 text-black text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-black dark:text-black dark:focus:ring-blue-500 dark:focus:border-blue-500"
            required
          >
            <option value="">{t("detailscategory")}</option>
            {categories?.map((cat) => (
              <option key={cat.name} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-black dark:text-black">{t("detailscountry")}</label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="border p-2 w-full rounded text-black placeholder-black dark:text-black dark:placeholder-black"
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
            <label className="block mb-1 text-black dark:text-black">{t("detailscity")}</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border p-2 w-full rounded text-black placeholder-black dark:text-black dark:placeholder-black"
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

        <label
          htmlFor="currency-input"
          className="mb-2 text-sm font-medium text-black sr-only dark:text-black"
        >
          Price
        </label>
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-black dark:text-black">₼</span>
          </div>
          <input
            type="number"
            id="currency-input"
            className="block p-2.5 w-full z-20 pl-10 text-sm text-black bg-gray-50 rounded-s-lg border-e-gray-50 border-e-2 border border-gray-300 focus:ring-blue-500 focus:border-blue-500 placeholder-black dark:bg-gray-700 dark:border-e-gray-700 dark:border-gray-600 dark:placeholder-black dark:text-black dark:focus:border-blue-500"
            placeholder="Enter amount"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block mb-2 text-black dark:text-black">{t("detailsimages")}</label>

          {imageFiles.length < 5 && (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                onDrop={(e) => {
                  e.preventDefault();
                  const files = Array.from(e.dataTransfer.files);
                  const imageFilesOnly = files.filter(file => file.type.startsWith('image/'));
            
                  const totalImages = imageFiles.length + imageFilesOnly.length;
                  if (totalImages > 5) {
                    alert("Maksimum 5 şəkil əlavə edə bilərsiniz.");
                    return;
                  }
            
                  setImageFiles(prev => [...prev, ...imageFilesOnly]);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-black dark:text-black"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 20 16"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M13 13h3a3  0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-black dark:text-black">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-black dark:text-black">
                    SVG, PNG, JPG or GIF (MAX. 800x400px)
                  </p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          <div className="flex gap-2 flex-wrap mt-4">
            {imageFiles.map((file, index) => (
              <div key={index} className="relative">
                <img
                  src={URL.createObjectURL(file)}
                  alt="Selected"
                  className="w-20 h-20 object-cover rounded"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-0 right-0 text-red-500 bg-white rounded-full w-5 h-5 flex items-center justify-center"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8">
          <label className="block mb-2 text-black dark:text-black">{t("detailsvideo")}</label>

          {!videoFile && (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="video-dropzone"
                className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
                onDrop={(e) => {
                  e.preventDefault();
                  const file = e.dataTransfer.files[0];
                  if (file && file.type.startsWith("video/")) {
                    setVideoFile(file);
                  } else {
                    alert("Zəhmət olmasa video faylı atın.");
                  }
                }}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <svg
                    className="w-8 h-8 mb-4 text-black dark:text-black"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 10l4.553-2.276A1 1 0 0 1 21 8.618v6.764a1 1 0 0 1-1.447.894L15 14m-6 0a6 6 0 1 1 0-12 6 6 0 0 1 0 12zm0 0v5m0 0H8m2 0h2"
                    />
                  </svg>
                  <p className="mb-2 text-sm text-black dark:text-black">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-black dark:text-black">
                    MP4, MOV, AVI formats (Max 100MB)
                  </p>
                </div>
                <input
                  id="video-dropzone"
                  type="file"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="hidden"
                />
              </label>
            </div>
          )}

          {videoFile && (
            <div className="relative mt-4">
              <video
                controls
                className="w-full h-64 rounded-lg object-cover"
                src={URL.createObjectURL(videoFile)}
              ></video>
              <button
                type="button"
                onClick={removeVideo}
                className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2"
              >
                ✕
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