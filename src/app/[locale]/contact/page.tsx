"use client"; // Bu EN YUXARIDA olmalıdır

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useTranslations } from 'next-intl';

const supabase = createClient();

export default function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const t = useTranslations();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const { error } = await supabase
        .from("contacts")
        .insert([{ name, email, message }]);

      if (error) throw error;
      setSuccess(t("successMessage"));
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setError(t("errorMessage"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-center mb-6">{t("Contact")}</h1>
      <div className="max-w-lg mx-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {success && (
            <div className="p-4 bg-green-100 text-green-700 rounded-md">
              {success}
            </div>
          )}
          {error && (
            <div className="p-4 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="name" className="block text-lg">
              {t("nameLabel")}
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder={t("namePlaceholder")}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-lg">
              {t("emailLabel")}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder={t("emailPlaceholder")}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label htmlFor="message" className="block text-lg">
              {t("messageLabel")}
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
              placeholder={t("messagePlaceholder")}
              rows={4}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400"
          >
            {isSubmitting ? t("sending") : t("send")}
          </button>
        </form>
      </div>
    </div>
  );
}
