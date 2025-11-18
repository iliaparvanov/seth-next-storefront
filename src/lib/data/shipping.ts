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

export type QuarterSearchResult = {
  id: string
  label: string
  data: {
    quarter_id: number
    quarter_name: string
    city_id: number
  }
}

export type QuarterSearchResponse = {
  quarters: QuarterSearchResult[]
}

export type StreetSearchResult = {
  id: string
  label: string
  data: {
    street_id: number
    street_name: string
    city_id: number
  }
}

export type StreetSearchResponse = {
  streets: StreetSearchResult[]
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

/**
 * Search for quarters in a specific city
 * @param provider - The shipping provider (e.g., "econt_econt")
 * @param cityId - The city ID to search quarters in
 * @param query - Search query to filter quarters
 * @returns Array of quarter search results
 */
export async function searchQuarters(
  provider: string,
  cityId: number,
  query: string
): Promise<QuarterSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  try {
    const url = `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/shipping/quarters?provider=${encodeURIComponent(provider)}&cityId=${cityId}&query=${encodeURIComponent(query)}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Failed to search quarters:", response.status, response.statusText)
      return []
    }

    const data: QuarterSearchResponse = await response.json()
    return data.quarters || []
  } catch (error) {
    console.error("Error searching quarters:", error)
    return []
  }
}

/**
 * Search for streets in a specific city
 * @param provider - The shipping provider (e.g., "econt_econt")
 * @param cityId - The city ID to search streets in
 * @param query - Search query to filter streets
 * @returns Array of street search results
 */
export async function searchStreets(
  provider: string,
  cityId: number,
  query: string
): Promise<StreetSearchResult[]> {
  if (!query || query.trim().length < 2) {
    return []
  }

  try {
    const url = `${process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"}/store/shipping/streets?provider=${encodeURIComponent(provider)}&cityId=${cityId}&query=${encodeURIComponent(query)}`

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-publishable-api-key": process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || "",
      },
      cache: "no-store",
    })

    if (!response.ok) {
      console.error("Failed to search streets:", response.status, response.statusText)
      return []
    }

    const data: StreetSearchResponse = await response.json()
    return data.streets || []
  } catch (error) {
    console.error("Error searching streets:", error)
    return []
  }
}
