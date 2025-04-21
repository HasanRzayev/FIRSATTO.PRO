"use server";

import { redirect } from "next/navigation";
import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";

const getLocale = async () => {
  const pathname = (await headers()).get('referer')?.split('/') || [];
  return pathname[3] || 'en'; // URL-nin ikinci hissəsindən locale alırıq (nümunə: /en/dashboard)
}

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString();
  const supabase = await createClient();
  const origin = headers().get("origin");
  const locale = getLocale();

  if (!email || !password || !fullName) {
    return encodedRedirect(
      "error",
      `${BASE_URL}/${locale}/sign-up`,
      "Email, password, and full name are required"
    );
  }

  const { data, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${BASE_URL}/auth/callback?locale=${locale}`,
    },
  });

  if (signUpError) {
    console.error("Sign up error: ", signUpError.message);
    return encodedRedirect("error", `${BASE_URL}/${locale}/sign-up`, signUpError.message);
  }

  const user = data?.user;
  if (user && user.id) {
    const { error: profileError } = await supabase.from("user_profiles").insert([
      {
        id: user.id,
        full_name: fullName,
        is_expert: false,
      },
    ]);

    if (profileError) {
      console.error("Profile creation error: ", profileError.message);
      return encodedRedirect("error", `${BASE_URL}/${locale}/sign-up`, "Error while creating profile.");
    }
  } else {
    console.error("User object or user id is missing.");
    return encodedRedirect("error", `${BASE_URL}/${locale}/sign-up`, "Error: User id is missing.");
  }

  return encodedRedirect(
    "success",
    `${BASE_URL}/${locale}/sign-up`,
    "Thanks for signing up! Please check your email for a verification link."
  );
};

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const supabase = await createClient();
  const locale = getLocale();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return encodedRedirect("error", `${BASE_URL}/${locale}/sign-in`, error.message);
  }

  return redirect(`${BASE_URL}/${locale}/settings`);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const supabase = await createClient();
  const callbackUrl = formData.get("callbackUrl")?.toString();
  const locale = getLocale();

  if (!email) {
    return encodedRedirect("error", `${BASE_URL}/${locale}/forgot-password`, "Email is required");
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${BASE_URL}/auth/callback?locale=${locale}&redirect_to=/protected/reset-password`,
  });

  if (error) {
    console.error(error.message);
    return encodedRedirect(
      "error",
      `${BASE_URL}/${locale}/forgot-password`,
      "Could not reset password"
    );
  }

  if (callbackUrl) {
    return redirect(callbackUrl);
  }

  return encodedRedirect(
    "success",
    `${BASE_URL}/${locale}/forgot-password`,
    "Check your email for a link to reset your password."
  );
};

export const resetPasswordAction = async (formData: FormData) => {
  const supabase = await createClient();
  const locale = getLocale();

  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      `${BASE_URL}/${locale}/protected/reset-password`,
      "Password and confirm password are required"
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      `${BASE_URL}/${locale}/protected/reset-password`,
      "Passwords do not match"
    );
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return encodedRedirect(
      "error",
      `${BASE_URL}/${locale}/protected/reset-password`,
      "Password update failed"
    );
  }

  return encodedRedirect(
    "success",
    `${BASE_URL}/${locale}/protected/reset-password`,
    "Password updated"
  );
};

export const signOutAction = async () => {
  const supabase = await createClient();
  await supabase.auth.signOut();
  const locale = getLocale();
  return redirect(`${BASE_URL}/${locale}/sign-in`);
};
