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
  
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/comments/inbox`, {
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
<a href={`/${locale}/inbox`} className="flex items-center">
<svg 
      className="w-6 h-6 text-gray-800 dark:text-white" 
      aria-hidden="true" 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      fill="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        fillRule="evenodd" 
        d="M5.024 3.783A1 1 0 0 1 6 3h12a1 1 0 0 1 .976.783L20.802 12h-4.244a1.99 1.99 0 0 0-1.824 1.205 2.978 2.978 0 0 1-5.468 0A1.991 1.991 0 0 0 7.442 12H3.198l1.826-8.217ZM3 14v5a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-5h-4.43a4.978 4.978 0 0 1-9.14 0H3Z" 
        clipRule="evenodd"
      />
    </svg>
  </a>
  {count > 0 && (
    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
      {count}
    </span>
  )}
</div>




  );
}
