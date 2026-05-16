import { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     ["/", "/search", "/vets/"],
        disallow:  [
          "/dashboard/",
          "/book/",
          "/api/",
          "/onboarding/",
          "/pending-approval/",
          "/reset-password/",
          "/forgot-password/",
        ],
      },
    ],
    sitemap: "https://vetalist.fr/sitemap.xml",
  }
}