/* Site identity and business details. Shared Motchi standard (AGENTS.md,
   "Website standard"). Business facts live here, not in environment variables. */
export const site = {
    name: "VietBites",
    /** Production origin. www.vietbites.ca redirects here. */
    url: "https://vietbites.ca",
    description:
        "VietBites is a Vietnamese restaurant and cafe in Downtown Toronto serving bánh mì, chè sweet soups, drinks, and desserts inspired by Vietnamese culture from Hải Phòng.",
    locale: "en_CA",
    phone: "(437) 607-8296",
    address: {
        street: "246 Gerrard St E",
        city: "Toronto",
        region: "ON",
        postalCode: "M5A 2G2",
        country: "CA",
        full: "246 Gerrard St E, Toronto, ON M5A 2G2",
    },
    googleMapsUrl: "https://www.google.com/maps/place/Vietbites/@43.6620262,-79.3720876,17z/data=!3m1!4b1!4m6!3m5!1s0x89d4cbc0f751d687:0x881dfbd1330e66d6!8m2!3d43.6620262!4d-79.3695127!16s%2Fg%2F11x6gcgm8t?entry=ttu&g_ep=EgoyMDI2MDUxMy4wIKXMDSoASAFQAw%3D%3D",
} as const;

/* Site URLs and indexing. Shared Motchi standard (AGENTS.md, "Website standard").

   The production origin is set in site.url, so no environment variable is
   needed. SITE_URL (server-only, optional) overrides it, for example for
   another local port. Vercel sets VERCEL_ENV and VERCEL_BRANCH_URL. */

const localUrl = "http://localhost:3000";

/** This deployment's origin: SITE_URL if set, localhost in development, the
    branch URL on Vercel previews, otherwise the production origin. */
export function siteUrl(): string {
    const override = process.env.SITE_URL?.trim();
    if (override) return override.replace(/\/+$/, "");
    if (process.env.NODE_ENV === "development") return localUrl;
    const branchUrl = process.env.VERCEL_BRANCH_URL?.trim();
    if (process.env.VERCEL_ENV === "preview" && branchUrl) return `https://${branchUrl}`;
    return site.url;
}

/** Absolute URL on this deployment, for metadata, sitemaps, emails and redirects. */
export function absoluteUrl(path = "/"): string {
    return new URL(path, `${siteUrl()}/`).href;
}

/** Search engines may index Vercel Production only. Previews and local builds
    are served with noindex and a robots.txt that keeps crawlers out. */
export function indexingAllowed(): boolean {
    return process.env.VERCEL_ENV === "production";
}
