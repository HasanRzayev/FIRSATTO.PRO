"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { FaSmile } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { EmojiClickData } from "emoji-picker-react";

// Dynamically import EmojiPicker without SSR
const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => <p>Loading emoji picker...</p>, // Show loading text until the emoji picker is ready
});

interface Comment {
  id: string;
  content: string;
  timestamp: string;  // Add this if CommentSection requires it
  user: {
    full_name: string;
  };
  replies?: Comment[];
}

type CommentSectionProps = {
  adId: number | string;
  userId: number | string;
  comments: Comment[];
  setComments: (comments: Comment[] | ((prev: Comment[]) => Comment[])) => void;
};

const CommentSection = ({ adId, userId, comments, setComments }: CommentSectionProps) => {
  const [newComment, setNewComment] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const t = useTranslations();

  const handleEmojiClick = (emojiData: EmojiClickData) => {
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
// In CommentSection.tsx
setComments((prev) => [
  ...prev,
  {
    id: result.commentId,
    content: newComment,
    timestamp: new Date().toISOString(), // Add current timestamp
    user: {
      full_name: "Current User" // Or get from your auth system
    }
  }
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
            aria-label={t("writeCommentPlaceholder") || "Write a comment..."} // Add ARIA label for accessibility
          />
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-2 bottom-2 text-xl text-gray-500 hover:text-blue-500 transition"
            aria-label={t("emojiPickerButton") || "Open emoji picker"} // Add ARIA label for accessibility
          >
            <FaSmile />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-12 left-0 z-10">
              <EmojiPicker
                onEmojiClick={handleEmojiClick}
                height={350}
                width={280}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleCommentSubmit}
          className="bg-blue-500 hover:bg-blue-600 text-white text-sm px-4 py-2 h-fit rounded-md transition"
          aria-label={t("postComment") || "Post comment"} // Add ARIA label for accessibility
        >
          {t("postComment") || "Post"}
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
