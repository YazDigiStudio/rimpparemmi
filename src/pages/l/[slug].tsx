// pages/l/[slug].tsx
// Public short link: /l/<slug> redirects to the file or web address saved
// for that slug by the admin QR tool. Renders nothing itself.

import type { GetServerSideProps } from "next";
import { getLink, isValidSlug, isHttpsUrl } from "@/lib/links/linkStore";

export const getServerSideProps: GetServerSideProps = async ({
  params,
  res,
}) => {
  const slug = typeof params?.slug === "string" ? params.slug : "";
  if (!isValidSlug(slug)) return { notFound: true };

  const link = await getLink(slug);
  if (!link || !isHttpsUrl(link.url)) return { notFound: true };

  // Cached for a minute so a replaced file goes live quickly
  res.setHeader(
    "Cache-Control",
    "public, s-maxage=60, stale-while-revalidate=300"
  );
  // 302 (temporary) so browsers never cache the old target after "replace"
  return { redirect: { destination: link.url, permanent: false } };
};

export default function ShortLink() {
  return null;
}
