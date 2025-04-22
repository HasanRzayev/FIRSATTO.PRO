"use client";
import { useEffect, useState } from "react";
import Cookie from "js-cookie";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTranslations } from 'next-intl';

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface Reply {
  id: string;
  content?: string;
  is_read?: boolean;
  ad_id?: string;
  parent_comment?: {
    user_id?: string;
  };
  user_profiles?: {
    username?: string;
    profile_picture?: string;
  };
  user_ads?: {
    title?: string;
  };
}

export default function InboxPage() {
  const [replies, setReplies] = useState<Reply[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTextMap, setReplyTextMap] = useState<{ [key: string]: string }>({});
  const [emojiPickerVisible, setEmojiPickerVisible] = useState<string | null>(null);
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [visibleReplies, setVisibleReplies] = useState<Reply[]>([]);
  const [displayCount, setDisplayCount] = useState(4);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredReplies, setFilteredReplies] = useState<Reply[]>([]);
  const translate = useTranslations();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
  const token = Cookie.get("sb-xildjwdpjcogmzuuotym-auth-token.0");

  const fetchReplies = async () => {
    if (!token) {
      console.log("Unauthorized: Token not found");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/comments/inbox`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorText = await res.text();
        console.log(`Error: ${res.status} - ${errorText}`);
        return;
      }

      const result = await res.json();
      const data = Array.isArray(result) ? result : result?.data ?? [];

      const uniqueReplies = Array.from(
        new Map(data.map((r: Reply) => [r.id, r])).values()
      ) as Reply[];
      
      setReplies(uniqueReplies);
      setLoading(false);

      const unreadIds = uniqueReplies.filter(r => !r.is_read).map(r => r.id);
      if (unreadIds.length > 0) {
        await fetch(`${baseUrl}/api/comments/inbox`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: unreadIds }),
        });
      }
    } catch (error) {
      console.error("Error fetching replies:", error);
    }
  };

  const handleReplyChange = (commentId: string, value: string) => {
    setReplyTextMap((prev) => ({ ...prev, [commentId]: value }));
  };

  const handleReplySubmit = async (reply: Reply) => {
    const { id: commentId, ad_id: adId } = reply;
    const text = replyTextMap[commentId];

    if (!text || !commentId || !adId) {
      alert(translate("inboxerrorText"));
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/api/comments/reply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          commentId,
          userId: reply.parent_comment?.user_id,
          text,
          adId,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        console.error(translate("inboxerrorReply"), result);
        alert(`${translate("inboxerrorReply")}: ${result.message}`);
        return;
      }

      setReplyTextMap((prev) => ({ ...prev, [commentId]: "" }));
      fetchReplies();
    } catch (error) {
      console.error(translate("inboxerrorSending"), error);
    }
  };

  const handleEmojiClick = (emoji: any, commentId: string) => {
    setReplyTextMap((prev) => ({
      ...prev,
      [commentId]: (prev[commentId] || "") + emoji.emoji,
    }));
  };

  const toggleInputVisibility = (commentId: string) => {
    setActiveReplyId((prev) => (prev === commentId ? null : commentId));
    setEmojiPickerVisible(null);
  };

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };

    getUser();
    fetchReplies();
  }, []);

  useEffect(() => {
    const filtered = searchQuery
      ? replies.filter(r =>
          r.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.user_profiles?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          r.user_ads?.title?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : replies;

    setFilteredReplies(filtered);
    setVisibleReplies(filtered.slice(0, displayCount));
  }, [searchQuery, replies, displayCount]);

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setDisplayCount((prev) => prev + 5);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) return <p className="p-4">{translate("inboxloading")}</p>;
  if (filteredReplies.length === 0) return <p className="p-4">{translate("inboxempty")}</p>;

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-bold">{translate("inboxinbox")}</h2>
      <input
        type="text"
        placeholder={translate("inboxsearchReplies")}
        className="border px-3 py-2 rounded w-full text-sm"
        value={searchQuery}
        onChange={(e) => {
          setSearchQuery(e.target.value);
          setDisplayCount(5);
        }}
      />

      {visibleReplies.map((reply, index) => (
        <div key={`${reply.id}-${index}`} className="border p-4 rounded-lg shadow space-y-2 relative">
          <div className="text-sm text-gray-600 flex items-center space-x-2">
            {reply.user_profiles?.profile_picture && (
              <img
                src={reply.user_profiles.profile_picture}
                alt={translate("inboxuserProfile")}
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="font-medium">{reply.user_profiles?.username}</span>&nbsp;{translate("inboxreply")}
            {reply.parent_comment?.user_id !== userId && (
              <>
                {" "} {translate("inboxreplyTo")}{" "}
                <span className="font-medium text-blue-600">
                  {reply.parent_comment?.user_id}
                </span>
              </>
            )}
            :
          </div>

          <p className="text-md">{reply.content}</p>

          <div className="text-sm text-gray-500">
            {translate("inboxadTitle")}: <Link href={`/details/${reply.ad_id}`} className="underline">{reply.user_ads?.title}</Link>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => toggleInputVisibility(`reply-${reply.id}`)}
                className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600"
              >
                {translate("inboxreply")}
              </button>

              {activeReplyId === `reply-${reply.id}` && (
                <div className="w-full flex flex-col items-center space-y-2 mt-2">
                  <textarea
                    value={replyTextMap[reply.id] || ""}
                    onChange={(e) => handleReplyChange(reply.id, e.target.value)}
                    className="w-full h-24 border rounded p-2 text-sm"
                    placeholder={translate("inboxwriteReply")}
                  />

                  <div className="flex items-center space-x-2 w-full relative">
                    <button
                      onClick={() => setEmojiPickerVisible(prev => prev === `reply-${reply.id}` ? null : `reply-${reply.id}`)}
                      className="bg-gray-200 p-2 rounded-full"
                    >
                      😊
                    </button>

                    {emojiPickerVisible === `reply-${reply.id}` && (
                      <div className="absolute z-10 top-10">
                        <EmojiPicker onEmojiClick={(emoji) => handleEmojiClick(emoji, reply.id)} />
                      </div>
                    )}

                    <button
                      onClick={() => handleReplySubmit(reply)}
                      className="bg-blue-500 text-white px-4 py-2 rounded-full text-sm hover:bg-blue-600"
                    >
                      {translate("inboxsend")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}