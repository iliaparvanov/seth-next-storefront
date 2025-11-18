import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState, useImperativeHandle, forwardRef } from "react"
import AddressSelect from "../address-select"
import CityAutocomplete from "../city-autocomplete"
import QuarterAutocomplete from "../quarter-autocomplete"
import StreetAutocomplete from "../street-autocomplete"
import { type CitySearchResult, type QuarterSearchResult, type StreetSearchResult } from "@lib/data/shipping"

const ShippingAddress = forwardRef<
  { validateForm: () => boolean },
  {
    customer: HttpTypes.StoreCustomer | null
    cart: HttpTypes.StoreCart | null
    checked: boolean
    onChange: () => void
    providerId?: string | null
  }
>(({ customer, cart, checked, onChange, providerId }, ref) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || "",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.address_2": cart?.shipping_address?.address_2 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": "bg", // Hardcoded to Bulgaria
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
    // Additional Bulgarian address fields
    street_number: "",
    blok: "",
    entrance: "",
    floor: "",
    apartment: "",
  })

  const [selectedCity, setSelectedCity] = useState<CitySearchResult | null>(null)
  const [selectedQuarter, setSelectedQuarter] = useState<QuarterSearchResult | null>(null)
  const [selectedStreet, setSelectedStreet] = useState<StreetSearchResult | null>(null)
  const [cityError, setCityError] = useState<string | null>(null)
  const [quarterError, setQuarterError] = useState<string | null>(null)
  const [streetError, setStreetError] = useState<string | null>(null)
  const [addressValidationError, setAddressValidationError] = useState<string | null>(null)

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  // check if customer has saved addresses that are in the current region
  const addressesInRegion = useMemo(
    () =>
      customer?.addresses.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || "",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  useEffect(() => {
    // Ensure cart is not null and has a shipping_address before setting form data
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart]) // Add cart as a dependency

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  // Validation: User must provide at least (Street OR Quarter) AND (Number OR Blok)
  const validateAddressFields = (): boolean => {
    setAddressValidationError(null)
    
    const hasStreet = !!selectedStreet
    const hasQuarter = !!selectedQuarter
    const hasNumber = !!formData.street_number?.trim()
    const hasBlok = !!formData.blok?.trim()
    
    // Check if at least one location identifier (street or quarter) is provided
    const hasLocation = hasStreet || hasQuarter
    
    // Check if at least one building identifier (number or blok) is provided
    const hasBuilding = hasNumber || hasBlok
    
    if (!hasLocation) {
      setAddressValidationError("Please select at least a street or quarter")
      if (!hasStreet) setStreetError("Required if quarter not provided")
      if (!hasQuarter) setQuarterError("Required if street not provided")
      return false
    }
    
    if (!hasBuilding) {
      setAddressValidationError("Please enter at least a number or blok")
      return false
    }
    
    return true
  }

  const handleCitySelect = (city: CitySearchResult | null) => {
    setSelectedCity(city)
    setCityError(null)
    
    // Reset dependent selections when city changes
    if (selectedQuarter && city?.data.city_id !== selectedQuarter.data.city_id) {
      setSelectedQuarter(null)
      setQuarterError(null)
    }
    if (selectedStreet && city?.data.city_id !== selectedStreet.data.city_id) {
      setSelectedStreet(null)
      setStreetError(null)
    }
    
    // Update form data
    if (city) {
      setFormData({
        ...formData,
        "shipping_address.city": city.data.city_name,
        "shipping_address.postal_code": city.data.postal_code,
      })
    } else {
      setFormData({
        ...formData,
        "shipping_address.city": "",
        "shipping_address.postal_code": "",
      })
    }
  }

  const handleQuarterSelect = (quarter: QuarterSearchResult | null) => {
    setSelectedQuarter(quarter)
    setQuarterError(null)
    setAddressValidationError(null)
    
    // Update province field with quarter name
    if (quarter) {
      setFormData((prev: Record<string, any>) => {
        // If no street selected, build address_1 from quarter
        const parts: string[] = []
        if (!selectedStreet) {
          parts.push(quarter.data.quarter_name)
          if (prev.street_number) parts.push(prev.street_number)
          if (prev.blok) parts.push(`бл. ${prev.blok}`)
        } else {
          // Keep street-based address_1
          parts.push(selectedStreet.data.street_name)
          if (prev.street_number) parts.push(prev.street_number)
          if (prev.blok) parts.push(`бл. ${prev.blok}`)
        }
        
        return {
          ...prev,
          "shipping_address.province": quarter.data.quarter_name,
          "shipping_address.address_1": parts.join(" "),
        }
      })
    } else {
      setFormData((prev: Record<string, any>) => ({
        ...prev,
        "shipping_address.province": "",
      }))
    }
  }

  const handleStreetSelect = (street: StreetSearchResult | null) => {
    setSelectedStreet(street)
    setStreetError(null)
    setAddressValidationError(null)
    
    // Build address_1 from street, number, and blok
    if (street) {
      const parts: string[] = [street.data.street_name]
      if (formData.street_number) parts.push(formData.street_number)
      if (formData.blok) parts.push(`бл. ${formData.blok}`)
      
      setFormData({
        ...formData,
        "shipping_address.address_1": parts.join(" "),
      })
    } else {
      // If no street but we have quarter, rebuild address_1 with quarter info
      rebuildAddress1WithoutStreet()
    }
  }

  const rebuildAddress1WithoutStreet = () => {
    const parts: string[] = []
    if (selectedQuarter) parts.push(selectedQuarter.data.quarter_name)
    if (formData.street_number) parts.push(formData.street_number)
    if (formData.blok) parts.push(`бл. ${formData.blok}`)
    
    setFormData((prev: Record<string, any>) => ({
      ...prev,
      "shipping_address.address_1": parts.join(" "),
    }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const number = e.target.value
    setAddressValidationError(null)
    
    setFormData((prev: Record<string, any>) => {
      const updated = { ...prev, street_number: number }
      
      // Rebuild address_1 with street/quarter and number/blok
      const parts: string[] = []
      if (selectedStreet) {
        parts.push(selectedStreet.data.street_name)
      } else if (selectedQuarter) {
        parts.push(selectedQuarter.data.quarter_name)
      }
      if (number) parts.push(number)
      if (prev.blok) parts.push(`бл. ${prev.blok}`)
      
      return {
        ...updated,
        "shipping_address.address_1": parts.join(" "),
      }
    })
  }

  const handleBlokChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const blok = e.target.value
    setAddressValidationError(null)
    
    setFormData((prev: Record<string, any>) => {
      const updated = { ...prev, blok }
      
      // Rebuild address_1 with street/quarter and number/blok
      const parts: string[] = []
      if (selectedStreet) {
        parts.push(selectedStreet.data.street_name)
      } else if (selectedQuarter) {
        parts.push(selectedQuarter.data.quarter_name)
      }
      if (prev.street_number) parts.push(prev.street_number)
      if (blok) parts.push(`бл. ${blok}`)
      
      return {
        ...updated,
        "shipping_address.address_1": parts.join(" "),
      }
    })
  }

  const handleAddressDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev: Record<string, any>) => {
      const updated = { ...prev, [name]: value }
      
      // Build address_2 from entrance, floor, and apartment with Bulgarian abbreviations
      const parts: string[] = []
      if (updated.entrance) parts.push(`вх. ${updated.entrance}`)
      if (updated.floor) parts.push(`ет. ${updated.floor}`)
      if (updated.apartment) parts.push(`ап. ${updated.apartment}`)
      
      return {
        ...updated,
        "shipping_address.address_2": parts.join(", "),
      }
    })
  }

  // Expose validateForm to parent component via ref
  useImperativeHandle(ref, () => ({
    validateForm: validateAddressFields,
  }))

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, do you want to use one of your saved addresses?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="First name"
          name="shipping_address.first_name"
          autoComplete="given-name"
          value={formData["shipping_address.first_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-first-name-input"
        />
        <Input
          label="Last name"
          name="shipping_address.last_name"
          autoComplete="family-name"
          value={formData["shipping_address.last_name"]}
          onChange={handleChange}
          required
          data-testid="shipping-last-name-input"
        />
      </div>

      {/* City Search */}
      <div>
        <label className="block text-sm font-medium text-ui-fg-base mb-2">
          City <span className="text-rose-500">*</span>
        </label>
        <CityAutocomplete
          provider={providerId || "econt_econt"}
          value={selectedCity}
          onChange={handleCitySelect}
          error={cityError || undefined}
          required
          data-testid="city-input"
        />
      </div>

      {/* Quarter Search */}
      <div>
        <label className="block text-sm font-medium text-ui-fg-base mb-2">
          Quarter (квартал)
        </label>
        <QuarterAutocomplete
          provider={providerId || "econt_econt"}
          cityId={selectedCity?.data.city_id || null}
          value={selectedQuarter}
          onChange={handleQuarterSelect}
          error={quarterError || undefined}
          disabled={!selectedCity}
          data-testid="quarter-input"
        />
      </div>

      {/* Street Search */}
      <div>
        <label className="block text-sm font-medium text-ui-fg-base mb-2">
          Street
        </label>
        <StreetAutocomplete
          provider={providerId || "econt_econt"}
          cityId={selectedCity?.data.city_id || null}
          value={selectedStreet}
          onChange={handleStreetSelect}
          error={streetError || undefined}
          disabled={!selectedCity}
          data-testid="street-input"
        />
      </div>

      {/* Address validation error */}
      {addressValidationError && (
        <div className="text-sm text-rose-500 p-3 bg-rose-50 rounded-md" data-testid="address-validation-error">
          {addressValidationError}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {/* Street Number - Required (or Blok) */}
        <Input
          label="Number (номер)"
          name="street_number"
          value={formData.street_number}
          onChange={handleNumberChange}
          data-testid="street-number-input"
        />
        {/* Blok - Required (or Number) */}
        <Input
          label="Blok (блок)"
          name="blok"
          value={formData.blok}
          onChange={handleBlokChange}
          data-testid="blok-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Entrance (вход)"
          name="entrance"
          value={formData.entrance}
          onChange={handleAddressDetailsChange}
          data-testid="entrance-input"
        />
        <Input
          label="Floor (етаж)"
          name="floor"
          value={formData.floor}
          onChange={handleAddressDetailsChange}
          data-testid="floor-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Apartment (апартамент)"
          name="apartment"
          value={formData.apartment}
          onChange={handleAddressDetailsChange}
          data-testid="apartment-input"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Company"
          name="shipping_address.company"
          value={formData["shipping_address.company"]}
          onChange={handleChange}
          autoComplete="organization"
          data-testid="shipping-company-input"
        />
      </div>

      {/* Hidden fields to store the constructed address values */}
      <input
        type="hidden"
        name="shipping_address.address_1"
        value={formData["shipping_address.address_1"]}
      />
      <input
        type="hidden"
        name="shipping_address.address_2"
        value={formData["shipping_address.address_2"]}
      />
      <input
        type="hidden"
        name="shipping_address.city"
        value={formData["shipping_address.city"]}
      />
      <input
        type="hidden"
        name="shipping_address.postal_code"
        value={formData["shipping_address.postal_code"]}
      />
      <input
        type="hidden"
        name="shipping_address.province"
        value={formData["shipping_address.province"]}
      />
      <input
        type="hidden"
        name="shipping_address.country_code"
        value="bg"
      />

      {/* Hidden fields to store city, quarter, and street metadata as JSON */}
      {selectedCity && (
        <input
          type="hidden"
          name="city_metadata"
          value={JSON.stringify(selectedCity.data)}
        />
      )}
      {selectedQuarter && (
        <input
          type="hidden"
          name="quarter_metadata"
          value={JSON.stringify(selectedQuarter.data)}
        />
      )}
      {selectedStreet && (
        <input
          type="hidden"
          name="street_metadata"
          value={JSON.stringify(selectedStreet.data)}
        />
      )}
      <div className="my-8">
        <Checkbox
          label="Billing address same as shipping address"
          name="same_as_billing"
          checked={checked}
          onChange={onChange}
          data-testid="billing-address-checkbox"
        />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <Input
          label="Email"
          name="email"
          type="email"
          title="Enter a valid email address."
          autoComplete="email"
          value={formData.email}
          onChange={handleChange}
          required
          data-testid="shipping-email-input"
        />
        <Input
          label="Phone"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          data-testid="shipping-phone-input"
        />
      </div>
    </>
  )
})

ShippingAddress.displayName = "ShippingAddress"

export default ShippingAddress
