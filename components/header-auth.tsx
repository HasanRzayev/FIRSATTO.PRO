"use client";

import { signOutAction } from "@/src/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
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
  const router = useRouter();
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'az'; // default olaraq 'az' və ya istədiyin dəyəri ver

  useEffect(() => {
    const fetchUser = async () => {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
    };

    fetchUser();
  }, []);

  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
        <Badge variant="default" className="font-normal pointer-events-none">
          Please update .env.local with anon key and url
        </Badge>
        <div className="flex gap-2">
          <Button asChild size="sm" variant="outline" disabled>
          <Link href={`/${locale}/sign-in`}>Sign in</Link>
          </Button>
          <Button asChild size="sm" variant="default" disabled>
          <Link href={`/${locale}/sign-up`}>Sign up</Link>
          </Button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex gap-2">
    <Button asChild size="sm" variant="outline">
        <Link href={`/${locale}/sign-in`}>Sign in</Link>
      </Button>
      <Button asChild size="sm" variant="default">
        <Link href={`/${locale}/sign-up`}>Sign up</Link>
      </Button>
      </div>
    );
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const nameInitial = user.email?.[0]?.toUpperCase() || "U";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="cursor-pointer">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="Avatar"
              className="w-8 h-8 rounded-full object-cover border"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-bold">
              {nameInitial}
            </div>
          )}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem asChild>
        <Link href={`/${locale}/profile`}>Profile</Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
        <Link href={`/${locale}/settings`}>Settings</Link>
        </DropdownMenuItem>
        <form action={signOutAction}>
          <DropdownMenuItem asChild>
            <button type="submit" className="w-full text-left">
              Sign out
            </button>
          </DropdownMenuItem>
        </form>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
