"use client"

import { searchOffices, type OfficeSearchResult } from "@lib/data/shipping"
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react"
import { ChevronDownMini } from "@medusajs/icons"
import { clx } from "@medusajs/ui"
import { useEffect, useState, useCallback } from "react"

type OfficeAutocompleteProps = {
  provider: string
  cityId: number | null
  value: OfficeSearchResult | null
  onChange: (office: OfficeSearchResult | null) => void
  error?: string
  required?: boolean
  disabled?: boolean
  "data-testid"?: string
}

export default function OfficeAutocomplete({
  provider,
  cityId,
  value,
  onChange,
  error,
  required = false,
  disabled = false,
  "data-testid": dataTestId,
}: OfficeAutocompleteProps) {
  const [query, setQuery] = useState(value?.data.office_name || "")
  const [offices, setOffices] = useState<OfficeSearchResult[]>([])
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

        // Don't search if we have a valid selection or no cityId
        if (!cityId || hasSelection) {
          setOffices([])
          setLoading(false)
          return
        }

        setLoading(true)
        setSearchError(null)

        timeoutId = setTimeout(async () => {
          try {
            const results = await searchOffices(provider, cityId, searchQuery)
            setOffices(results)
            
            if (results.length === 0) {
              setSearchError("Няма намерени офиси за това търсене")
            }
          } catch (err) {
            console.error("Office search error:", err)
            setSearchError("Неудача при търсене на офиси. Моля, опитайте отново.")
            setOffices([])
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
      setOffices([])
    }
  }, [query, cityId, value, debouncedSearch])

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value
    setQuery(newQuery)
    
    // Clear selection if user types over selected value
    if (value && newQuery !== value.data.office_name) {
      onChange(null)
    }
  }

  const handleSelect = (office: OfficeSearchResult | null) => {
    if (office) {
      setQuery(office.data.office_name)
      onChange(office)
      setSearchError(null)
      setOffices([]) // Clear dropdown after selection
    } else {
      setQuery("")
      onChange(null)
    }
  }

  const displayError = error || searchError

  return (
    <div className="flex flex-col gap-y-2">
      <Combobox value={value} onChange={handleSelect} disabled={disabled || !cityId}>
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
              displayValue={(office: OfficeSearchResult | null) => office?.data.office_name || ""}
              onChange={handleInputChange}
              placeholder={!cityId ? "Първо изберете град" : "Търсете офис или преглед на всички..."}
              required={required}
              disabled={disabled || !cityId}
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
            {offices.length === 0 && !loading && cityId ? (
              <div className="px-4 py-3 text-sm text-ui-fg-subtle">
                Няма намерени офиси. Опитайте със друг термин.
              </div>
            ) : (
              offices.map((office) => (
                <ComboboxOption
                  key={office.id}
                  value={office}
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
                        {office.data.office_name}
                      </span>
                      <span className="text-xs text-ui-fg-subtle">
                        {office.data.address}
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
        <span className="text-sm text-rose-500" data-testid="office-error">
          {displayError}
        </span>
      )}

      <p className="text-xs text-ui-fg-subtle">
        {!cityId ? "Изберете град, за да видите налични офиси" : "Търсете или преглеждайте всички офиси в избрания град"}
      </p>
    </div>
  )
}

