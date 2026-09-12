import { NextResponse } from "next/server";
import { submitContactCore, submitContactLead } from "@/lib/contact/submit-core";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") ?? "";

    if (contentType.includes("application/json")) {
      const body = (await request.json()) as {
        name?: string;
        email?: string;
        phone?: string;
        message?: string;
        photoCount?: number;
      };

      const result = await submitContactLead({
        name: String(body.name ?? ""),
        email: String(body.email ?? ""),
        phone: String(body.phone ?? ""),
        message: String(body.message ?? ""),
        photoCount: Number(body.photoCount ?? 0) || 0,
      });

      return NextResponse.json(result, { status: result.ok ? 200 : 400 });
    }

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
