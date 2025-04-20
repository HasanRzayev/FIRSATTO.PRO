import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { commentId, userId, text, adId } = body; // adId is passed along

    // Validate input
    if (!commentId) {
      return NextResponse.json({ message: "Comment ID is missing" }, { status: 400 });
    }
    
    if (!userId) {
      return NextResponse.json({ message: "User ID is missing" }, { status: 400 });
    }
    
    if (!text) {
      return NextResponse.json({ message: "Text is missing" }, { status: 400 });
    }
    
    if (!adId) {
      return NextResponse.json({ message: "Ad ID is missing" }, { status: 400 });
    }
    
    // Eğer tüm alanlar mevcutsa işlemi devam ettirebilirsiniz
    

    const supabase = createClient();

    // Check if the user exists in the user_profiles table
    const { data: userData, error: userError } = await supabase
      .from('user_profiles')
      .select('id')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      console.error('❌ User not found:', userError?.message);
      return NextResponse.json({ message: 'User does not exist.' }, { status: 400 });
    }

    // Check if the ad exists in the user_ads table
    const { data: adData, error: adError } = await supabase
      .from('user_ads')
      .select('id')
      .eq('id', adId)
      .single();

    if (adError || !adData) {
      console.error('❌ Ad not found:', adError?.message);
      return NextResponse.json({ message: 'Ad does not exist.' }, { status: 400 });
    }

    // Now insert the comment into the 'comments' table
    const { data, error } = await supabase
      .from("comments")
      .insert([
        {
          content: text,
          user_id: userId,
          parent_comment_id: commentId,
          ad_id: adId,
        }
      ])
      .select(`
        *,
        user_profiles (
          full_name
        )
      `);

    if (error) {
      console.error("❌ DB Error:", error.message);
      console.error("📦 Error Details:", error.details); // supabase-specific
      return NextResponse.json({ message: error.message, details: error.details }, { status: 500 });
    }

    return NextResponse.json(data[0], { status: 200 });
  } catch (error: any) {
    console.error("❌ Unexpected Error in reply:", error.message);
    return NextResponse.json({ message: "Internal Server Error", error: error.message }, { status: 500 });
  }
}
