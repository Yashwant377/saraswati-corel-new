import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { ROLE_LABELS, ROLE_PERMISSIONS } from "@/lib/types";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";

export default function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const user = getSessionUser();
  if (!user) redirect("/admin/login");

  return (
    <AdminShell
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        roleLabel: ROLE_LABELS[user.role],
        mustChangePassword: user.mustChangePassword,
        permissions: ROLE_PERMISSIONS[user.role],
      }}
    >
      {children}
    </AdminShell>
  );
}
