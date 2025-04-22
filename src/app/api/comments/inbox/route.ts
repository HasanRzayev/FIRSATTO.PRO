import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

 
interface Comment {
  id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  user_profiles: {
    username: string;
    profile_picture: string;
  }[]; 
  ad_id: string;
  parent_comment_id: string | null;
  user_id: string;
  user_ads: {
    title: string;
  }[]; 
  parent_comment: {
    user_id: string;
  }[];  
}

export async function GET(req: Request) {
  const supabase = await createClient();  

 
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: error?.message || "User not found" }, { status: 401 });
  }

 
  const { data: userComments, error: userCommentsError } = await supabase
    .from("comments")
    .select("id")
    .eq("user_id", user.id);

  if (userCommentsError) {
    return NextResponse.json({ error: userCommentsError.message }, { status: 500 });
  }

  const userCommentIds = userComments.map(c => c.id);
  if (userCommentIds.length === 0) return NextResponse.json([]);

 
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

 
  firstLevelReplies.forEach(reply => {
    if (reply.user_profiles && reply.user_profiles.length > 0) {
      const firstProfile = reply.user_profiles[0];
      reply.user_profiles = [firstProfile];
    }
  });

  const firstLevelReplyIds = firstLevelReplies.map(r => r.id);

 
  let secondLevelReplies: Comment[] = [];
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

 
    secondReplies.forEach(reply => {
      if (reply.user_profiles && reply.user_profiles.length > 0) {
        const firstProfile = reply.user_profiles[0];
        reply.user_profiles = [firstProfile];
      }
    });

    secondLevelReplies = secondReplies;
  }

 
  const allReplies = [...firstLevelReplies, ...secondLevelReplies];
  allReplies.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  return NextResponse.json(allReplies);
}

export async function PATCH(req: Request) {
  const supabase = await createClient();  // Await the creation of the Supabase client

  const { ids } = await req.json();  // Expecting the ids of comments to update

  const { error } = await supabase
    .from("comments")
    .update({ is_read: true })
    .in("id", ids);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ success: true });
}
