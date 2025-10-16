"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";
import { usePathname } from 'next/navigation'

export default function UnreadReplyCount() {
  const [count, setCount] = useState(0);
  const [unreadReplies, setUnreadReplies] = useState<any[]>([]);
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'en'; 
  useEffect(() => {
    const fetchReplies = async () => {
      const token = Cookies.get("sb-xildjwdpjcogmzuuotym-auth-token.0");
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/${locale}/api/comments/inbox`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });
  
      const result = await res.json();
      console.log(result);
  
      const unread = getUnreadReplies(result);
      setUnreadReplies(unread);
      setCount(unread.length);
      console.log(unread.length);
    };
  
    fetchReplies();
  }, []);
  

 
  const getUnreadReplies = (result: any): any[] => {
 
    const replies = Array.isArray(result) ? result : result.data ?? [];
    
 
    return replies.filter((r: any) => r.is_read === false);
  };

  return (
    <div className="relative flex items-center">
      <a 
        href={`/${locale}/inbox`} 
        className="flex items-center p-2 rounded-lg hover:bg-white/10 transition-colors duration-200 group"
        title={count > 0 ? `${count} unread messages` : 'No new messages'}
      >
        <div className="relative">
          <svg 
            className={`w-6 h-6 transition-colors duration-200 ${
              count > 0 
                ? 'text-blue-600 group-hover:text-blue-700' 
                : 'text-gray-800 group-hover:text-blue-600'
            }`}
            fill={count > 0 ? 'currentColor' : 'none'}
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" 
            />
          </svg>
          {count > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[18px] h-[18px] flex items-center justify-center shadow-lg animate-pulse border-2 border-white">
              {count > 99 ? '99+' : count}
            </span>
          )}
        </div>
      </a>
    </div>
  );
}
