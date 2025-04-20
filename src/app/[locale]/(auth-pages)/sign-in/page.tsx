
'use client'
import { signInAction } from "../../../../app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { usePathname } from 'next/navigation'

export default async function Login(props: { searchParams: Promise<Message> }) {
  const searchParams = (await props.searchParams) ?? {};
  const pathname = usePathname()
  const locale = pathname?.split('/')[1] || 'en'; // URL-dən locale dəyərini alırıq
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

          <FormMessage message={searchParams} />
        </form>
      </div>
    </main>
  );
}
