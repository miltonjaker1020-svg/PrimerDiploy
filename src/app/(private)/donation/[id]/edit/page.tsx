import { Text } from "@/components/i18n/language-provider";
import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import DonationForm from "@/components/donations/donation-form";
import PrivateLoading from "../../../loading";

async function EditDonation({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) redirect("/login");
  if (session.role !== "DONANTE") redirect("/dashboard");
  const { id } = await params;
  const donation = await prisma.donation.findFirst({ where: { id, donorId: session.userId } });
  if (!donation) notFound();
  if (donation.status !== "PENDIENTE") return <main className="p-8"><p><Text>{"Esta donación ya no se puede editar."}</Text></p><Link href="/dashboard"><Text>{"Volver al dashboard"}</Text></Link></main>;
  const products = await prisma.product.findMany({ select: { id: true, name: true, unit: true }, orderBy: { name: "asc" } });
  return (
  <main className="mx-auto max-w-2xl px-4 py-8">
    <h1 className="text-3xl font-bold">
      <Text>{"Editar donación"}</Text>
    </h1>
    <DonationForm products={products} initial={{ id, productId: donation.productId, quantity: donation.quantity, expirationDate: donation.expirationDate.toISOString() }} />
    </main>)
}
export default function Page(props: { params: Promise<{ id: string }> }) { return <Suspense fallback={<PrivateLoading />}><EditDonation {...props} /></Suspense>; }
