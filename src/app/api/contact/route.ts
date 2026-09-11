import { NextResponse } from "next/server";
import { submitContactCore } from "@/lib/contact/submit-core";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const result = await submitContactCore(formData);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown error";
    console.error("[contact] request failed:", reason);
    return NextResponse.json(
      {
        ok: false,
        message:
          "We couldn't send your message just now. Please try again in a moment.",
      },
      { status: 500 },
    );
  }
}
