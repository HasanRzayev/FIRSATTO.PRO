"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";


const supabase = createClient(); // No arguments needed, the URL and anon key will be handled in your createClient function

export default function AdminAds() {
  const [ads, setAds] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editAd, setEditAd] = useState<any | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    price: "",
    category: "",
    images: "", // comma-separated URLs
  });

  const router = useRouter();

  useEffect(() => {
    const fetchAds = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("user_ads")
        .select("*")
        .ilike("title", `%${searchTerm}%`)
        .range((page - 1) * 10, page * 10 - 1);

      if (!error && data) {
        setAds((prev) => [...prev, ...data]);
        if (data.length < 10) setHasMore(false);
      } else {
        alert("Error fetching ads.");
      }
      setIsLoading(false);
    };

    fetchAds();
  }, [page, searchTerm]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openModalForAdd = () => {
    setFormData({
      title: "",
      description: "",
      price: "",
      category: "",
      images: "",
    });
    setEditAd(null);
    setShowModal(true);
  };

  const openModalForEdit = (ad: any) => {
    setEditAd(ad);
    setFormData({
      title: ad.title,
      description: ad.description,
      price: ad.price,
      category: ad.category,
      images: ad.images || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
    };

    if (editAd) {
      const { error } = await supabase
        .from("user_ads")
        .update(payload)
        .eq("id", editAd.id);

      if (!error) {
        setAds((prev) =>
          prev.map((ad) => (ad.id === editAd.id ? { ...ad, ...payload } : ad))
        );
      } else {
        alert("Error updating ad.");
      }
    } else {
      const { data, error } = await supabase
        .from("user_ads")
        .insert([payload])
        .select();

      if (!error && data) {
        setAds((prev) => [data[0], ...prev]);
      } else {
        alert("Error adding ad.");
      }
    }

    setShowModal(false);
  };

  const deleteAd = async (id: number) => {
    const { error } = await supabase.from("user_ads").delete().eq("id", id);
    if (!error) {
      setAds((prev) => prev.filter((ad) => ad.id !== id));
    } else {
      alert("Error deleting ad.");
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">Admin Ads</h1>

      <div className="mb-6 flex items-center space-x-4">
        <input
          type="text"
          placeholder="Search Ads..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
            setAds([]);
          }}
          className="border px-4 py-2 rounded-md"
        />
        <button
          onClick={openModalForAdd}
          className="bg-blue-500 text-white px-4 py-2 rounded-md"
        >
          Add Ad
        </button>
      </div>

      {isLoading && <div>Loading...</div>}

      <div
        className="space-y-6"
        style={{ maxHeight: "70vh", overflowY: "auto" }}
        onScroll={(e) => {
          const el = e.target as HTMLElement;
          if (el.scrollHeight - el.scrollTop === el.clientHeight && hasMore && !isLoading) {
            setPage((p) => p + 1);
          }
        }}
      >
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white shadow-md p-4 rounded-lg">
            <h2 className="text-xl font-semibold">{ad.title}</h2>
            <Carousel showArrows showThumbs={false} className="mb-4">
              {(ad.images?.split(",") || []).map((img: string, idx: number) => (
                <div key={idx}>
                  <img src={img.trim()} alt={`Ad ${idx}`} />
                </div>
              ))}
            </Carousel>
            <p><strong>Description:</strong> {ad.description}</p>
            <p><strong>Price:</strong> ${ad.price}</p>
            <p><strong>Category:</strong> {ad.category}</p>

            <div className="flex space-x-4 mt-4">
              <button
                onClick={() => openModalForEdit(ad)}
                className="bg-yellow-500 text-white px-4 py-2 rounded-md"
              >
                Edit
              </button>
              <button
                onClick={() => deleteAd(ad.id)}
                className="bg-red-500 text-white px-4 py-2 rounded-md"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {!hasMore && <div className="text-center text-gray-500">No more ads to load</div>}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-md w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">{editAd ? "Edit Ad" : "Add New Ad"}</h2>
            <input
              name="title"
              value={formData.title}
              onChange={handleFormChange}
              placeholder="Title"
              className="w-full mb-3 p-2 border rounded"
            />
            <textarea
              name="description"
              value={formData.description}
              onChange={handleFormChange}
              placeholder="Description"
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              name="price"
              type="number"
              value={formData.price}
              onChange={handleFormChange}
              placeholder="Price"
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              name="category"
              value={formData.category}
              onChange={handleFormChange}
              placeholder="Category"
              className="w-full mb-3 p-2 border rounded"
            />
            <input
              name="images"
              value={formData.images}
              onChange={handleFormChange}
              placeholder="Image URLs (comma-separated)"
              className="w-full mb-3 p-2 border rounded"
            />

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                className="bg-green-600 text-white px-4 py-2 rounded-md"
              >
                {editAd ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
