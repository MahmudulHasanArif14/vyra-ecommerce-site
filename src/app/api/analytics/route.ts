import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    const { error } = await supabase.from("analytics_events").insert({
      event_name: body.event_name,
      session_id: body.session_id || null,
      page_url: body.page_url || null,
      metadata: body.metadata || {},
      user_agent: req.headers.get("user-agent") || null,
      referrer: req.headers.get("referer") || null,
    });

    if (error) {
      console.error("Analytics insert error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Analytics route error:", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
