// src/app/[locale]/(auth-pages)/sign-in/page.tsx (və ya uyğun yol)
import { signInAction } from "../../../../app/actions";
import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import GoogleSignInButton from "@/components/GoogleSignInButton";
import { useTranslations } from 'next-intl';

interface LoginProps {
  searchParams?: Record<string, string>;
  params: {
    locale: string;
  };
}

export default function Login({ searchParams, params }: LoginProps) {
  const t = useTranslations(); // Using translations
  const message: Message = {
    type: searchParams?.type,
    content: searchParams?.content,
  };

  const locale = params.locale;

  return (
    <main className="w-full min-h-screen flex items-center justify-center">
      <div className="w-full max-w-xl bg-white p-10 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-6">{t('signinname')}</h1> {/* Translated "Sign In" */}
        <p className="text-sm text-center text-gray-500 mb-6">
          {t('dontHaveAccount')}{' '}
          <Link className="text-blue-500 font-medium underline" href={`/${locale}/sign-up`}>
            {t('signup')}
          </Link>
        </p>
        <form className="flex flex-col gap-6" action={signInAction}>
          <div>
            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
              {t('email')}
            </Label>
            <Input
              className="mt-2"
              name="email"
              placeholder={t('emailPlaceholder')}
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                {t('password')}
              </Label>
              <Link
                className="text-xs text-blue-500 underline"
                href={`/${locale}/forgot-password`}
              >
                {t('forgotPassword')}
              </Link>
            </div>
            <Input
              className="mt-2"
              type="password"
              name="password"
              placeholder={t('passwordPlaceholder')}
              required
            />
          </div>

          <SubmitButton
            pendingText={t('signingIn')}
            formAction={signInAction}
            className="bg-blue-600 text-white hover:bg-blue-700 rounded-lg py-2"
          >
            {t('signin')}
          </SubmitButton>

          <GoogleSignInButton label={t('signInWithGoogle')} />

          <FormMessage message={message} />
        </form>
      </div>
    </main>
  );
}
