"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import CommentSection from "@/components/CommentSection";
import ImageCarousel from "@/components/ImageCarousel";

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
    userName: string;
  };
  comments: Comment[];
}

interface Comment {
  id: string;
  content: string;
  timestamp: string;
  user: {
    full_name: string;
  };
  replies?: Comment[];
}

async function getAdById(id: string): Promise<Ad | null> {
  try {
    const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/ads/${id}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    console.log(data);
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

  const handleReplyClick = (commentId: string) => {
    setActiveReplyCommentId(commentId);
    setReplyText("");
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/comments/reply`, {
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
          className="max-h-[500px] overflow-y-auto space-y-6"
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
  const id = pathname.split("/").pop();
  const [ad, setAd] = useState<Ad | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [currentUser, setCurrentUser] = useState<{ id: string } | null>(null);
  const t = useTranslations();

  useEffect(() => {
    if (id) {
      getAdById(id).then((data) => {
        if (data) {
          setAd(data);
          setComments(data.comments.slice(0, 10));
        }
      });
    }
  }, [id]);

  useEffect(() => {
    setCurrentUser({ id: "user123" }); // Replace with actual auth
  }, []);

  if (!id || id.length < 10) {
    return <div className="p-6 text-red-600">{t("carddetailsinvalidorincompleteadlink")}</div>;
  }

  if (!ad) {
    return <div className="p-6 text-red-600 text-lg">{t("carddetailsadnotfound")}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-600">{ad.title}</h1>
      <p className="text-md sm:text-lg text-gray-700">{ad.description}</p>

      <div className="grid sm:grid-cols-2 gap-4 text-sm mt-4">
        <p><strong>{t("carddetailscategory")}:</strong> {ad.category}</p>
        <p><strong>{t("carddetailsprice")}:</strong> {ad.price} USD</p>
        <p><strong>{t("carddetailslocation")}:</strong> {ad.location}</p>
        <p><strong>{t("carddetailspostedby")}:</strong> {ad.user?.userName || "N/A"}</p>
      </div>

      {ad.image_urls?.length > 0 && <ImageCarousel images={ad.image_urls} />}

      {ad.video_urls?.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">{t("carddetailsvideo")}</h3>
          <video controls className="w-full rounded-lg shadow">
            <source src={ad.video_urls[0]} type="video/mp4" />
            {t("carddetailsyourbrowserdoesnotsupportvideotag")}
          </video>
        </div>
      )}

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
  );
};

export default DetailPage;
