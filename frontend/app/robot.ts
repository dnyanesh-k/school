import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/dashboard/", "/admin/", "/login", "/register"],
    },
    sitemap: "https://vidyatrackais.com/sitemap.xml",
  };
}
