import { NextResponse } from "next/server";
import { submitContactPhoto } from "@/lib/contact/submit-core";
import { photoFromFormDataEntry } from "@/lib/estimate/photos";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const requestId = String(formData.get("requestId") ?? "").trim();
    const index = Number(formData.get("index") ?? 1);
    const total = Number(formData.get("total") ?? 1);
    const file = photoFromFormDataEntry(formData.get("photo"));

    if (!file) {
      return NextResponse.json(
        { ok: false, message: "No photo was attached." },
        { status: 400 },
      );
    }

    const result = await submitContactPhoto(requestId, file, {
      index: Number.isFinite(index) && index > 0 ? index : 1,
      total: Number.isFinite(total) && total > 0 ? total : 1,
    });

    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  } catch (error) {
    const reason = error instanceof Error ? error.message : "unknown error";
    console.error("[contact][photos] request failed:", reason);
    return NextResponse.json(
      {
        ok: false,
        message: "One photo could not be uploaded. Your message was still received.",
      },
      { status: 500 },
    );
  }
}
