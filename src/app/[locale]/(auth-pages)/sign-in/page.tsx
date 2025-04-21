'use client'

import { useState, useEffect } from 'react';
import { signInAction } from "../../../../app/actions";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import GoogleSignInButton from "@/components/GoogleSignInButton";

// ✅ Form cavab tipi
type FormResponse = {
  success?: string;
  error?: string;
  message?: string;
};

// ✅ FormMessage komponentini burada təkrar yaradırıq (external import olmadan)
function FormMessage({ message }: { message: FormResponse }) {
  return (
    <div className="flex flex-col gap-2 w-full max-w-md text-sm">
      {message.success && (
        <div className="text-green-700 border-l-2 border-green-700 px-4">
          {message.success}
        </div>
      )}
      {message.error && (
        <div className="text-red-700 border-l-2 border-red-700 px-4">
          {message.error}
        </div>
      )}
      {message.message && (
        <div className="text-gray-700 border-l-2 border-gray-500 px-4">
          {message.message}
        </div>
      )}
    </div>
  );
}

export default function Login(props: { searchParams: Promise<FormResponse | null> }) {
  const [searchParams, setSearchParams] = useState<FormResponse>({});

  useEffect(() => {
    async function fetchSearchParams() {
      const params = await props.searchParams;
      setSearchParams({
        success: params?.success ?? '',
        error: params?.error ?? '',
        message: params?.message ?? '',
      });
    }
    fetchSearchParams();
  }, [props.searchParams]);

  return (
    <main className="w-full min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xl bg-white p-10 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Sign In</h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Don't have an account?{" "}
          <Link className="text-blue-500 font-medium underline" href="/sign-up">
            Sign up
          </Link>
        </p>
        <form className="flex flex-col gap-6" action={signInAction}>
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              Email
            </Label>
            <Input
              className="mt-2"
              name="email"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </Label>
              <Link className="text-xs text-blue-500 underline" href="/forgot-password">
                Forgot Password?
              </Link>
            </div>
            <Input
              className="mt-2"
              type="password"
              name="password"
              placeholder="Your password"
              required
            />
          </div>

          <SubmitButton
            pendingText="Signing In..."
            formAction={signInAction}
            className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg py-2"
          >
            Sign in
          </SubmitButton>

          <GoogleSignInButton label="Sign in with Google" />

          {/* ✅ Burada heç bir error verməyəcək */}
          <FormMessage message={searchParams} />
        </form>
      </div>
    </main>
  );
}
