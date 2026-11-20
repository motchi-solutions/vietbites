import type { MetadataRoute } from "next";

import { absoluteUrl } from "@/lib/site";

/** Public pages. Add new public routes here. */
const publicRoutes = ["/", "/menu", "/catering", "/story", "/visit"];

export default function sitemap(): MetadataRoute.Sitemap {
    return publicRoutes.map((path) => ({ url: absoluteUrl(path) }));
}
