import { createClient } from "@/utils/supabase/server"; // Supabase ilə əlaqə üçün xüsusi müştəri
import { NextResponse } from 'next/server';

// Supabase müştərisini qururuq
const supabase = createClient(); 

export async function GET(
  req: Request, // sorğu
  { params }: { params: { id: string } } // URL parametri olan `id`
) {
  const { id } = params; // `id`-ni URL parametrlərindən alırıq

  console.log("Fetching comments for adId:", id); // Konsola id çıxarırıq

  // Supabase-dən `comments` cədvəlindən `ad_id`-yə uyğun şərhləri əldə edirik
  const { data, error } = await supabase
    .from('comments') // `comments` cədvəlini sorğulayıb
    .select('*') // Bütün sütunları seçirik
    .eq('ad_id', id) // `ad_id` ilə filtrləyirik
    .order('created_at', { ascending: false }); // Yaradılma tarixinə görə azalan sırada düzürük

  if (error) {
    // Əgər xəta varsa, səhv mesajını loglayırıq və 500 status ilə cavab qaytarırıq
    console.error('❌ Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }

  // Əgər şərhlər tapılıbsa, onları JSON formatında qaytarırıq
  return NextResponse.json(data);
}
