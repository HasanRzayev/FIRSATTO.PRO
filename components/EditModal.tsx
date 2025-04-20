"use client";

import { useState } from "react";

export default function EditModal({ ad, onSave, onClose }: any) {
  const [title, setTitle] = useState(ad.title);
  const [description, setDescription] = useState(ad.description);
  const [price, setPrice] = useState(ad.price);
  const [error, setError] = useState("");

  function containsInappropriateWords(text: string) {
    const inappropriateWords = ["sex", "nude", "porn", "18+", "xxx"];
    const lowerText = text.toLowerCase();
    return inappropriateWords.some((word) => lowerText.includes(word));
  }

  const handleSubmit = () => {
    if (!title || !description || !price) {
      setError("Bütün sahələr doldurulmalıdır.");
      return;
    }

    if (isNaN(price) || Number(price) <= 0) {
      setError("Qiymət düzgün rəqəm olmalıdır.");
      return;
    }

    if (containsInappropriateWords(title) || containsInappropriateWords(description)) {
      setError("18+ və uyğun olmayan sözlərə icazə verilmir.");
      return;
    }

    onSave({ ...ad, title, description, price: Number(price) });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow max-w-md w-full space-y-4">
        <h2 className="text-xl font-bold">Edit Ad</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Title"
          className="w-full border px-3 py-2 rounded"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          className="w-full border px-3 py-2 rounded"
          type="number"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Ləğv et
          </button>
          <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded">
            Yadda saxla
          </button>
        </div>
      </div>
    </div>
  );
}
