// DetailPage.tsx
"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import CommentSection from "@/components/CommentSection";
import ImageCarousel from "@/components/ImageCarousel";
import { useTranslations, useLocale } from 'next-intl';

 interface Comment {
  id: string;
  content: string;
  timestamp: string;  
  user: {
    full_name: string;
  };
  replies?: Comment[];
}

 interface Ad {
  id: string;
  title: string;
  description: string;
  category: string;
  image_urls: string[];
  video_urls: string[];
  location: string;
  price: string;
  user: {
    id: string;
    full_name: string;
  };
  comments: Comment[];
}
async function getAdById(id: string, locale: string): Promise<Ad | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/api/ads/${id}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    console.log(data)
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch ad:", error);
    return null;
  }
}


const CommentArea = ({
  comments,
  setComments,
  currentUser,
  adId,
}: {
  comments: Comment[];
  setComments: React.Dispatch<React.SetStateAction<Comment[]>>;
  currentUser: { id: string };
  adId: string;
}) => {
  const commentAreaRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(false);
  const [commentOffset, setCommentOffset] = useState(10);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeReplyCommentId, setActiveReplyCommentId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const t = useTranslations();
  const [ad, setAd] = useState<Ad | null>(null);
  const locale = useLocale(); 

  const handleReplyClick = (commentId: string) => {
    setActiveReplyCommentId(commentId);
    setReplyText("");
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/api/comments/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          commentId: activeReplyCommentId,
          userId: currentUser.id,
          text: replyText,
          adId: adId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log("⚠️ Server error:", errorData.message);
        return;
      }

      const newReply = await response.json();
      setComments((prev) =>
        prev.map((comment) =>
          comment.id === activeReplyCommentId
            ? { ...comment, replies: [...(comment.replies || []), newReply] }
            : comment
        )
      );

      setReplyText("");
      setActiveReplyCommentId(null);
    } catch (err) {
      console.log("⚠️ Backend API issue:", err);
    }
  };

  const loadMoreComments = () => {
    const commentArea = commentAreaRef.current;
    if (!commentArea || loading) return;

    if (commentArea.scrollHeight === commentArea.scrollTop + commentArea.clientHeight) {
      setLoading(true);
      setTimeout(() => {
        setComments((prevComments) => [
          ...prevComments,
          ...comments.slice(commentOffset, commentOffset + 10),
        ]);
        setCommentOffset((prevOffset) => prevOffset + 10);
        setLoading(false);
      }, 1000);
    }
  };

  useEffect(() => {
    const commentArea = commentAreaRef.current;
    if (commentArea) commentArea.addEventListener("scroll", loadMoreComments);
    return () => commentArea?.removeEventListener("scroll", loadMoreComments);
  }, [comments, loading]);

  return (
    <div className="mt-10">
      <h3 className="text-2xl font-bold mb-6 text-gray-800">{t("carddetailscomments")}</h3>
  
      {comments.length === 0 ? (
        <p className="text-gray-400 text-lg">{t("carddetailsnocomments")}</p>
      ) : (
        <div
          ref={commentAreaRef}
          className="max-h-[700px] overflow-y-auto space-y-6"
        >
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="bg-white border border-gray-200 rounded-2xl shadow-md p-5"
            >
              <p className="text-base text-gray-800 mb-2">
                <span className="font-semibold text-blue-700">
                  {comment.user.full_name}
                </span>{" "}
                <span className="text-gray-600">{t("carddetailssaid")}</span> {comment.content}
              </p>
  
              <button
                onClick={() => handleReplyClick(comment.id)}
                className="text-sm text-blue-600 hover:underline"
              >
                {t("carddetailsreply")}
              </button>
  
              {activeReplyCommentId === comment.id && (
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder={t("carddetailswriteareply")}
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="border border-gray-300 px-4 py-2 rounded-lg flex-grow focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                  <button
                    onClick={handleSendReply}
                    className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition"
                  >
                    {t("carddetailssend")}
                  </button>
                </div>
              )}
  
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-5 pl-4 border-l-2 border-blue-100 space-y-3">
                  {comment.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg"
                    >
                      <strong className="text-blue-600">
                        {reply.user?.full_name || t("carddetailsyou")}
                      </strong>
                      : {reply.content}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
  
          {loading && (
            <p className="text-center text-gray-500 text-sm">{t("carddetailsloadingmorecomments")}</p>
          )}
        </div>
      )}
    </div>
  );
  
};
const DetailPage = () => {
  const pathname = usePathname();
  const id = pathname ? pathname.split("/").pop() : null;

  const [ad, setAd] = useState<Ad | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const t = useTranslations();

  const locale = useLocale();

  useEffect(() => {
    if (id) {
      getAdById(id, locale).then((data) => {
        if (data) {
          setAd(data);
          setComments(data.comments.slice(0, 10));
        }
      });
    }
  }, [id, locale]);
  
  useEffect(() => {
    setCurrentUser({ id: "user123" }); 
  }, []);

  if (!id || id.length < 10) {
    return (
      <div className="p-8 text-center text-red-500 text-xl font-semibold">
        {t("carddetailsinvalidorincompleteadlink")}
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="p-8 text-center text-red-500 text-xl font-semibold">
        {t("carddetailsadnotfound")}
      </div>
    );
  }
  return (
    <div className="max-w-6xl mx-auto p-6 sm:p-10 space-y-12 min-w-[320px]">
      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 bg-white p-6 sm:p-10 rounded-3xl shadow-2xl min-w-[300px]">
        {/* Left Side - Carousel */}
        <div className="w-full">
          {ad.image_urls?.length > 0 && (
            <ImageCarousel images={ad.image_urls as string[]} />
          )}

          {ad.video_urls?.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2 text-gray-800 break-words">{t("carddetailsvideo")}</h3>
              <video controls className="w-full rounded-lg shadow-md">
                <source src={ad.video_urls[0]} type="video/mp4" />
                {t("carddetailsyourbrowserdoesnotsupportvideotag")}
              </video>
            </div>
          )}
        </div>

        {/* Right Side - Ad Details */}
        <div className="flex flex-col justify-center space-y-6 min-w-[300px] break-words">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-indigo-700 break-words">{ad.title}</h1>
            <p className="text-lg text-gray-600 break-words">{ad.description}</p>
          </div>

          <div className="space-y-2 text-gray-700 text-base break-words">
            <p><span className="font-semibold">{t("carddetailscategory")}:</span> {ad.category}</p>
            <p><span className="font-semibold">{t("carddetailsprice")}:</span> {ad.price} USD</p>
            <p><span className="font-semibold">{t("carddetailslocation")}:</span> {ad.location}</p>
            <p><span className="font-semibold">{t("carddetailspostedby")}:</span> {ad.user?.full_name || "N/A"}</p>
          </div>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white p-6 rounded-3xl shadow-2xl space-y-8 min-w-[300px]">
        {currentUser && (
          <CommentArea
            comments={comments}
            setComments={setComments}
            currentUser={ad.user}
            adId={ad.id}
          />
        )}

        <CommentSection
          adId={ad.id}
          userId={ad.user.id}
          comments={comments}
          setComments={setComments}
        />
      </div>
    </div>
  );
};

export default DetailPage;