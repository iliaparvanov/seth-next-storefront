"use client"

import { searchStreets, type StreetSearchResult } from "@lib/data/shipping"
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react"
import { ChevronDownMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useEffect, useState, useCallback } from "react"

type StreetAutocompleteProps = {
  provider: string
  cityId: number | null
  value: StreetSearchResult | null
  onChange: (street: StreetSearchResult | null) => void
  error?: string
  required?: boolean
  disabled?: boolean
  "data-testid"?: string
}

export default function StreetAutocomplete({
  provider,
  cityId,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  "data-testid": dataTestId,
}: StreetAutocompleteProps) {
  const [query, setQuery] = useState(value?.data.street_name || "")
  const [streets, setStreets] = useState<StreetSearchResult[]>([])
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

        // Don't search if we have a valid selection, no cityId, or query is too short
        if (!cityId || hasSelection || searchQuery.trim().length < 2) {
          setStreets([])
          setLoading(false)
          return
        }

        setLoading(true)
        setSearchError(null)

        timeoutId = setTimeout(async () => {
          try {
            const results = await searchStreets(provider, cityId, searchQuery)
            setStreets(results)
            
            if (results.length === 0 && searchQuery.trim().length >= 2) {
              setSearchError("No streets found for this search")
            }
          } catch (err) {
            console.error("Street search error:", err)
            setSearchError("Failed to search streets. Please try again.")
            setStreets([])
          } finally {
            setLoading(false)
          }
        }, 300) // 300ms debounce delay
      }
    })(),
    [provider, cityId]
  )

  // Trigger search when query or cityId changes, but not if we have a valid selection
  useEffect(() => {
    if (cityId) {
      debouncedSearch(query, !!value)
    } else {
      setStreets([])
    }
  }, [query, cityId, value, debouncedSearch])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value
    setQuery(newQuery)
    
    // Clear selection if user types over selected value
    if (value && newQuery !== value.data.street_name) {
      onChange(null)
    }
  }

  const handleSelect = (street: StreetSearchResult | null) => {
    if (street) {
      setQuery(street.data.street_name)
      onChange(street)
      setSearchError(null)
      setStreets([]) // Clear dropdown after selection
    } else {
      setQuery("")
      onChange(null)
    }
  }

  const displayError = error || searchError

  return (
    <div className="flex flex-col gap-y-2">
      <Combobox value={value} onChange={handleSelect} disabled={disabled}>
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
              displayValue={(street: StreetSearchResult | null) => street?.data.street_name || ""}
              onChange={handleInputChange}
              placeholder={disabled ? "Select a city first..." : "Search for a street..."}
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
            {streets.length === 0 && query.trim().length >= 2 && !loading ? (
              <div className="px-4 py-3 text-sm text-ui-fg-subtle">
                No streets found. Try a different search term.
              </div>
            ) : (
              streets.map((street) => (
                <ComboboxOption
                  key={street.id}
                  value={street}
                  className={({ focus }) =>
                    clx(
                      "relative cursor-pointer select-none px-4 py-3 transition-colors",
                      focus ? "bg-ui-bg-subtle" : "bg-ui-bg-base"
                    )
                  }
                >
                  {({ selected }) => (
                    <span
                      className={clx(
                        "block truncate text-sm",
                        selected ? "font-medium" : "font-normal"
                      )}
                    >
                      {street.data.street_name}
                    </span>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      </Combobox>

      {displayError && (
        <span className="text-sm text-rose-500" data-testid="street-error">
          {displayError}
        </span>
      )}

      {!disabled && (
        <p className="text-xs text-ui-fg-subtle">
          Start typing to search for your street
        </p>
      )}
    </div>
  )
}
