/**
 * Courier-specific validation utilities for shipping addresses.
 * Extend this file with provider-specific validation logic as needed.
 */

export type AddressValidationResult = {
  isValid: boolean
  errors?: Record<string, string>
}

/**
 * Validates office address based on courier provider.
 * @param officeName - The name of the office
 * @param providerId - The courier provider ID
 * @returns Validation result with any errors
 */
export function validateOfficeAddress(
  officeName: string,
  providerId: string | null
): AddressValidationResult {
  const errors: Record<string, string> = {}

  // Basic validation
  if (!officeName || officeName.trim().length === 0) {
    errors.officeName = "Office name is required"
  }

  // TODO: Add provider-specific validations here
  // Example structure for future implementation:
  // 
  // switch (providerId) {
  //   case "courier_provider_1":
  //     return validateCourier1Office(officeName)
  //   case "courier_provider_2":
  //     return validateCourier2Office(officeName)
  //   default:
  //     break
  // }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }
}

/**
 * Validates standard address based on courier provider.
 * @param address - The address object
 * @param providerId - The courier provider ID
 * @returns Validation result with any errors
 */
export function validateStandardAddress(
  address: {
    address_1?: string
    postal_code?: string
    city?: string
    country_code?: string
  },
  providerId: string | null
): AddressValidationResult {
  const errors: Record<string, string> = {}

  // Basic validation
  if (!address.address_1 || address.address_1.trim().length === 0) {
    errors.address_1 = "Address is required"
  }

  if (!address.postal_code || address.postal_code.trim().length === 0) {
    errors.postal_code = "Postal code is required"
  }

  if (!address.city || address.city.trim().length === 0) {
    errors.city = "City is required"
  }

  // TODO: Add provider-specific validations here
  // Example structure for future implementation:
  // 
  // switch (providerId) {
  //   case "courier_provider_1":
  //     return validateCourier1Address(address)
  //   case "courier_provider_2":
  //     return validateCourier2Address(address)
  //   default:
  //     break
  // }

  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }
}

// Placeholder functions for future courier-specific implementations
// Uncomment and implement when adding courier-specific logic:

// function validateCourier1Office(officeName: string): AddressValidationResult {
//   // Implement courier 1 specific office validation
//   return { isValid: true }
// }

// function validateCourier1Address(address: any): AddressValidationResult {
//   // Implement courier 1 specific address validation
//   return { isValid: true }
// }

// function validateCourier2Office(officeName: string): AddressValidationResult {
//   // Implement courier 2 specific office validation
//   return { isValid: true }
// }

// function validateCourier2Address(address: any): AddressValidationResult {
//   // Implement courier 2 specific address validation
//   return { isValid: true }
// }
