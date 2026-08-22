import { setRequestLocale } from "next-intl/server";
import { LandingPage } from "@/components/landing/landing-page";

export default function Landing({ params: { locale } }: { params: { locale: string } }) {
  setRequestLocale(locale);
  return <LandingPage />;
}
