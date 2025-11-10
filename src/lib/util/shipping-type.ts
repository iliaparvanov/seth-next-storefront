export type ShippingAddressType = "address" | "office"

export type ShippingOption = {
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

/**
 * Determines the shipping address type based on the shipping option's type code.
 * Returns 'office' if the code is 'office', otherwise defaults to 'address'.
 */
export function getShippingAddressType(
  shippingOption?: ShippingOption | null
): ShippingAddressType {
  const code = shippingOption?.type?.code
    console.log(shippingOption)
  if (code === "office") {
    return "office"
  }

  // Default to 'address' for 'address' code, missing code, or any other value
  return "address"
}

/**
 * Gets the provider ID from a shipping option for courier-specific logic.
 * Useful for implementing provider-specific validations.
 */
export function getShippingProviderId(
  shippingOption?: ShippingOption | null
): string | null {
  return shippingOption?.provider_id || null
}
