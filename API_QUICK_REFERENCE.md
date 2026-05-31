# API Quick Reference Guide

Quick lookup for all Dashboard API endpoints.

**Base URL:** `http://localhost:4000/api/dashboard`

---

## Authentication

| Method | Endpoint | Auth | Purpose |
|--------|----------|------|---------|
| `POST` | `/auth` | None | User login |

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "token": "jwt_token_here",
  "user": { "id": "...", "email": "...", "role": "user" }
}
```

---

## Users

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| `POST` | `/users` | None | - | Create user (register) |
| `GET` | `/users/me` | ✓ | user | Get current user |
| `GET` | `/users` | ✓ | admin | List all users |
| `GET` | `/users/:id` | None | - | Get user by ID |
| `PUT` | `/users/:id` | ✓ | user\|admin | Update user |
| `POST` | `/users/:id/renew` | ✓ | user\|admin | Renew subscription |
| `DELETE` | `/users/:id` | ✓ | admin | Soft delete user |

### Create User
```bash
curl -X POST http://localhost:3000/api/dashboard/users \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepass123",
    "phone": "+961 71 123 456"
  }'
```

### Get Current User
```bash
curl http://localhost:3000/api/dashboard/users/me \
  -H "Authorization: Bearer <token>"
```

### List Users (Admin)
```bash
curl "http://localhost:3000/api/dashboard/users?page=1&limit=20&status=active" \
  -H "Authorization: Bearer <admin_token>"
```

### Update User
```bash
curl -X PUT http://localhost:3000/api/dashboard/users/<user_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "Jane Doe", "phone": "+961 71 987 654"}'
```

### Renew Subscription
```bash
curl -X POST http://localhost:3000/api/dashboard/users/<user_id>/renew \
  -H "Authorization: Bearer <token>"
```

---

## Businesses

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| `POST` | `/businesses` | None | - | Create business (register) |
| `GET` | `/businesses` | None | - | List all businesses |
| `GET` | `/businesses/:id` | None | - | Get business by ID |
| `PUT` | `/businesses/:id` | ✓ | business\|admin | Update business |
| `GET` | `/businesses/:id/usage-remaining` | ✓ | business | Get usage stats |

### Create Business
```bash
curl -X POST http://localhost:3000/api/dashboard/businesses \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Restaurant ABC",
    "type": "restaurant",
    "email": "owner@restaurant.com",
    "password": "securepass123",
    "phone": "+961 71 111 111",
    "ownerName": "Owner Name",
    "city": "Beirut",
    "businessModel": "limited",
    "usageLimit": 100
  }'
```

### List Businesses
```bash
curl "http://localhost:3000/api/dashboard/businesses?page=1&limit=20&type=restaurant&city=Beirut"
```

### Get Business Details
```bash
curl http://localhost:3000/api/dashboard/businesses/<business_id>
```

### Update Business
```bash
curl -X PUT http://localhost:3000/api/dashboard/businesses/<business_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name": "New Name", "usageLimit": 200}'
```

### Check Usage (Limited Model)
```bash
curl http://localhost:3000/api/dashboard/businesses/<business_id>/usage-remaining \
  -H "Authorization: Bearer <business_token>"
```

---

## Coupons

| Method | Endpoint | Auth | Role | Purpose |
|--------|----------|------|------|---------|
| `POST` | `/coupons` | ✓ | business | Create coupon |
| `GET` | `/coupons` | None | - | List all coupons |
| `GET` | `/coupons/:id` | None | - | Get coupon by ID |
| `PUT` | `/coupons/:id` | ✓ | business | Update coupon |
| `DELETE` | `/coupons/:id` | ✓ | business | Soft delete coupon |
| `POST` | `/coupons/:id/use` | ✓ | user | Redeem coupon |
| `GET` | `/coupons/:id/usage-stats` | ✓ | business | Get usage stats |

### Create Coupon
```bash
curl -X POST http://localhost:3000/api/dashboard/coupons \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <business_token>" \
  -d '{
    "code": "SAVE20",
    "discount": 20,
    "description": "20% off",
    "expiryDate": "2025-12-31T23:59:59Z",
    "maxUsagePerUser": 5
  }'
```

### List Coupons
```bash
curl "http://localhost:3000/api/dashboard/coupons?page=1&limit=20&businessId=<id>&code=SAVE20"
```

### Get Coupon Details
```bash
curl http://localhost:3000/api/dashboard/coupons/<coupon_id>
```

### Update Coupon
```bash
curl -X PUT http://localhost:3000/api/dashboard/coupons/<coupon_id> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <business_token>" \
  -d '{
    "description": "Updated description",
    "expiryDate": "2026-12-31T23:59:59Z",
    "maxUsagePerUser": 10
  }'
```

### Delete Coupon
```bash
curl -X DELETE http://localhost:3000/api/dashboard/coupons/<coupon_id> \
  -H "Authorization: Bearer <business_token>"
