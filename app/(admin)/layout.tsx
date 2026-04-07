import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/app/components/admin/AdminSidebar";
import FCMProvider from "@/app/components/admin/FCMProvider";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login?redirectTo=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, cafe_id")
    .eq("id", user.id)
    .single();

  if (!profile || !["admin", "superadmin"].includes(profile.role)) {
    redirect("/");
  }

  return (
    <div className="min-h-screen bg-black flex">
      <AdminSidebar />
      <FCMProvider />
      <main className="flex-1 md:ml-64 pt-20 md:pt-8 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}
