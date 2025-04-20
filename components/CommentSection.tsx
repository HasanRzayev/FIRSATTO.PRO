"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { FaSmile } from "react-icons/fa";
import { useTranslations } from 'next-intl';

// Emoji picker-i SSR olmadan yükləmək üçün:
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
});

const CommentSection = ({ adId, userId, comments, setComments }) => {
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const t = useTranslations();

  const handleEmojiClick = (emojiData) => {
    setNewComment((prev) => prev + emojiData.emoji);
  };

  const handleCommentSubmit = async () => {
    if (!adId) {
      console.error("adId is missing!");
      return;
    }

    const response = await fetch("/api/comments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        adId,
        userId,
        content: newComment,
      }),
    });

    if (response.ok) {
      const result = await response.json();
      setNewComment("");
      setComments((prev) => [
        ...prev,
        {
          id: result.commentId,
          content: newComment,
          user: {
            full_name: t("commentname") || "You", // Translate or fallback to "You"
          },
        },
      ]);
    } else {
      const errorData = await response.json();
      console.log("Failed to add comment:", errorData);
    }
  };

  return (
    <div className="w-full border rounded-lg p-3 shadow-sm bg-white">
      <div className="flex items-end gap-2">
        <div className="relative flex-grow">
          <textarea
            rows={1}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t("writeCommentPlaceholder") || "Write a comment..."} // Translate or fallback to default placeholder
            className="w-full resize-none border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
          />
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-2 bottom-2 text-xl text-gray-500 hover:text-blue-500 transition"
          >
            <FaSmile />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-10">
              <EmojiPicker
                onEmojiClick={(emojiData) =>
                  setNewComment((prev) => prev + emojiData.emoji)
                }
                height={350}
                width={280}
                emojiStyle="native"
                theme="light"
              />
            </div>
          )}
        </div>

        <button
          onClick={handleCommentSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 h-fit rounded-md transition"
        >
          {t("postComment") || "Post"}  {/* Translate or fallback to default button label */}
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
