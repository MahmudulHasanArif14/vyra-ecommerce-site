import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const supabase = await createClient();

    await supabase.from("analytics_events").insert({
      event_name: body.event_name,
      session_id: body.session_id,
      page_url: body.page_url,
      metadata: body.metadata || {},
      user_agent: req.headers.get("user-agent") || null,
      referrer: req.headers.get("referer") || null,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
