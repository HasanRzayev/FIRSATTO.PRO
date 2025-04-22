import { createClient } from "@/utils/supabase/server";
import { NextResponse } from 'next/server';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
 
  const supabase = await createClient();  

  const id = (await params).id; 

  console.log("Fetching comments for adId:", id);

  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('ad_id', id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('❌ Supabase error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }

  return NextResponse.json(data);
}
