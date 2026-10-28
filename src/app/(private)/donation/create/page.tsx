import { Text } from "@/components/i18n/language-provider";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import DonationForm from "@/components/donations/donation-form";
import PrivateLoading from "../../loading";

async function CreateDonation() {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "DONANTE") redirect("/dashboard");
  const products = await prisma.product.findMany({ select: { id: true, name: true, unit: true }, orderBy: { name: "asc" } });
  return <main className="mx-auto max-w-2xl px-4 py-8"><h1 className="text-3xl font-bold"><Text>{"Nueva donación"}</Text></h1><DonationForm products={products} /></main>;
}
export default function Page() { return <Suspense fallback={<PrivateLoading />}><CreateDonation /></Suspense>; }
