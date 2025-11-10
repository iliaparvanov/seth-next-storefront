# Shipping Address Type Extension

## Overview

The checkout flow has been extended to support different shipping address types based on the shipping option selected. The system now supports two address types:
- **address**: Traditional full address with postal code, city, etc.
- **office**: Simplified office/pickup point address with just office name

## Architecture

### Type Determination

The address type is determined by the `type.code` field of the selected shipping option:
- `code === "office"` → Office address form
- Any other value (including `"address"`, `null`, or undefined) → Standard address form

### Key Files

1. **`src/lib/util/shipping-type.ts`**
   - `getShippingAddressType()`: Determines address type from shipping option
   - `getShippingProviderId()`: Extracts provider ID for courier-specific logic
   - Type definitions for extensibility

2. **`src/modules/checkout/components/office-address/index.tsx`**
   - Office address form component
   - Only requires: first name, last name, office name, phone, email
   - Hidden fields maintain compatibility with backend address structure

3. **`src/modules/checkout/components/addresses/index.tsx`**
   - Modified to conditionally render `ShippingAddress` or `OfficeAddress`
   - Displays appropriate summary based on address type
   - Button text adapts: "Continue to payment" (office) vs "See shipping cost" (address)

4. **`src/lib/util/address-validation.ts`**
   - Extensible validation framework for courier-specific logic
   - Placeholder functions for adding provider-specific validations
   - Ready for implementation when needed

## Data Flow

1. User selects shipping method in delivery step
2. Selection stored in `cart.metadata.selected_shipping_option_id` (deferred)
3. User proceeds to address step
4. `Addresses` component receives `availableShippingMethods` prop
5. Component extracts shipping option ID from cart (checks both attached methods and metadata)
6. Finds full shipping option details from `availableShippingMethods`
7. `getShippingAddressType()` determines which form to show
8. User fills appropriate form (office or standard address)
9. Form submission proceeds to payment step

## Adding Courier-Specific Validations

### Step 1: Identify Provider IDs

First, determine the provider IDs for your couriers. You can log them in the checkout:

```typescript
const providerId = getShippingProviderId(shippingOption)
console.log('Provider ID:', providerId)
```

### Step 2: Implement Validation Functions

In `src/lib/util/address-validation.ts`, uncomment and implement provider-specific functions:

```typescript
function validateCourier1Office(officeName: string): AddressValidationResult {
  const errors: Record<string, string> = {}
  
  // Example: Check office name format
  if (!/^[A-Z]{3}\d{3}$/.test(officeName)) {
    errors.officeName = "Office name must be in format ABC123"
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors: Object.keys(errors).length > 0 ? errors : undefined,
  }
}
```

### Step 3: Wire Up Validations

Update the switch statements in `validateOfficeAddress()` and `validateStandardAddress()`:

```typescript
switch (providerId) {
  case "courier_1_provider_id":
    return validateCourier1Office(officeName)
  case "courier_2_provider_id":
    return validateCourier2Office(officeName)
  default:
    break
}
```

### Step 4: Apply Validations in Components

In `OfficeAddress` or `ShippingAddress` components, call validation before submission:

```typescript
import { validateOfficeAddress } from "@lib/util/address-validation"

// In handleSubmit or onChange
const validation = validateOfficeAddress(formData["shipping_address.address_1"], providerId)
if (!validation.isValid) {
  // Show errors
  setErrors(validation.errors)
  return
}
```

## Backend Configuration

Ensure your Medusa backend has shipping options configured with appropriate type codes:

```javascript
// In Medusa admin or API
{
  name: "Office Pickup",
  type: {
    code: "office",
    label: "Office Pickup",
    description: "Pickup from office location"
  },
  // ... other fields
}

{
  name: "Home Delivery",
  type: {
    code: "address", // or omit for default behavior
    label: "Home Delivery",
    description: "Delivery to address"
  },
  // ... other fields
}
```

## Testing

### Test Office Address Flow
1. Add products to cart
2. Select a shipping option with `type.code === "office"`
3. Proceed to address step
4. Verify office address form shows (name + office name + contact only)
5. Submit and verify data saved correctly

### Test Standard Address Flow
1. Add products to cart
2. Select a shipping option with `type.code === "address"` or no code
3. Proceed to address step
4. Verify standard address form shows (full address fields)
5. Submit and verify data saved correctly

## Extension Points

This implementation is designed for easy extension:

1. **New Address Types**: Add new types to `ShippingAddressType` in `shipping-type.ts`
2. **New Couriers**: Add validation functions in `address-validation.ts`
3. **Custom Fields**: Extend form components with provider-specific fields
4. **Dynamic Forms**: Use provider ID to show/hide fields dynamically

## Notes

- Office addresses store the office name in the `address_1` field
- Hidden fields (`postal_code`, `city`, etc.) maintain backend compatibility
- The `providerId` is passed through form for future validation use
- Billing address logic remains unchanged regardless of shipping type
