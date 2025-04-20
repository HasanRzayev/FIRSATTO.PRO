import { signUpAction } from "../../../actions";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { SmtpMessage } from "../smtp-message";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useTranslations } from "next-intl";

interface SignupProps {
  searchParams?: Record<string, string>;
  params: {
    locale: string;
  };
}

export default function Signup({ searchParams, params }: SignupProps) {
  const t = useTranslations();
  
  const message = {
    success: searchParams?.success || undefined,
    error: searchParams?.error || undefined,
  };

  const locale = params.locale;

  if (message.success || message.error) {
    return (
      <div className="w-full h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-xl">
          <FormMessage message={message} />
        </div>
      </div>
    );
  }

  return (
    <main className="w-full min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xl bg-white p-10 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
          {t("signupheader")}
        </h1>
        <p className="text-sm text-center text-gray-500 mb-6">
          {t("signupquestion")}{" "}
          <Link className="text-blue-500 font-medium underline" href={`/${locale}/sign-in`}>
            {t("signupsignin")}
          </Link>
        </p>
        <form className="flex flex-col gap-6" action={signUpAction}>
        <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              {t("signupemail")}
            </Label>
            <Input
              className="mt-2"
              name="email"
              placeholder={t("signupemailplaceholder")}
              required
            />
          </div>

          <div>
            <Label htmlFor="full_name" className="text-sm font-medium text-gray-700">
              {t("signupfullname")}
            </Label>
            <Input
              className="mt-2"
              name="full_name"
              placeholder={t("signupfullnameplaceholder")}
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              {t("signuppassword")}
            </Label>
            <Input
              className="mt-2"
              type="password"
              name="password"
              placeholder={t("signuppasswordplaceholder")}
              minLength={6}
              required
            />
          </div>

          <SubmitButton
            pendingText={t("signuppending")}
            formAction={signUpAction}
            className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg py-2"
          >
            {t("signupbutton")}
          </SubmitButton>

          <GoogleSignInButton label={t("signupgoogle")} />

          {message.error && (
            <p className="text-sm text-red-600 font-medium text-center">
              {message.error}
            </p>
          )}
        </form>
      </div>
      <SmtpMessage />
    </main>
  );
}
