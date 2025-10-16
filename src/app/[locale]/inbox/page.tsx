"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';

const EmojiPicker = dynamic(() => import("emoji-picker-react"), { ssr: false });

interface Reply {
  id: string;
  content?: string;
  is_read?: boolean;
  ad_id?: string;
  created_at?: string;
  parent_comment?: {
    user_id?: string;
  };
  user_profiles?: {
    full_name?: string;
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
  const [token, setToken] = useState<string | null>(null);
  const translate = useTranslations();
  const locale = useLocale();
  const router = useRouter();

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const fetchReplies = async (authToken: string) => {
    if (!authToken) {
      console.log("Unauthorized: Token not found");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/${locale}/api/comments/inbox`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
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
        await fetch(`${baseUrl}/${locale}/api/comments/inbox`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
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

    if (!token) {
      console.log("Unauthorized: Token not available");
      return;
    }

    try {
      const res = await fetch(`${baseUrl}/${locale}/api/comments/reply`, {
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
      fetchReplies(token);
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
    const initialize = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      const { data: sessionData } = await supabase.auth.getSession();

      const accessToken = sessionData?.session?.access_token ?? null;
      setToken(accessToken);
      setUserId(user?.id || null);

      if (!user?.id) {
        router.push("/sign-in");
        return;
      }

      if (accessToken) {
        fetchReplies(accessToken);
      }
    };

    initialize();
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">{translate("inboxloading")}</p>
        </div>
      </div>
    );
  }

  if (filteredReplies.length === 0) {
    return (
      <div className="min-h-screen">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="relative section-padding">
            <div className="container-max text-center">
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
                📬 Inbox
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
                Your notifications and messages
              </p>
            </div>
          </div>
        </section>

        <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50">
          <div className="container-max">
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-600 mb-2">No Messages</h3>
              <p className="text-gray-500">{translate("inboxempty")}</p>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative section-padding">
          <div className="container-max text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
              📬 Inbox
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Your notifications and messages
            </p>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-purple-300/20 rounded-full blur-2xl"></div>
      </section>

      {/* Messages Section */}
      <section className="section-padding bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container-max">
          <div className="max-w-4xl mx-auto">
            <div className="glass-effect rounded-2xl p-6 shadow-xl mb-6">
              <input
                type="text"
                placeholder={translate("inboxsearchReplies")}
                className="input-field"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setDisplayCount(5);
                }}
              />
            </div>

            <div className="space-y-4">

              {visibleReplies.map((reply, index) => (
                <div key={`${reply.id}-${index}`} className={`glass-effect rounded-xl p-6 shadow-lg space-y-4 ${!reply.is_read ? 'border-l-4 border-blue-500' : ''}`}>
                  <div className="flex items-start gap-4">
                    <div className="shrink-0">
                      {reply.user_profiles?.profile_picture ? (
                        <img
                          src={reply.user_profiles.profile_picture}
                          alt={translate("inboxuserProfile")}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-md"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                          {(reply.user_profiles?.full_name || reply.user_profiles?.username || 'U')[0].toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-semibold text-gray-800">
                          {reply.user_profiles?.full_name || reply.user_profiles?.username || 'User'}
                        </span>
                        {!reply.is_read && (
                          <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-full">
                            NEW
                          </span>
                        )}
                        <span className="text-xs text-gray-500">
                          {reply.created_at ? new Date(reply.created_at).toLocaleString() : 'Just now'}
                        </span>
                      </div>

                      <p className="text-gray-700 mb-3">{reply.content}</p>

                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <Link href={`/details/${reply.ad_id}`} className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                          {reply.user_ads?.title || 'View Ad'}
                        </Link>
                      </div>

                      <div className="pt-4 border-t border-gray-200 mt-4">
                        <button
                          onClick={() => toggleInputVisibility(`reply-${reply.id}`)}
                          className="btn-primary text-sm px-4 py-2 flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                          </svg>
                          {translate("inboxreply")}
                        </button>

                        {activeReplyId === `reply-${reply.id}` && (
                          <div className="mt-4 space-y-3">
                            <div className="relative">
                              <textarea
                                value={replyTextMap[reply.id] || ""}
                                onChange={(e) => handleReplyChange(reply.id, e.target.value)}
                                className="input-field resize-none"
                                rows={3}
                                placeholder={translate("inboxwriteReply")}
                              />
                              <button
                                onClick={() => setEmojiPickerVisible(prev => prev === `reply-${reply.id}` ? null : `reply-${reply.id}`)}
                                className="absolute right-3 bottom-3 text-2xl hover:scale-110 transition-transform"
                              >
                                😊
                              </button>

                              {emojiPickerVisible === `reply-${reply.id}` && (
                                <div className="absolute z-50 bottom-16 right-0">
                                  <EmojiPicker onEmojiClick={(emoji) => handleEmojiClick(emoji, reply.id)} />
                                </div>
                              )}
                            </div>

                            <button
                              onClick={() => handleReplySubmit(reply)}
                              disabled={!replyTextMap[reply.id]?.trim()}
                              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                              {translate("inboxsend")}
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
