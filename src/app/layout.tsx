import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { indexingAllowed, site, siteUrl } from "@/lib/site";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionReveal from "@/components/common/SectionReveal";

import { Be_Vietnam_Pro, Source_Sans_3 } from "next/font/google";
import { SiteAnalytics } from "@/components/analytics/site-analytics";
import { analyticsEnabled } from "@/lib/analytics";

const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin"],
  variable: "--font-be-vietnam",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  variable: "--font-source-sans",
  display: "swap",
});


export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "VietBites Toronto | Vietnamese Desserts And Banh Mi",
    template: "%s | VietBites Toronto",
  },
  description:
    site.description,
  openGraph: {
    siteName: site.name,
    locale: site.locale,
    type: "website",
    images: ["/opengraph-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/twitter-image.png"],
  },
  robots: indexingAllowed()
    ? { index: true, follow: true }
    : { index: false, follow: false },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/icon.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "192x192" }],
  },
};

/* Business details for search engines (schema.org Restaurant). */
const restaurantJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: site.name,
  url: site.url,
  image: `${site.url}/opengraph-image.png`,
  description: site.description,
  telephone: site.phone,
  hasMap: site.googleMapsUrl,
  address: {
    "@type": "PostalAddress",
    streetAddress: site.address.street,
    addressLocality: site.address.city,
    addressRegion: site.address.region,
    postalCode: site.address.postalCode,
    addressCountry: site.address.country,
  },
  servesCuisine: ["Vietnamese"],
  priceRange: "$",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
        <body
            className={`${beVietnam.variable} ${sourceSans.variable} antialiased`}
        >
            <Navbar />
            <SectionReveal />
            <main>{children}</main>
            <Footer />

            <JsonLd data={restaurantJsonLd} />
            {analyticsEnabled() && <SiteAnalytics />}
        </body>
    </html>
  );
}
