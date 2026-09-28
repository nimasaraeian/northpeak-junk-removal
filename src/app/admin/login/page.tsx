import { redirect } from "next/navigation";
import { LoginForm } from "@/app/admin/login/LoginForm";
import { SetupScreen } from "@/components/admin/SetupScreen";
import { currentSession } from "@/lib/admin/auth";
import { isAdminConfigured } from "@/lib/admin/config";

export const metadata = {
  title: "Sign in",
  robots: { index: false, follow: false },
};

/**
 * Never prerendered.
 *
 * Without this the page is static whenever the build runs without
 * `DATABASE_URL`, because the setup branch below returns before anything
 * reads a cookie — and a deployment that later gains the env var would keep
 * serving the baked setup screen.
 */
export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }: PageProps<"/admin/login">) {
  if (!isAdminConfigured()) {
    return <SetupScreen />;
  }

  // Already signed in — no reason to show the form again.
  if (await currentSession()) {
    redirect("/admin");
  }

  const { next } = await searchParams;
  const destination = typeof next === "string" ? next : undefined;

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-16">
      <LoginForm next={destination} />
    </div>
  );
}