```

### Redeem Coupon
```bash
curl -X POST http://localhost:3000/api/dashboard/coupons/<coupon_id>/use \
  -H "Authorization: Bearer <user_token>"
```

### Get Coupon Stats
```bash
curl http://localhost:3000/api/dashboard/coupons/<coupon_id>/usage-stats \
  -H "Authorization: Bearer <business_token>"
```

---

## Valid Values

### User Status
- `active`
- `inactive`

### Business Types
- `restaurant`
- `hotel`
- `other`

### Business Model
- `unlimited` (no usage limit)
- `limited` (requires `usageLimit` parameter)

### Lebanese Cities
```
Beirut, Tripoli, Sidon, Tyre, Zahle, Jounieh, Baalbek,
Nabatieh, Byblos, Aley, Chouf, Bint Jbeil
```

### Coupon Discount
- Range: 0-100 (percentage)

### Phone Format
- Format: `+961 XXXXXXXX` (8 digits)
- Example: `+961 71 123 456`

---

## Error Status Codes

| Code | Meaning |
|------|---------|
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (missing/invalid token) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (email/code already exists) |
| `500` | Server Error |

---

## Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-05-28T10:00:00Z"
}
```

---

## Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| `Email already exists` | Email is registered | Use different email or login |
| `Invalid Lebanese phone` | Phone format wrong | Use format: +961 XXXXXXXX (8 digits) |
| `Password must be at least 8 characters` | Password too short | Use longer password |
| `User subscription has expired` | User's subscription ended | Renew subscription |
| `Coupon has expired` | Coupon not valid anymore | Cannot use expired coupon |
| `Coupon usage limit exceeded` | User used coupon too many times | Cannot use again |
| `Business has reached its usage limit` | Limited business out of coupons | Cannot create more coupons |
| `Unauthorized` | Missing/invalid token | Login first |
| `Forbidden` | No permission for action | Check user role |

---

## JavaScript Examples

### Setup
```javascript
const API_BASE = 'http://localhost:3000/api/dashboard';
const token = localStorage.getItem('token');

const request = async (method, endpoint, body = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const response = await fetch(`${API_BASE}${endpoint}`, options);
  return response.json();
};
```

### Login
```javascript
const login = async (email, password, type) => {
  const result = await request('POST', '/auth', { email, password, type });
  localStorage.setItem('token', result.data.token);
  return result.data;
};
```

### Create Coupon
```javascript
const createCoupon = async (coupon) => {
  return request('POST', '/coupons', coupon);
};
```

### Use Coupon
```javascript
const useCoupon = async (couponId) => {
  return request('POST', `/coupons/${couponId}/use`);
};
```

### Get Current User
```javascript
const getCurrentUser = async () => {
  return request('GET', '/users/me');
};
```

---

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)

### Filters
- `status` - User status: active, inactive
- `type` - Business type: restaurant, hotel, other
- `city` - Lebanese city name
- `businessId` - Filter coupons by business
- `code` - Filter coupons by code

### Examples
```
GET /users?page=2&limit=50
GET /users?status=active
GET /businesses?type=restaurant&city=Beirut
GET /coupons?businessId=123&code=SAVE20
```

---

## Date Format

All dates use **ISO 8601 format**:
```
2026-05-28T10:00:00Z
```

### JavaScript
```javascript
// Create ISO string
new Date().toISOString()

// Parse ISO string
new Date('2026-05-28T10:00:00Z')

// Format for input[type="datetime-local"]
new Date().toISOString().slice(0, 16)  // 2026-05-28T10:00
```

---

## Quick Workflow

### User Registration & Coupon Redemption
1. `POST /users` - User registers
2. `POST /auth` - User logs in (type: "user")
3. `GET /coupons` - Browse coupons
4. `POST /coupons/:id/use` - Redeem coupon

### Business Registration & Coupon Creation
1. `POST /businesses` - Business registers
2. `POST /auth` - Business logs in (type: "business")
3. `POST /coupons` - Create coupon
4. `GET /coupons/:id/usage-stats` - View stats

### Admin User Management
1. `POST /auth` - Admin logs in (has admin role)
2. `GET /users` - View all users
3. `PUT /users/:id` - Edit user
4. `DELETE /users/:id` - Deactivate user

---

## Testing Checklist

- [ ] User registration with valid data
- [ ] User registration with invalid email
- [ ] User registration with invalid phone format
- [ ] User login
- [ ] Business registration
- [ ] Business login
- [ ] Create coupon as business
- [ ] Try to create coupon with invalid discount
- [ ] Redeem coupon as user
- [ ] Try to redeem expired coupon
- [ ] Try to redeem with inactive user
- [ ] Check usage stats
- [ ] Update user profile
- [ ] Renew subscription
- [ ] List coupons with filters
- [ ] List businesses with filters
