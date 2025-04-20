import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const supabase = createClient();
  const adId = params.id;

  if (!adId) {
    return new Response(JSON.stringify({ error: "ID parametri mövcud deyil" }), { status: 400 });
  }

  const { data, error } = await supabase
    .from("user_ads")
    .select(`
      id,
      title,
      description,
      category,
      image_urls,
      video_urls,
      location,
      price,
      user:user_id (
        id,
        full_name
      ),
      comments:comments (
        id,
        content,
        created_at,
        parent_comment_id,
        user:user_id (
          id,
          full_name
        ),
        replies:comments (
          id,
          content,
          created_at,
          user:user_id (
            id,
            full_name
          )
        )
      )
    `)
    .eq("id", adId)
    .single();

  if (error) {
    return new Response(JSON.stringify({ error: error.message || "Elan tapılmadı" }), { status: 404 });
  }

  if (!data) {
    return new Response(JSON.stringify({ error: "Elan tapılmadı" }), { status: 404 });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
