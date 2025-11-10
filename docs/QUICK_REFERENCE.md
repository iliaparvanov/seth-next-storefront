# Quick Reference: Shipping Address Types

## For Developers

### Check Address Type
```typescript
import { getShippingAddressType } from "@lib/util/shipping-type"

const addressType = getShippingAddressType(shippingOption)
// Returns: "office" | "address"
```

### Get Provider ID
```typescript
import { getShippingProviderId } from "@lib/util/shipping-type"

const providerId = getShippingProviderId(shippingOption)
// Returns: string | null
```

### Add Validation
```typescript
// In src/lib/util/address-validation.ts

// 1. Implement validation function
function validateMyCourierOffice(officeName: string): AddressValidationResult {
  if (!officeName.startsWith("OFFICE-")) {
    return {
      isValid: false,
      errors: { officeName: "Must start with OFFICE-" }
    }
  }
  return { isValid: true }
}

// 2. Add to switch statement
export function validateOfficeAddress(
  officeName: string,
  providerId: string | null
): AddressValidationResult {
  // ... existing code
  switch (providerId) {
    case "my-courier-provider-id":
      return validateMyCourierOffice(officeName)
    // ... other cases
  }
  // ... rest of function
}
```

## For Medusa Backend Setup

### Configure Shipping Option Type

```javascript
// In Medusa admin or via API
{
  name: "Office Pickup - Courier A",
  price_type: "flat",
  amount: 500,
  type: {
    code: "office",      // ← Key field for type detection
    label: "Office Pickup",
    description: "Pickup from courier office"
  },
  provider_id: "courier-a-provider-id",
  // ... other fields
}
```

### Standard Address Shipping Option
```javascript
{
  name: "Home Delivery - Courier A",
  price_type: "flat",
  amount: 1000,
  type: {
    code: "address",     // ← Or omit for default
    label: "Home Delivery",
    description: "Delivery to your address"
  },
  provider_id: "courier-a-provider-id",
  // ... other fields
}
```

## Component Usage

### Office Address Component
```typescript
<OfficeAddress
  customer={customer}
  cart={cart}
  checked={sameAsBilling}
  onChange={toggleSameAsBilling}
  providerId={providerId}  // Optional: for validation
/>
```

**Fields collected:**
- First name
- Last name
- Office name (stored in `address_1`)
- Phone
- Email

### Standard Address Component
```typescript
<ShippingAddress
  customer={customer}
  cart={cart}
  checked={sameAsBilling}
  onChange={toggleSameAsBilling}
/>
```

**Fields collected:**
- First name, last name
- Address line 1, company
- Postal code, city
- Country, province
- Phone, email

## File Structure

```
src/
├── lib/
│   └── util/
│       ├── shipping-type.ts         # Type detection logic
│       └── address-validation.ts    # Validation framework
└── modules/
    └── checkout/
        └── components/
            ├── addresses/
            │   └── index.tsx         # Main component (modified)
            ├── shipping-address/
            │   └── index.tsx         # Standard address form
            └── office-address/
                └── index.tsx         # Office address form (new)

docs/
├── SHIPPING_ADDRESS_TYPES.md        # Full documentation
└── IMPLEMENTATION_SUMMARY.md        # Implementation details
```

## Testing Commands

```bash
# Run dev server
yarn dev

# Check for type errors
yarn build

# Lint code
yarn lint
```

## Common Issues

**Problem:** Address type always shows "address" even with office shipping  
**Solution:** Check that shipping option has `type.code === "office"` in backend

**Problem:** Office name not saving  
**Solution:** Office name is stored in `address_1` field - check form submission

**Problem:** Validation not running  
**Solution:** Ensure `providerId` is passed to validation functions

## Next Steps

1. ✅ Basic office/address type detection implemented
2. ⏭️ Add courier-specific validations in `address-validation.ts`
3. ⏭️ Integrate courier API for office name validation
4. ⏭️ Add office autocomplete/search functionality
5. ⏭️ Implement map view for office locations
