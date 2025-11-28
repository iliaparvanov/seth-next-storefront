"use client"

import { searchCities, type CitySearchResult } from "@lib/data/shipping"
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react"
import { ChevronDownMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useEffect, useState, useCallback } from "react"

type CityAutocompleteProps = {
  provider: string
  value: CitySearchResult | null
  onChange: (city: CitySearchResult | null) => void
  error?: string
  required?: boolean
  "data-testid"?: string
}

export default function CityAutocomplete({
  provider,
  value,
  onChange,
  error,
  required = false,
  "data-testid": dataTestId,
}: CityAutocompleteProps) {
  const [query, setQuery] = useState(value?.data.city_name || "")
  const [cities, setCities] = useState<CitySearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  // Debounced search function
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId: NodeJS.Timeout | null = null
      return (searchQuery: string, hasSelection: boolean) => {
        if (timeoutId) {
          clearTimeout(timeoutId)
        }

        // Don't search if we have a valid selection or query is too short
        if (hasSelection || searchQuery.trim().length < 2) {
          setCities([])
          setLoading(false)
          return
        }

        setLoading(true)
        setSearchError(null)

        timeoutId = setTimeout(async () => {
          try {
            const results = await searchCities(provider, searchQuery)
            setCities(results)
            
            if (results.length === 0 && searchQuery.trim().length >= 2) {
              setSearchError("Няма намерени градове за това търсене")
            }
          } catch (err) {
            console.error("City search error:", err)
            setSearchError("Неудача при търсене на градове. Моля, опитайте отново.")
            setCities([])
          } finally {
            setLoading(false)
          }
        }, 300) // 300ms debounce delay
      }
    })(),
    [provider]
  )

  // Trigger search when query changes, but not if we have a valid selection
  useEffect(() => {
    debouncedSearch(query, !!value)
  }, [query, value, debouncedSearch])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value
    setQuery(newQuery)
    
    // Clear selection if user types over selected value
    if (value && newQuery !== value.data.city_name) {
      onChange(null)
    }
  }

  const handleSelect = (city: CitySearchResult | null) => {
    if (city) {
      setQuery(city.data.city_name)
      onChange(city)
      setSearchError(null)
      setCities([]) // Clear dropdown after selection
    } else {
      setQuery("")
      onChange(null)
    }
  }

  const displayError = error || searchError

  return (
    <div className="flex flex-col gap-y-2">
      <Combobox value={value} onChange={handleSelect}>
        <div className="relative">
          <div className="relative">
            <ComboboxInput
              className={clx(
                "w-full rounded-md border bg-ui-bg-field px-3 py-2 text-base transition-colors",
                "placeholder:text-ui-fg-subtle",
                "hover:bg-ui-bg-field-hover",
                "focus:outline-none focus:ring-2 focus:ring-ui-fg-interactive",
                "disabled:cursor-not-allowed disabled:bg-ui-bg-disabled disabled:text-ui-fg-disabled",
                displayError ? "border-ui-border-error" : "border-ui-border-base"
              )}
              displayValue={(city: CitySearchResult | null) => city?.data.city_name || ""}
              onChange={handleInputChange}
              placeholder="Търсете град..."
              required={required}
              data-testid={dataTestId}
            />
            <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
              <ChevronDownMini className="h-5 w-5 text-ui-fg-muted" />
            </ComboboxButton>
          </div>

          {loading && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-ui-fg-muted border-t-transparent" />
            </div>
          )}

          <ComboboxOptions
            className={clx(
              "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-ui-bg-base shadow-elevation-flyout",
              "border border-ui-border-base",
              "empty:invisible"
            )}
          >
            {cities.length === 0 && query.trim().length >= 2 && !loading ? (
              <div className="px-4 py-3 text-sm text-ui-fg-subtle">
                Няма намерени градове. Опитайте със друг термин.
              </div>
            ) : (
              cities.map((city) => (
                <ComboboxOption
                  key={city.id}
                  value={city}
                  className={({ focus }) =>
                    clx(
                      "relative cursor-pointer select-none px-4 py-3 transition-colors",
                      focus ? "bg-ui-bg-subtle" : "bg-ui-bg-base"
                    )
                  }
                >
                  {({ selected }) => (
                    <div className="flex flex-col">
                      <span
                        className={clx(
                          "block truncate text-sm",
                          selected ? "font-medium" : "font-normal"
                        )}
                      >
                        {city.data.city_name}
                      </span>
                      <span className="text-xs text-ui-fg-subtle">
                        Пощенски код: {city.data.postal_code}
                      </span>
                    </div>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      </Combobox>

      {displayError && (
        <span className="text-sm text-rose-500" data-testid="city-error">
          {displayError}
        </span>
      )}

      <p className="text-xs text-ui-fg-subtle">
        Започнете писане, за да търсите вашия град
      </p>
    </div>
  )
}
