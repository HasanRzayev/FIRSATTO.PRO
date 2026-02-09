"use server";

import { redirect } from "next/navigation";
import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import connectToDatabase from "../lib/mongoose";
import User from "../models/User";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "";


const getLocale = (referer?: string): string => {
  const pathname = referer?.split('/') || [];
  return pathname[3] || 'en';
};

export const signUpAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const password = formData.get("password")?.toString();
  const fullName = formData.get("full_name")?.toString();
  const origin = formData.get("origin")?.toString();
  const referer = formData.get("referer")?.toString();
  const locale = getLocale(referer);

  const supabase = await createClient();

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
      emailRedirectTo: `${BASE_URL}/${locale}/auth/callback?locale=${locale}`,
    },
  });

  if (signUpError) {
    console.error("Sign up error: ", signUpError.message);
    return encodedRedirect("error", `${BASE_URL}/${locale}/sign-up`, signUpError.message);
  }

  const user = data?.user;
  if (user && user.id) {
    try {
      await connectToDatabase();

      // Create user profile in MongoDB using Mongoose
      // We use the Supabase Auth ID as the _id for the MongoDB document to link them
      await User.create({
        _id: user.id,
        full_name: fullName,
        is_expert: false,
        profile_picture: "", // Default empty or placeholder
      });

    } catch (dbError: any) {
      console.error("MongoDB Profile creation error: ", dbError.message);
      // Optional: You might want to delete the Supabase Auth user if DB creation fails to keep consistency
      // await supabase.auth.admin.deleteUser(user.id); 
      return encodedRedirect("error", `${BASE_URL}/${locale}/sign-up`, "Error while creating profile in database.");
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
  const referer = formData.get("referer")?.toString();
  const locale = getLocale(referer);

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return encodedRedirect("error", `${BASE_URL}/${locale}/sign-in`, error.message);
  }

  return redirect(`${BASE_URL}/${locale}/settings`);
};

export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const callbackUrl = formData.get("callbackUrl")?.toString();
  const referer = formData.get("referer")?.toString();
  const locale = getLocale(referer);

  const supabase = await createClient();

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
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;
  const referer = formData.get("referer")?.toString();
  const locale = getLocale(referer);

  const supabase = await createClient();

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

export const signOutAction = async (formData: FormData) => {
  const referer = formData.get("referer")?.toString();
  const locale = getLocale(referer);

  const supabase = await createClient();
  await supabase.auth.signOut();
  return redirect(`${BASE_URL}/${locale}/sign-in`);
};
