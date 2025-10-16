"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { FaSmile } from "react-icons/fa";
import { useTranslations } from "next-intl";
import { EmojiClickData } from "emoji-picker-react";
import { usePathname } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

const EmojiPicker = dynamic(() => import("emoji-picker-react"), {
  ssr: false,
  loading: () => <p>Loading emoji picker...</p>, 
});

interface Comment {
  id: string;
  content: string;
  timestamp: string; 
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
  const [currentUserProfile, setCurrentUserProfile] = useState<any>(null);
  const t = useTranslations();
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] || 'en';
  const supabase = createClient();

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('full_name, username')
            .eq('id', user.id)
            .single();
          
          setCurrentUserProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setNewComment((prev) => prev + emojiData.emoji);
  };

  const handleCommentSubmit = async () => {
    if (!adId) {
      console.error("adId is missing!");
      return;
    }

    // Yeni yorum için id ekleyerek API'ye gönderme
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/api/comments`, {
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

      // Gelen yorumları güncellemek ve ID'yi eklemek
      setComments((prev) => [
        ...prev,
        {
          id: result.commentId || "default-comment-id",
          content: newComment,
          timestamp: new Date().toISOString(),
          user: {
            full_name: currentUserProfile?.full_name || currentUserProfile?.username || "User",
          },
        },
      ]);
    } else {
      const errorData = await response.json();
      console.log("Failed to add comment:", errorData);
    }
  };

  return (
    <div className="w-full glass-effect rounded-xl p-6 shadow-lg">
      <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        Write a Comment
      </h3>
      <div className="flex items-end gap-3">
        <div className="relative flex-grow">
          <textarea
            rows={3}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={t("writeCommentPlaceholder") || "Share your thoughts about this bicycle..."}
            className="input-field resize-none"
            aria-label={t("writeCommentPlaceholder") || "Write a comment..."}
          />
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className="absolute right-3 bottom-3 text-2xl text-gray-400 hover:text-blue-500 transition-colors"
            aria-label={t("emojiPickerButton") || "Open emoji picker"}
          >
            <FaSmile />
          </button>
          {showEmojiPicker && (
            <div className="absolute bottom-16 right-0 z-50">
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
          disabled={!newComment.trim()}
          className="btn-primary h-fit disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          aria-label={t("postComment") || "Post comment"}
        >
          {t("postComment") || "Post"}
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default CommentSection;
