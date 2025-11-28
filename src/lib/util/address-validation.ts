/**
 * Courier-specific validation utilities for shipping addresses.
 * Extend this file with provider-specific validation logic as needed.
 */

export type AddressValidationResult = {
  isValid: boolean
  errors?: Record<string, string>
}

export type CityData = {
  city_id: number
  city_name: string
  postal_code: string
}

export type OfficeData = {
  office_id: number
  office_code: string
  office_name: string
  city_id: number
  city_name: string
  address: string
  postal_code: string
}

/**
 * Validates office address based on courier provider.
 * @param officeName - The name of the office
 * @param providerId - The courier provider ID
 * @param cityData - Required structured city data from API
 * @param officeData - Required structured office data from API
 * @returns Validation result with any errors
 */
export function validateOfficeAddress(
  officeName: string,
  providerId: string | null,
  cityData?: CityData | null,
  officeData?: OfficeData | null
): AddressValidationResult {
  const errors: Record<string, string> = {}

  // Basic validation
  if (!officeName || officeName.trim().length === 0) {
    errors.officeName = "Име на офис е задължително"
  }

  // Validate that city was selected
  if (!cityData) {
    errors.city = "Моля изберете град от резултатите на търсене"
  }

  // Validate that office was selected from autocomplete (has structured data)
  if (!officeData) {
    errors.officeName = "Моля изберете офис от резултатите на търсене"
  }

  // Validate city and office match
  if (cityData && officeData && cityData.city_id !== officeData.city_id) {
    errors.officeName = "Избраният офис не отговаря на избрания град"
  }

  // Provider-specific validations
  if (providerId && officeData && cityData) {
    switch (providerId.toLowerCase()) {
      case "econt":
        // Validate Econt-specific fields
        if (!officeData.office_code || !officeData.office_id) {
          errors.officeName = "Невалидни данни за офис Econt"
        }
        if (!cityData.city_id) {
          errors.city = "Невалидни данни за град Econt"
        }
        break
      // Add more providers as needed
      default:
        break
    }
  }

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
    errors.address_1 = "Адресата е задължителна"
  }

  if (!address.postal_code || address.postal_code.trim().length === 0) {
    errors.postal_code = "Пощенския код е задължителен"
  }

  if (!address.city || address.city.trim().length === 0) {
    errors.city = "Градът е задължителен"
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
