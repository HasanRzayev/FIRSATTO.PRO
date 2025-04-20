import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET(req: Request) {
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: error?.message || "User not found" }, { status: 401 });
  }

  // 1. User-ə aid bütün commentləri tap
  const { data: userComments, error: userCommentsError } = await supabase
    .from("comments")
    .select("id")
    .eq("user_id", user.id);

  if (userCommentsError) {
    return NextResponse.json({ error: userCommentsError.message }, { status: 500 });
  }

  const userCommentIds = userComments.map(c => c.id);
  if (userCommentIds.length === 0) return NextResponse.json([]);

  // 2. Bu commentlərə yazılmış cavabları (1-ci səviyyə reply) tap
  const { data: firstLevelReplies, error: firstLevelError } = await supabase
    .from("comments")
    .select(`
      id, content, is_read, created_at,
      user_profiles ( username, profile_picture ),
      ad_id, parent_comment_id, user_id,
      user_ads ( title ),
      parent_comment:parent_comment_id (
        user_id
      )
    `)
    .in("parent_comment_id", userCommentIds);

  if (firstLevelError) {
    return NextResponse.json({ error: firstLevelError.message }, { status: 500 });
  }

  const firstLevelReplyIds = firstLevelReplies.map(r => r.id);

  // 3. Əgər 1-ci səviyyə reply-lar varsa, onlara yazılmış cavabları (2-ci səviyyə) tap
  let secondLevelReplies = [];
  if (firstLevelReplyIds.length > 0) {
    const { data: secondReplies, error: secondLevelError } = await supabase
      .from("comments")
      .select(`
        id, content, is_read, created_at,
        user_profiles ( username, profile_picture ),
        ad_id, parent_comment_id, user_id,
        user_ads ( title ),
        parent_comment:parent_comment_id (
          user_id
        )
      `)
      .in("parent_comment_id", firstLevelReplyIds);

    if (secondLevelError) {
      return NextResponse.json({ error: secondLevelError.message }, { status: 500 });
    }

    secondLevelReplies = secondReplies;
  }

  // 4. Bütün reply-ləri birləşdirib qaytar
  const allReplies = [...firstLevelReplies, ...secondLevelReplies];

  // Tarixə görə sırala (əgər istəyirsənsə)
  allReplies.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(allReplies);
}


export async function PATCH(req: Request) {
  const supabase = createClient();
  const { ids } = await req.json();

  const { error } = await supabase
    .from("comments")
    .update({ is_read: true })
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
