"use client"

import { searchQuarters, type QuarterSearchResult } from "@lib/data/shipping"
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react"
import { ChevronDownMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useEffect, useState, useCallback } from "react"

type QuarterAutocompleteProps = {
  provider: string
  cityId: number | null
  value: QuarterSearchResult | null
  onChange: (quarter: QuarterSearchResult | null) => void
  error?: string
  required?: boolean
  disabled?: boolean
  "data-testid"?: string
}

export default function QuarterAutocomplete({
  provider,
  cityId,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  "data-testid": dataTestId,
}: QuarterAutocompleteProps) {
  const [query, setQuery] = useState(value?.data.quarter_name || "")
  const [quarters, setQuarters] = useState<QuarterSearchResult[]>([])
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
          setQuarters([])
          setLoading(false)
          return
        }

        setLoading(true)
        setSearchError(null)

        timeoutId = setTimeout(async () => {
          try {
            const results = await searchQuarters(provider, cityId, searchQuery)
            setQuarters(results)
            
            if (results.length === 0 && searchQuery.trim().length >= 2) {
              setSearchError("No quarters found for this search")
            }
          } catch (err) {
            console.error("Quarter search error:", err)
            setSearchError("Failed to search quarters. Please try again.")
            setQuarters([])
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
      setQuarters([])
    }
  }, [query, cityId, value, debouncedSearch])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value
    setQuery(newQuery)
    
    // Clear selection if user types over selected value
    if (value && newQuery !== value.data.quarter_name) {
      onChange(null)
    }
  }

  const handleSelect = (quarter: QuarterSearchResult | null) => {
    if (quarter) {
      setQuery(quarter.data.quarter_name)
      onChange(quarter)
      setSearchError(null)
      setQuarters([]) // Clear dropdown after selection
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
              displayValue={(quarter: QuarterSearchResult | null) => quarter?.data.quarter_name || ""}
              onChange={handleInputChange}
              placeholder={disabled ? "Select a city first..." : "Search for a quarter..."}
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
            {quarters.length === 0 && query.trim().length >= 2 && !loading ? (
              <div className="px-4 py-3 text-sm text-ui-fg-subtle">
                No quarters found. Try a different search term.
              </div>
            ) : (
              quarters.map((quarter) => (
                <ComboboxOption
                  key={quarter.id}
                  value={quarter}
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
                      {quarter.data.quarter_name}
                    </span>
                  )}
                </ComboboxOption>
              ))
            )}
          </ComboboxOptions>
        </div>
      </Combobox>

      {displayError && (
        <span className="text-sm text-rose-500" data-testid="quarter-error">
          {displayError}
        </span>
      )}

      {!disabled && (
        <p className="text-xs text-ui-fg-subtle">
          Start typing to search for your quarter
        </p>
      )}
    </div>
  )
}
