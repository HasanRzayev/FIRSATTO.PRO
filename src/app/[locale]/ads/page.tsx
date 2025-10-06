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
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-600 via-blue-600 to-purple-600">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative section-padding">
          <div className="container-max text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              {t("detailsAdd")}
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Create your listing and reach thousands of potential buyers
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-green-300/20 rounded-full blur-2xl"></div>
      </section>

      {/* Form Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="glass-effect rounded-2xl p-8 shadow-xl">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("detailstitle")}
                  </label>
                  <input
                    type="text"
                    placeholder={t("detailstitle")}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("detailsdescription")}
                  </label>
                  <textarea
                    placeholder={t("detailsdescription")}
                    onChange={(e) => setDescription(e.target.value)}
                    className="input-field resize-none"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label htmlFor="category-options" className="block text-sm font-semibold text-gray-700 mb-2">
                    {t("detailscategory")}
                  </label>
                  <select
                    id="category-options"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="input-field"
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t("detailscountry")}</label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="input-field"
                      required
                    >
                      <option value="">Select Country</option>
                      {locationData.map((item) => (
                        <option key={item.country} value={item.country}>
                          {item.country}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">{t("detailscity")}</label>
                    <select
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input-field"
                      required
                      disabled={!cities.length}
                    >
                      <option value="">Select City</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="currency-input" className="block text-sm font-semibold text-gray-700 mb-2">
                    Price (USD)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 font-medium">$</span>
                    </div>
                    <input
                      type="number"
                      id="currency-input"
                      className="input-field pl-10"
                      placeholder="Enter amount"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t("detailsimages")}</label>

                  {imageFiles.length < 5 && (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="dropzone-file"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
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
                            className="w-12 h-12 mb-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
                            PNG, JPG, GIF up to 10MB (Max 5 images)
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

                  {imageFiles.length > 0 && (
                    <div className="flex gap-3 flex-wrap mt-4">
                      {imageFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Selected"
                            className="w-24 h-24 object-cover rounded-lg shadow-md"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{t("detailsvideo")}</label>

                  {!videoFile && (
                    <div className="flex items-center justify-center w-full">
                      <label
                        htmlFor="video-dropzone"
                        className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
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
                            className="w-12 h-12 mb-4 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14m-6 0a6 6 0 110-12 6 6 0 010 12zm0 0v5m0 0H8m2 0h2"
                            />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">
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
                        className="w-full h-64 rounded-xl object-cover shadow-lg"
                        src={URL.createObjectURL(videoFile)}
                      ></video>
                      <button
                        type="button"
                        onClick={removeVideo}
                        className="absolute top-3 right-3 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  disabled={uploading}
                >
                  {uploading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      {t("detailsuploading")}
                    </>
                  ) : (
                    <>
                      {t("detailssaveAd")}
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}