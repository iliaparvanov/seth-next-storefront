import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import React, { useEffect, useState, useImperativeHandle, forwardRef } from "react"
import CityAutocomplete from "../city-autocomplete"
import OfficeAutocomplete from "../office-autocomplete"
import { type CitySearchResult, type OfficeSearchResult } from "@lib/data/shipping"

const OfficeAddress = forwardRef<
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
    // Office name stored in address_1 field
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    // Store office type in metadata for future use
    "shipping_address.country_code": cart?.shipping_address?.country_code || cart?.region?.countries?.[0]?.iso_2 || "",
    email: cart?.email || "",
  })

  const [selectedCity, setSelectedCity] = useState<CitySearchResult | null>(null)
  const [selectedOffice, setSelectedOffice] = useState<OfficeSearchResult | null>(null)
  const [cityError, setCityError] = useState<string | null>(null)
  const [officeError, setOfficeError] = useState<string | null>(null)

  useEffect(() => {
    if (cart && cart.shipping_address) {
      setFormData((prev: Record<string, any>) => ({
        ...prev,
        "shipping_address.first_name": cart.shipping_address?.first_name || "",
        "shipping_address.last_name": cart.shipping_address?.last_name || "",
        "shipping_address.address_1": cart.shipping_address?.address_1 || "",
        "shipping_address.phone": cart.shipping_address?.phone || "",
        "shipping_address.country_code": cart.shipping_address?.country_code || cart?.region?.countries?.[0]?.iso_2 || "",
      }))
    }

    if (cart && !cart.email && customer?.email) {
      setFormData((prev: Record<string, any>) => ({
        ...prev,
        email: customer.email,
      }))
    }
  }, [cart, customer])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleCitySelect = (city: CitySearchResult | null) => {
    setSelectedCity(city)
    setCityError(null)
    
    // Reset office selection when city changes
    if (selectedOffice && city?.data.city_id !== selectedOffice.data.city_id) {
      setSelectedOffice(null)
      setOfficeError(null)
      setFormData({
        ...formData,
        "shipping_address.address_1": "",
      })
    }
  }

  const handleOfficeSelect = (office: OfficeSearchResult | null) => {
    setSelectedOffice(office)
    setOfficeError(null)
    
    if (office) {
      // Update form data with office details
      setFormData({
        ...formData,
        "shipping_address.address_1": office.data.office_name,
      })
    } else {
      // Clear office data
      setFormData({
        ...formData,
        "shipping_address.address_1": "",
      })
    }
  }

  const validateForm = () => {
    let isValid = true
    
    if (!selectedCity) {
      setCityError("Please select a city from the list")
      isValid = false
    } else {
      setCityError(null)
    }
    
    if (!selectedOffice) {
      setOfficeError("Please select an office from the list")
      isValid = false
    } else {
      setOfficeError(null)
    }
    
    return isValid
  }

  // Expose validateForm to parent component via ref
  useImperativeHandle(ref, () => ({
    validateForm,
  }))

  return (
    <>
      {customer && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, please select an office for pickup delivery.`}
          </p>
        </Container>
      )}
      
      <div className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First name"
            name="shipping_address.first_name"
            autoComplete="given-name"
            value={formData["shipping_address.first_name"]}
            onChange={handleChange}
            required
            data-testid="office-first-name-input"
          />
          <Input
            label="Last name"
            name="shipping_address.last_name"
            autoComplete="family-name"
            value={formData["shipping_address.last_name"]}
            onChange={handleChange}
            required
            data-testid="office-last-name-input"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-ui-fg-base mb-2">
            City <span className="text-rose-500">*</span>
          </label>
          <CityAutocomplete
            provider={providerId || "econt"}
            value={selectedCity}
            onChange={handleCitySelect}
            error={cityError || undefined}
            required
            data-testid="city-input"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-ui-fg-base mb-2">
            Office location <span className="text-rose-500">*</span>
          </label>
          <OfficeAutocomplete
            provider={providerId || "econt"}
            cityId={selectedCity?.data.city_id || null}
            value={selectedOffice}
            onChange={handleOfficeSelect}
            error={officeError || undefined}
            required
            disabled={!selectedCity}
            data-testid="office-name-input"
          />
        </div>

        {/* Hidden field to store the selected office name */}
        <input
          type="hidden"
          name="shipping_address.address_1"
          value={formData["shipping_address.address_1"]}
        />

        {/* Hidden fields to store city and office metadata as JSON */}
        {selectedCity && (
          <input
            type="hidden"
            name="city_metadata"
            value={JSON.stringify(selectedCity.data)}
          />
        )}
        {selectedOffice && (
          <input
            type="hidden"
            name="office_metadata"
            value={JSON.stringify(selectedOffice.data)}
          />
        )}

        {/* Hidden field to maintain country_code requirement */}
        <input
          type="hidden"
          name="shipping_address.country_code"
          value={formData["shipping_address.country_code"]}
        />
        
        {/* Hidden fields for required but unused address fields */}
        <input type="hidden" name="shipping_address.postal_code" value="00000" />
        <input type="hidden" name="shipping_address.city" value="Office" />
        <input type="hidden" name="shipping_address.province" value="" />
        <input type="hidden" name="shipping_address.company" value="" />
      </div>

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
          data-testid="office-email-input"
        />
        <Input
          label="Phone"
          name="shipping_address.phone"
          autoComplete="tel"
          value={formData["shipping_address.phone"]}
          onChange={handleChange}
          required
          data-testid="office-phone-input"
        />
      </div>

      {/* Placeholder for provider-specific validations */}
      {providerId && (
        <input type="hidden" name="shipping_provider_id" value={providerId} />
      )}
    </>
  )
})

OfficeAddress.displayName = "OfficeAddress"

export default OfficeAddress
