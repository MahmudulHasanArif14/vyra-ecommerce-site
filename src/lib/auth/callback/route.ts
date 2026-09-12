import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=no_code`);
  }

  const cookieStore = await cookies();
  const redirectResponse = NextResponse.redirect(`${origin}${next}`);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
            redirectResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    console.error("Exchange failed:", error?.message);
    return NextResponse.redirect(`${origin}/login?error=auth_failed`);
  }

  const user = data.user;
  console.log("Authenticated:", user.email);

  // 1. Upsert profile
  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.email,
      full_name:
        user.user_metadata?.full_name || user.user_metadata?.name || "",
      avatar_url: user.user_metadata?.avatar_url || null,
    },
    { onConflict: "id" },
  );

  if (profileError) {
    console.error("Profile upsert failed:", profileError);
  } else {
    console.log("Profile upserted for", user.email);
  }

  // 2. Link guest orders with matching email
  if (user.email) {
    const { data: linkedOrders, error: linkError } = await supabase
      .from("orders")
      .update({ user_id: user.id })
      .eq("guest_email", user.email)
      .is("user_id", null)
      .select("order_number");

    if (linkError) {
      console.error("Failed to link guest orders:", linkError);
    } else if (linkedOrders?.length) {
      console.log(
        `Linked ${linkedOrders.length} guest order(s):`,
        linkedOrders.map((o) => o.order_number).join(", "),
      );
    }
  }

  return redirectResponse;
}
