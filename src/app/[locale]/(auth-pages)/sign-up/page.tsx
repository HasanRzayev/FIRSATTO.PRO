'use client'

import { useSearchParams } from "next/navigation";
import { signUpAction } from "../../../../app/actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import GoogleSignInButton from "@/components/GoogleSignInButton";

export default function Signup() {
  const searchParams = useSearchParams();

  const message = {
    success: searchParams?.get("success") || undefined,
    error: searchParams?.get("error") || "", // If no error, set an empty string
  };

  return (
    <main className="w-full min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xl bg-white p-10 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">Sign Up</h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          Already have an account?{" "}
          <Link className="text-blue-500 font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <form className="flex flex-col gap-6" action={signUpAction} method="POST">
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
            <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
              Full Name
            </Label>
            <Input
              className="mt-2"
              name="full_name"
              placeholder="Your Full Name"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <Input
              className="mt-2"
              type="password"
              name="password"
              placeholder="Your password"
              minLength={6}
              required
            />
          </div>

          <SubmitButton
            pendingText="Signing up..."
            formAction={signUpAction}
            className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg py-2"
          >
            Sign up
          </SubmitButton>

          <GoogleSignInButton label="Sign up with Google" />

          {/* Show error message if any */}
          {message.error && (
            <p className="text-sm text-red-600 font-medium text-center">{message.error}</p>
          )}
        </form>

        <SmtpMessage />
      </div>
    </main>
  );
}
