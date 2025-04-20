// app/page.tsx
import { createClient } from "@/utils/supabase/server";
import Hero from "@/components/hero";

export default async function Home() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  const isExpert = profile?.is_expert;

  const { data: questions } = await supabase
    .from("questions")
    .select("*, user_profiles(full_name)")
    .eq("is_answered", false)
    .order("created_at", { ascending: false });

  return (
    <>
      <Hero />
      <main className="p-6 max-w-3xl mx-auto space-y-6">
        {isExpert ? (
          <>
            <h2 className="text-2xl font-semibold">Cavabsız Suallar</h2>
            <ul className="space-y-4">
              {questions?.map((q) => (
                <li
                  key={q.id}
                  className="border p-4 rounded-lg shadow bg-white"
                >
                  <p><strong>Göndərən:</strong> {q.user_profiles?.full_name || "Anonim"}</p>
                  <p><strong>Sual:</strong> {q.text}</p>
                  {/* Burada cavab vermə formu da əlavə oluna bilər */}
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-lg">Ekspert deyilsiniz. Sual vermək üçün profil səhifəsinə keçin.</p>
        )}
      </main>
    </>
  );
}
