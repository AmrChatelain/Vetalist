import { MetadataRoute } from "next"
import db from "@/lib/db"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://vetalist.fr"

  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url:             baseUrl,
      lastModified:    new Date(),
      changeFrequency: "weekly",
      priority:        1,
    },
    {
      url:             `${baseUrl}/search`,
      lastModified:    new Date(),
      changeFrequency: "daily",
      priority:        0.9,
    },
    {
      url:             `${baseUrl}/register`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.7,
    },
    {
      url:             `${baseUrl}/login`,
      lastModified:    new Date(),
      changeFrequency: "monthly",
      priority:        0.5,
    },
  ]

  const vets = await db.vetProfile.findMany({
    where:  { status: "ACTIVE", isActive: true },
    select: { id: true },
  })

  const vetRoutes: MetadataRoute.Sitemap = vets.map((vet) => ({
    url:             `${baseUrl}/vets/${vet.id}`,
    lastModified:    new Date(),
    changeFrequency: "weekly",
    priority:        0.8,
  }))

  return [...staticRoutes, ...vetRoutes]
}