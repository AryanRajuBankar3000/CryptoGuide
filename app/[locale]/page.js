import { Experience } from "@/app/components/crypto/experience";
import { setRequestLocale } from 'next-intl/server';

export default async function Page({ params }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Experience />;
}
