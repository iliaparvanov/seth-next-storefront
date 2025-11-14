"use client"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { 
  getShippingAddressType, 
  getShippingProviderId,
  type ShippingOption 
} from "@lib/util/shipping-type"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text, useToggleState } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState, useRef } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import OfficeAddress from "../office-address"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

// Type for shipping option from cart
type CartShippingOption = {
  id: string
  name: string
  provider_id: string
  type?: {
    id: string
    label: string
    description: string
    code: string
  } | null
}

const Addresses = ({
  cart,
  customer,
  availableShippingMethods,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
  availableShippingMethods: CartShippingOption[] | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)
  
  const officeAddressRef = useRef<{ validateForm: () => boolean }>(null)

  // Determine address type based on selected shipping method
  // Check both cart.shipping_methods (attached) and cart.metadata (deferred selection)
  const attachedShippingMethod = cart?.shipping_methods?.at(-1)
  const selectedShippingOptionId = attachedShippingMethod?.shipping_option_id 
    || (cart?.metadata as any)?.selected_shipping_option_id

  // Find the full shipping option from available methods
  const selectedFullOption = availableShippingMethods?.find(
    (method) => method.id === selectedShippingOptionId
  )

  const shippingOption: ShippingOption | undefined = selectedFullOption
    ? {
        id: selectedFullOption.id,
        name: selectedFullOption.name,
        provider_id: selectedFullOption.provider_id,
        type: selectedFullOption.type || null,
      }
    : undefined

  const addressType = getShippingAddressType(shippingOption)
  const providerId = getShippingProviderId(shippingOption)

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    // Validate office selection if it's an office delivery
    if (addressType === "office" && officeAddressRef.current) {
      if (!officeAddressRef.current.validateForm()) {
        event.preventDefault()
        return
      }
    }
  }

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-baseline"
        >
          Shipping Address
          {!isOpen && <CheckCircleSolid />}
        </Heading>
        {!isOpen && cart?.shipping_address && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-ui-fg-interactive hover:text-ui-fg-interactive-hover"
              data-testid="edit-address-button"
            >
              Edit
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <form action={formAction} onSubmit={handleFormSubmit}>
          <div className="pb-8">
            {addressType === "office" ? (
              <OfficeAddress
                ref={officeAddressRef}
                customer={customer}
                checked={sameAsBilling}
                onChange={toggleSameAsBilling}
                cart={cart}
                providerId={providerId}
              />
            ) : (
              <ShippingAddress
                customer={customer}
                checked={sameAsBilling}
                onChange={toggleSameAsBilling}
                cart={cart}
              />
            )}

            {!sameAsBilling && (
              <div>
                <Heading
                  level="h2"
                  className="text-3xl-regular gap-x-4 pb-6 pt-8"
                >
                  Billing address
                </Heading>

                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton className="mt-6" data-testid="submit-address-button">
              {addressType === "office" ? "Continue to payment" : "See shipping cost"}
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && cart.shipping_address ? (
              <div className="flex items-start gap-x-8">
                <div className="flex items-start gap-x-1 w-full">
                  <div
                    className="flex flex-col w-1/3"
                    data-testid="shipping-address-summary"
                  >
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      {addressType === "office" ? "Office Details" : "Shipping Address"}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shipping_address.first_name}{" "}
                      {cart.shipping_address.last_name}
                    </Text>
                    {addressType === "office" ? (
                      <Text className="txt-medium text-ui-fg-subtle">
                        Office: {cart.shipping_address.address_1}
                      </Text>
                    ) : (
                      <>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.shipping_address.address_1}{" "}
                          {cart.shipping_address.address_2}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.shipping_address.postal_code},{" "}
                          {cart.shipping_address.city}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.shipping_address.country_code?.toUpperCase()}
                        </Text>
                      </>
                    )}
                  </div>

                  <div
                    className="flex flex-col w-1/3 "
                    data-testid="shipping-contact-summary"
                  >
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Contact
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.shipping_address.phone}
                    </Text>
                    <Text className="txt-medium text-ui-fg-subtle">
                      {cart.email}
                    </Text>
                  </div>

                  <div
                    className="flex flex-col w-1/3"
                    data-testid="billing-address-summary"
                  >
                    <Text className="txt-medium-plus text-ui-fg-base mb-1">
                      Billing Address
                    </Text>

                    {sameAsBilling ? (
                      <Text className="txt-medium text-ui-fg-subtle">
                        Billing and delivery address are the same.
                      </Text>
                    ) : (
                      <>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.billing_address?.first_name}{" "}
                          {cart.billing_address?.last_name}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.billing_address?.address_1}{" "}
                          {cart.billing_address?.address_2}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.billing_address?.postal_code},{" "}
                          {cart.billing_address?.city}
                        </Text>
                        <Text className="txt-medium text-ui-fg-subtle">
                          {cart.billing_address?.country_code?.toUpperCase()}
                        </Text>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Addresses
