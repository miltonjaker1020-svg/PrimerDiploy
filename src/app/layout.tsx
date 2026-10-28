import { LanguageProvider } from "@/components/i18n/language-provider";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FoodShare",
  description: "Catálogo y gestión de donaciones de alimentos",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col"><LanguageProvider>{children}</LanguageProvider></body>
    </html>
  );
}
