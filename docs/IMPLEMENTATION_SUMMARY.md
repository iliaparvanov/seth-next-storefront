# Checkout Address Type Extension - Implementation Summary

## Changes Made

### New Files Created

1. **`src/lib/util/shipping-type.ts`**
   - Type definitions for shipping address types (`"address"` | `"office"`)
   - `getShippingAddressType()`: Determines address type from shipping option
   - `getShippingProviderId()`: Extracts provider ID for validation logic

2. **`src/modules/checkout/components/office-address/index.tsx`**
   - New component for office/pickup point address collection
   - Simplified form: first name, last name, office name, phone, email
   - Maintains backend compatibility with hidden fields

3. **`src/lib/util/address-validation.ts`**
   - Extensible validation framework for courier-specific rules
   - `validateOfficeAddress()`: Office address validation with provider support
   - `validateStandardAddress()`: Standard address validation with provider support
   - Placeholder functions for future courier implementations

4. **`docs/SHIPPING_ADDRESS_TYPES.md`**
   - Complete documentation of the feature
   - Implementation guide for courier-specific validations
   - Testing instructions and extension points

### Modified Files

1. **`src/modules/checkout/components/addresses/index.tsx`**
   - Added imports for shipping type utilities and OfficeAddress component
   - Extracts shipping option data from cart
   - Determines address type using `getShippingAddressType()`
   - Conditionally renders `OfficeAddress` or `ShippingAddress` based on type
   - Updates button text based on address type
   - Modified summary display to handle office addresses differently

2. **`.github/copilot-instructions.md`**
   - Updated checkout flow section to document address type logic
   - Added common pitfall about checking shipping type

## How It Works

### Flow

```
User selects shipping method (Delivery step)
         ↓
System stores selection in cart.metadata.selected_shipping_option_id (deferred)
         ↓
User proceeds to Address step
         ↓
Addresses component receives availableShippingMethods prop
         ↓
Looks up selected option ID from:
  1. cart.shipping_methods[].shipping_option_id (if attached)
  2. cart.metadata.selected_shipping_option_id (if deferred)
         ↓
Finds matching option from availableShippingMethods
         ↓
getShippingAddressType(shippingOption) checks type.code
         ↓
    ┌─────────────┐
    │  type.code  │
    └─────────────┘
         ↓
    ┌────┴────┐
    │         │
"office"   other/null
    │         │
    ↓         ↓
 Office   Standard
 Address  Address
 Form     Form
    │         │
    └────┬────┘
         ↓
   Submit addresses
         ↓
   Continue to payment
```

### Type Determination Logic

```typescript
// Get selected option ID from cart (either attached or deferred in metadata)
const selectedShippingOptionId = 
  cart?.shipping_methods?.at(-1)?.shipping_option_id ||
  cart?.metadata?.selected_shipping_option_id

// Find full option details from available options
const selectedFullOption = availableShippingMethods?.find(
  (method) => method.id === selectedShippingOptionId
)

// Determine address type
const addressType = getShippingAddressType(selectedFullOption)
// Returns "office" if selectedFullOption.type.code === "office"
// Returns "address" for any other value (including null/undefined)
```

### Data Storage

**Office Address:**
- `address_1`: Office name/identifier
- `postal_code`: "00000" (placeholder)
- `city`: "Office" (placeholder)
- Other fields: empty strings

**Standard Address:**
- All fields populated as usual

## Extension Guide

### Adding Courier-Specific Validation

1. **Get Provider ID**
   ```typescript
   const providerId = getShippingProviderId(shippingOption)
   ```

2. **Implement Validation**
   ```typescript
   // In address-validation.ts
   function validateCourierXOffice(officeName: string): AddressValidationResult {
     // Your validation logic
   }
   ```

3. **Wire It Up**
   ```typescript
   switch (providerId) {
     case "courier_x_id":
       return validateCourierXOffice(officeName)
   }
   ```

### Adding New Address Types

1. Update `ShippingAddressType` in `shipping-type.ts`:
   ```typescript
   export type ShippingAddressType = "address" | "office" | "locker"
   ```

2. Add logic to `getShippingAddressType()`:
   ```typescript
   if (code === "locker") return "locker"
   ```

3. Create component: `src/modules/checkout/components/locker-address/index.tsx`

4. Update `addresses/index.tsx` to handle new type:
   ```typescript
   {addressType === "locker" ? (
     <LockerAddress ... />
   ) : ...}
   ```

## Testing Checklist

- [ ] Office address flow with `type.code === "office"`
- [ ] Standard address flow with `type.code === "address"`
- [ ] Default behavior when `type` or `code` is undefined
- [ ] Address summary displays correctly for both types
- [ ] Button text changes appropriately
- [ ] Form data submits correctly to backend
- [ ] Billing address same/different logic works for both types

## Backend Requirements

Shipping options in Medusa must be configured with type codes:

```javascript
// Office delivery
{
  type: {
    code: "office",
    label: "Office Pickup",
    description: "..."
  }
}

// Standard delivery
{
  type: {
    code: "address", // or omit
    label: "Home Delivery",
    description: "..."
  }
}
```

## Future Enhancements

1. **API Integration**: Validate office names against courier APIs
2. **Autocomplete**: Add office search/autocomplete functionality
3. **Map Integration**: Show office locations on a map
4. **Provider UI**: Show courier-specific instructions/fields
5. **Address History**: Save office addresses to customer profile
6. **Validation UI**: Real-time validation feedback as user types

## Notes

- The implementation prioritizes extensibility and maintainability
- Provider-specific logic is isolated in validation utilities
- Components remain clean and focused on presentation
- Type system ensures compile-time safety for address types
- Documentation enables easy onboarding for new developers
