import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Checkbox from "@modules/common/components/checkbox"
import Input from "@modules/common/components/input"
import React, { useEffect, useState } from "react"

const OfficeAddress = ({
  customer,
  cart,
  checked,
  onChange,
  providerId,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
  providerId?: string | null
}) => {
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

  return (
    <>
      {customer && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5">
          <p className="text-small-regular">
            {`Hi ${customer.first_name}, please provide the office details for delivery.`}
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
        
        <Input
          label="Office name"
          name="shipping_address.address_1"
          value={formData["shipping_address.address_1"]}
          onChange={handleChange}
          required
          data-testid="office-name-input"
        />

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
}

export default OfficeAddress
