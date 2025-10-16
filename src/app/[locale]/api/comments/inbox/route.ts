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

  // 1. Get user's own comments
  const { data: userComments, error: userCommentsError } = await supabase
    .from("comments")
    .select("id")
    .eq("user_id", user.id);

  if (userCommentsError) {
    return NextResponse.json({ error: userCommentsError.message }, { status: 500 });
  }

  // 2. Get user's own ads
  const { data: userAds, error: userAdsError } = await supabase
    .from("user_ads")
    .select("id")
    .eq("user_id", user.id);

  if (userAdsError) {
    return NextResponse.json({ error: userAdsError.message }, { status: 500 });
  }

  const userCommentIds = userComments?.map(c => c.id) || [];
  const userAdIds = userAds?.map(a => a.id) || [];

  if (userCommentIds.length === 0 && userAdIds.length === 0) {
    return NextResponse.json([]);
  }

  // 3. Get replies to user's comments
  let firstLevelReplies: any[] = [];
  
  if (userCommentIds.length > 0) {
    const { data: replies, error: repliesError } = await supabase
      .from("comments")
      .select(`
        id, content, is_read, created_at,
        user_profiles ( full_name, username, profile_picture ),
        ad_id, parent_comment_id, user_id,
        user_ads ( title ),
        parent_comment:parent_comment_id (
          user_id
        )
      `)
      .in("parent_comment_id", userCommentIds);

    if (repliesError) {
      return NextResponse.json({ error: repliesError.message }, { status: 500 });
    }
    
    firstLevelReplies = replies || [];
  }

  // 4. Get comments on user's ads
  let commentsOnUserAds: any[] = [];
  
  if (userAdIds.length > 0) {
    const { data: adComments, error: adCommentsError } = await supabase
      .from("comments")
      .select(`
        id, content, is_read, created_at,
        user_profiles ( full_name, username, profile_picture ),
        ad_id, parent_comment_id, user_id,
        user_ads ( title ),
        parent_comment:parent_comment_id (
          user_id
        )
      `)
      .in("ad_id", userAdIds)
      .is("parent_comment_id", null)
      .neq("user_id", user.id);

    if (adCommentsError) {
      return NextResponse.json({ error: adCommentsError.message }, { status: 500 });
    }
    
    commentsOnUserAds = adComments || [];
  }

  // Combine all notifications
  const allNotifications = [...firstLevelReplies, ...commentsOnUserAds];

  // Clean up user_profiles structure
  allNotifications.forEach(notification => {
    if (notification.user_profiles && notification.user_profiles.length > 0) {
      const firstProfile = notification.user_profiles[0];
      notification.user_profiles = firstProfile;
    }
    
    if (notification.user_ads && notification.user_ads.length > 0) {
      const firstAd = notification.user_ads[0];
      notification.user_ads = firstAd;
    }
  });

  // Sort by most recent
  allNotifications.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  return NextResponse.json(allNotifications);
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
