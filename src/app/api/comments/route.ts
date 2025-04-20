// Backend - route.ts
import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // server-side secret key
);

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { adId, userId, content, parentCommentId } = body;

  // adId'yi kontrol et
  if (!adId) {
    console.error("adId is missing or null");
    return NextResponse.json({ error: "Ad ID eksik." }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert([{
        ad_id: adId, // adId burada doğru bir şekilde sağlanmalı
        user_id: userId,
        content
      }])
      .select('id'); // sadece ID geri alırız

    if (error) {
      console.error("Supabase insert error:", error.message);
      return NextResponse.json({ error: "Yorum eklenemedi." }, { status: 500 });
    }

    return NextResponse.json({
      message: "Yorum başarıyla eklendi.",
      commentId: data[0].id,
    });
  } catch (err: any) {
    console.error("Beklenmeyen hata:", err.message);
    return NextResponse.json({ error: "Bir hata oluştu." }, { status: 500 });
  }
}
