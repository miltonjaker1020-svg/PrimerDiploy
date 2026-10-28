import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-helpers";
import PrivateLoading from "../loading";
import DashboardClient from "./dashboard-client";

async function DashboardAccess() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role === "ADMINISTRADOR") redirect("/admin");
  if (session.role !== "DONANTE" && session.role !== "BENEFICIARIO") redirect("/login");
  return <DashboardClient role={session.role} />;
}

export default function DashboardPage() {
  return <Suspense fallback={<PrivateLoading />}><DashboardAccess /></Suspense>;
}
