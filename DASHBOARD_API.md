# Dashboard API Implementation

Complete Coupon Management Dashboard backend with Users, Businesses, Coupons, and JWT authentication.

## What Was Created

### Models
- **User** - Updated with new fields: `name`, `phone`, `status` (active/inactive), `startDate`, `expiryDate`
- **Business** - name, type, email, password, phone, ownerName, city, businessModel, usageLimit
- **Coupon** - code, businessId, discount (0-100), description, expiryDate, maxUsagePerUser, totalUsageCount, isActive
- **CouponUsage** - Track when users redeem coupons

### Services (`api/services/dashboard/`)
- **authService** - JWT login for users and businesses
- **userService** - User CRUD, renewal, soft deletes
- **businessService** - Business CRUD, usage tracking
- **couponService** - Coupon CRUD, redemption with all business rules

### Controllers (`api/controllers/dashboard/`)
- **authController** - Login endpoint
- **userController** - User management
- **businessController** - Business management
- **couponController** - Coupon management and redemption

### Routes (`/api/dashboard/`)
```
POST   /auth                              # Login (user or business)

POST   /users                             # Create user
GET    /users                             # List all users (admin only)
GET    /users/me                          # Get current user (authenticated)
GET    /users/:id                         # Get user by ID
PUT    /users/:id                         # Update user
POST   /users/:id/renew                   # Renew subscription
DELETE /users/:id                         # Soft delete user (admin)

POST   /businesses                        # Create business
GET    /businesses                        # List all businesses
GET    /businesses/:id                    # Get business details
PUT    /businesses/:id                    # Update business
GET    /businesses/:id/usage-remaining    # Get usage stats (limited model)

POST   /coupons                           # Create coupon (business only)
GET    /coupons                           # List coupons
GET    /coupons/:id                       # Get coupon details
PUT    /coupons/:id                       # Update coupon (business only)
DELETE /coupons/:id                       # Delete coupon (business only)
POST   /coupons/:id/use                   # Redeem coupon (user only)
GET    /coupons/:id/usage-stats           # Usage statistics (business only)
```

## Validations Implemented

### User
- Name required and non-empty
- Valid email format
- Password minimum 8 characters
- Lebanese phone format: `+961 XXXXXXXX` (8 digits)
- Status: active or inactive
- Auto expiry date: 1 year from creation

### Business
- Name required
- Type: restaurant, hotel, or other
- Valid email (unique)
- Password minimum 8 characters
- Lebanese phone format
- City: one of 12 Lebanese cities
- Business model: unlimited or limited
- Limited model requires usageLimit >= 1

### Coupon
- Code: unique, required
- Discount: 0-100
- Expiry date must be in future
- Max usage per user >= 1

## Business Rules Enforced

1. **User Expiry** - Users can only use coupons if their subscription is active (not expired)
2. **Coupon Expiry** - Coupons cannot be used after their expiry date
3. **Usage Limits** - Users can only use a coupon up to `maxUsagePerUser` times
4. **Limited Businesses** - Each coupon created decrements the business's usageLimit
5. **Limited Businesses (Usage)** - Each coupon redemption decrements the business's usageLimit
6. **Status Check** - Only active users can redeem coupons
7. **Soft Deletes** - Users and coupons are marked inactive, not deleted

## Authentication

- JWT tokens valid for 24 hours
- Token contains: `{ id, email, role }`
- Roles: `user`, `business`, `admin`
- All protected routes require: `Authorization: Bearer <token>`

## Environment Variables

```env
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_secret_key_change_this_in_production
```

## Getting Started

1. **Start the server:**
   ```bash
   npm run dev
   ```

2. **Create a user:**
   ```bash
   POST /api/dashboard/users
   {
     "name": "John Doe",
     "email": "john@example.com",
     "password": "securepass123",
     "phone": "+961 71123456",
     "status": "active"
   }
   ```

3. **Login:**
   ```bash
   POST /api/dashboard/auth
   {
     "email": "john@example.com",
     "password": "securepass123",
     "type": "user"
   }
   ```
   Response includes JWT token

4. **Create a business:**
   ```bash
   POST /api/dashboard/businesses
   {
     "name": "Restaurant ABC",
     "type": "restaurant",
     "email": "owner@restaurant.com",
     "password": "securepass123",
     "phone": "+961 71111111",
     "ownerName": "Owner Name",
     "city": "Beirut",
     "businessModel": "limited",
     "usageLimit": 100
   }
   ```

5. **Create a coupon (as business with JWT):**
   ```bash
   POST /api/dashboard/coupons
   Authorization: Bearer <business_token>
   {
     "code": "SAVE20",
     "discount": 20,
     "description": "20% off on all items",
     "expiryDate": "2025-12-31T23:59:59Z",
     "maxUsagePerUser": 5
   }
   ```

6. **Redeem a coupon (as user with JWT):**
   ```bash
   POST /api/dashboard/coupons/:coupon_id/use
   Authorization: Bearer <user_token>
   ```

## Error Responses

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-05-28T10:00:00Z"
}
```

### Status Codes
- `400` - Validation error
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `409` - Conflict (email/code already exists)
- `500` - Server error

## Testing Tips

1. Use Postman or similar tool to test endpoints
2. Create user first, get JWT
3. Create business, get JWT
4. Login operations use the auth endpoint with `type` field
5. All authenticated endpoints require `Authorization: Bearer <token>` header
6. Test coupon redemption with expired user/coupon to verify validations
7. Test limited business usage limits by creating coupons beyond the limit

## Key Features

✅ Full CRUD operations for all entities
✅ JWT authentication with role-based access control
✅ Comprehensive validation with Lebanese phone format
✅ Business rule enforcement (expiry, usage limits, soft deletes)
✅ Pagination support on all list endpoints
✅ Soft deletes for data preservation
✅ bcryptjs password hashing with 10 salt rounds
✅ Detailed error messages for validation failures
✅ ISO 8601 timestamps throughout
