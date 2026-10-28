import { LanguageSelect } from "@/components/i18n/language-provider";
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8"><div className="text-right"><LanguageSelect /></div>{children}</div>
    </div>
  );
}
