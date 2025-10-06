"use client";

import { signOutAction } from "@/src/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePathname } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

export default function AuthButton() {
  const [user, setUser] = useState<any>(null);
  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'az'; 

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const supabase = createClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
        setUser(null);
      }
    };

    fetchUser();

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 750);
    };

    handleResize(); // İlk dəfə səhifə yüklənəndə yoxlayırıq
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ... əvvəlki kod eyni qalır

if (!hasEnvVars) {
  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline" className="bg-white/90 border-gray-300 text-gray-800 hover:bg-white">
        <Link href={`/${locale}/sign-in`}>Sign in</Link>
      </Button>
      {!isMobile && (
        <Button asChild size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link href={`/${locale}/sign-up`}>Sign up</Link>
        </Button>
      )}
    </div>
  );
}

if (!user) {
  return (
    <div className="flex gap-2">
      <Button asChild size="sm" variant="outline" className="bg-white/90 border-gray-300 text-gray-800 hover:bg-white">
        <Link href={`/${locale}/sign-in`}>Sign in</Link>
      </Button>
      {!isMobile && (
        <Button asChild size="sm" variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
          <Link href={`/${locale}/sign-up`}>Sign up</Link>
        </Button>
      )}
    </div>
  );
}

// ... qalan kod dəyişməyəcək


  // user varsa, Dropdown göstəririk (dəyişməyə ehtiyac yoxdur)
  const avatarUrl = user.user_metadata?.avatar_url;
  const nameInitial = user.email?.[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer p-2 rounded-lg hover:bg-white/10 transition-colors duration-200">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border-2 border-white/20"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white flex items-center justify-center text-sm font-bold leading-none shadow-lg">
              {nameInitial}
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 glass-effect border-white/20 shadow-xl">
        <DropdownMenuItem asChild className="hover:bg-white/10">
          <Link href={`/${locale}/profile`} className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="hover:bg-white/10">
          <Link href={`/${locale}/settings`} className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={async () => {
            try {
              const supabase = createClient();
              await supabase.auth.signOut();
              router.push(`/${locale}/sign-in`);
            } catch (error) {
              console.error('Error signing out:', error);
              router.push(`/${locale}/sign-in`);
            }
          }}
          className="hover:bg-red-50 text-red-600"
        >
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign out
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}