import { getAuthUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
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
    return <div data-area="admin" className="admroot -mt-16">{children}</div>;
  }

  const [blogs, projects, skills] = await Promise.all([
    prisma.blog.count().catch(() => 0),
    prisma.project.count().catch(() => 0),
    prisma.skill.count().catch(() => 0),
  ]);

  return (
    <div data-area="admin" className="admroot -mt-16">
      <div className="adm">
        <AdminSidebar counts={{ blogs, projects, skills }} />
        <main className="amain">{children}</main>
      </div>
    </div>
  );
}
