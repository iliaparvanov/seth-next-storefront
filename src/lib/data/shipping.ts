"use server"

import { sdk } from "@lib/config"

export type CitySearchResult = {
  id: string
  label: string
  data: {
    city_id: number
    city_name: string
    postal_code: string
  }
}

export type CitySearchResponse = {
  cities: CitySearchResult[]
}

export type OfficeSearchResult = {
  id: string
  label: string
  data: {
    office_id: number
    office_code: string
    office_name: string
    city_id: number
    city_name: string
    address: string
    postal_code: string
  }
}

export type OfficeSearchResponse = {
  offices: OfficeSearchResult[]
}

/**
 * Search for cities from the backend
 * @param provider - The shipping provider (e.g., "econt")
 * @param query - Search query (e.g., city name)
 * @returns Array of city search results
 */
export async function searchCities(
  provider: string,
  query: string
): Promise<CitySearchResult[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  try {
    const response = await fetch(
      `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/shipping/cities?provider=${encodeURIComponent(provider)}&query=${encodeURIComponent(query)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
        },
        cache: "no-store",
      }
    )

    if (!response.ok) {
      console.error("Failed to search cities:", response.status, response.statusText)
      return []
    }

    const data: CitySearchResponse = await response.json()
    return data.cities || []
  } catch (error) {
    console.error("Error searching cities:", error)
    return []
  }
}

/**
 * Search for office pickup locations in a specific city
 * @param provider - The shipping provider (e.g., "econt")
 * @param cityId - The city ID to search offices in
 * @param query - Optional search query to filter offices
 * @returns Array of office search results
 */
export async function searchOffices(
  provider: string,
  cityId: number,
  query?: string
): Promise<OfficeSearchResult[]> {
  try {
    let url = `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/shipping/offices?provider=${encodeURIComponent(provider)}&cityId=${cityId}`
    
    if (query && query.trim().length > 0) {
      url += `&query=${encodeURIComponent(query)}`
    }

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Failed to search offices:", response.status, response.statusText)
      return []
    }

    const data: OfficeSearchResponse = await response.json()
    return data.offices || []
  } catch (error) {
    console.error("Error searching offices:", error)
    return []
  }
}
