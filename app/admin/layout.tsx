import { getAuthUser } from "@/lib/auth";
import AdminSidebar from "@/components/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getAuthUser();

  // Middleware (layer 1) already redirects every unauthenticated request to
  // /admin/login BEFORE this layout runs — so `!user` here means we are on
  // the login page itself.  Render it bare (no sidebar).
  //
  // Exception: if middleware is somehow bypassed the layout still catches it —
  // `getAuthUser` does a full JWT + DB lookup, so an expired/revoked session
  // also lands here with `!user` and gets the login page shell, while the
  // API-level `requireAuth` (layer 3) blocks any data mutation.
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex !pt-0">
      <AdminSidebar />
      <main className="flex-1 ml-64 min-h-screen">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
