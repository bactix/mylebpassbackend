# Dashboard APIs - Frontend Documentation

Complete documentation for integrating the Coupon Management Dashboard APIs.

## 📚 Documentation Files

### 1. **API_QUICK_REFERENCE.md** ⚡
**Use this for:** Quick endpoint lookups, curl examples, error codes
- All endpoints at a glance
- HTTP methods and auth requirements
- cURL examples for testing
- Valid values and formats
- Common errors and solutions

**Start here if:** You just need to know what endpoints exist and how to call them.

---

### 2. **FRONTEND_INTEGRATION_GUIDE.md** 📖
**Use this for:** Detailed implementation instructions with full code examples
- API client setup (fetch, axios, etc.)
- Complete function examples for every endpoint
- React component integration patterns
- Error handling strategies
- Form validation examples
- Best practices and patterns

**Start here if:** You're implementing the actual frontend features.

---

### 3. **DASHBOARD_API.md** 🎯
**Use this for:** Complete API specification and getting started
- All endpoints with detailed descriptions
- Request/response formats
- Validation rules
- Business rules enforced
- Authentication flow
- Getting started guide

**Start here if:** You need to understand the full API specification.

---

### 4. **Dashboard_APIs.postman_collection.json** 🧪
**Use this for:** Testing all endpoints without writing code
- Import directly into Postman
- Pre-configured with example data
- Auto-token management
- Environment variables
- All 19 endpoints ready to test

**Start here if:** You want to test the API before implementing frontend.

---

## 🚀 Getting Started in 5 Steps

### Step 1: Understand the API Structure
Read the **API_QUICK_REFERENCE.md** section "API at a Glance" to see:
- 4 main resources: Auth, Users, Businesses, Coupons
- 19 total endpoints
- Authentication requirements
- User roles and permissions

### Step 2: Test in Postman
1. Import `Dashboard_APIs.postman_collection.json` into Postman
2. Set `baseUrl` variable to `http://localhost:4000`
3. Run "Create User" request
4. Run "Login" (token auto-saves)
5. Run "Get Current User" to confirm auth works

### Step 3: Set Up Your Frontend
```javascript
// 1. Copy the API client code from FRONTEND_INTEGRATION_GUIDE.md
// 2. Create environment variables
// 3. Set up auth context/state management
// 4. Create API service functions
```

### Step 4: Implement Each Feature
Follow the **FRONTEND_INTEGRATION_GUIDE.md** for each feature:
- User registration → `createUser()` example
- User login → `loginUser()` example
- Browse coupons → `getAllCoupons()` example
- Redeem coupon → `useCoupon()` example

### Step 5: Handle Errors & Edge Cases
Use the error handling patterns in **FRONTEND_INTEGRATION_GUIDE.md**:
- Validate form inputs
- Handle expired tokens
- Show user-friendly error messages
- Check user/coupon expiry dates

---

## 📋 Feature Checklist

### Authentication
- [ ] User login (`POST /auth`)
- [ ] Store JWT token securely
- [ ] Include token in Authorization header
- [ ] Handle token expiry (24 hours)

### User Features
- [ ] User registration (`POST /users`)
- [ ] Get current user profile (`GET /users/me`)
- [ ] Update profile (`PUT /users/:id`)
- [ ] View subscription expiry date
- [ ] Renew subscription (`POST /users/:id/renew`)

### Business Features
- [ ] Business registration (`POST /businesses`)
- [ ] Browse all businesses (`GET /businesses`)
- [ ] View business details (`GET /businesses/:id`)
- [ ] Update business info (`PUT /businesses/:id`)
- [ ] Check remaining usage (`GET /businesses/:id/usage-remaining`)

### Coupon Features
- [ ] Browse all coupons (`GET /coupons`)
- [ ] View coupon details (`GET /coupons/:id`)
- [ ] Create coupon (as business)
- [ ] Update coupon (as business)
- [ ] Delete coupon (as business)
- [ ] **Redeem coupon** (as user) - Core feature!
- [ ] View usage statistics (as business)

### Validation
- [ ] Email format validation
- [ ] Lebanese phone format: +961 XXXXXXXX (8 digits)
- [ ] Password minimum 8 characters
- [ ] Coupon discount 0-100%
- [ ] Expiry dates in the future
- [ ] Check user subscription status before allowing redemption
- [ ] Check coupon expiry before allowing redemption

---

## 🔑 Key Concepts to Understand

### 1. Authentication Flow
```
User registers → User logs in → Receive JWT token → 
Store token in localStorage → Include in all authenticated requests
```

### 2. User Subscription
- Users get 1-year subscription from `startDate`
- Cannot use coupons if subscription is expired
- Can renew subscription to extend by 1 more year
- Check `expiryDate` before showing "Redeem" button

### 3. Business Models
- **Unlimited:** Can create unlimited coupons
- **Limited:** Has a `usageLimit` (e.g., 100 coupons)
  - Each coupon created decrements the limit
  - Each coupon redeemed decrements the limit
  - Show usage bar on business dashboard

### 4. Coupon Redemption Rules
User can redeem a coupon ONLY if:
- ✅ User is active (status = "active")
- ✅ User's subscription hasn't expired
- ✅ Coupon hasn't expired
- ✅ User hasn't exceeded `maxUsagePerUser` limit

If any of these fail → Show specific error message

### 5. Soft Deletes
- Users and coupons are marked "inactive", not deleted
- Deleted items won't appear in list views
- Data is preserved in database

---

## 💻 Common Implementation Patterns

### Authenticating a Request
```javascript
// Include JWT in every authenticated request
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
};
```

### Checking User Expiry
```javascript
const isUserExpired = (expiryDate) => new Date(expiryDate) < new Date();

// In coupon redemption:
if (isUserExpired(user.expiryDate)) {
  showError('Your subscription has expired. Please renew.');
  return;
}
```

### Validating Phone Format
```javascript
const isValidPhone = (phone) => /^\+961 \d{1,2} \d{3} \d{3,4}$/.test(phone);
```

### Formatting Dates for API
```javascript
// Always send ISO 8601 format
const expiryDate = new Date('2025-12-31').toISOString();
// Result: "2025-12-31T00:00:00.000Z"
```

### Pagination
```javascript
// Always include page and limit parameters
const url = `/coupons?page=${page}&limit=20`;

// Use pagination info from response:
const { data, pagination } = response;
const totalPages = pagination.pages;
```

---

## ⚠️ Important Rules

1. **Always validate Lebanese phone format:** `+961 XXXXXXXX` (8 digits)
2. **Always check user subscription expiry** before allowing coupon redemption
3. **Always check coupon expiry** before allowing redemption
4. **Never send passwords in response** - backend won't include them
5. **Always use ISO 8601 dates** for API communication
6. **Always include Authorization header** for authenticated endpoints
7. **Handle 401 Unauthorized** by redirecting to login
8. **Handle 409 Conflict** by showing "already exists" error
9. **Limited businesses can run out of coupons** - check remaining before creating
10. **Soft deletes are permanent** - deactivated items won't reappear

---

## 🛠️ Development Workflow

### Phase 1: Setup (1-2 hours)
- [ ] Read API_QUICK_REFERENCE.md
- [ ] Import Postman collection
- [ ] Test all endpoints in Postman
- [ ] Set up API client code

### Phase 2: Authentication (2-3 hours)
- [ ] Implement login form
- [ ] Store JWT token
- [ ] Implement logout
- [ ] Auto-login redirect

### Phase 3: Core Features (4-6 hours)
- [ ] User registration
- [ ] Browse coupons (list view)
- [ ] View coupon details
- [ ] Redeem coupon (main feature)

### Phase 4: Business Features (3-4 hours)
- [ ] Business registration
- [ ] Create coupons
- [ ] View statistics
- [ ] Update business info

### Phase 5: User Features (2-3 hours)
- [ ] User profile page
- [ ] Update profile
- [ ] Renew subscription
- [ ] View subscription status

### Phase 6: Polish (1-2 hours)
- [ ] Error handling
- [ ] Loading states
- [ ] Form validation
- [ ] Responsive design

---

## 🐛 Debugging Tips

### Token Issues
```javascript
// Check if token is stored
console.log(localStorage.getItem('token'));

// Check if token is being sent
// Enable network tab in DevTools → look for Authorization header
```

### API Errors
```javascript
// Always check the response error message
try {
  await api.call();
} catch (error) {
  console.error('Error:', error.message);
  // Error message tells you exactly what went wrong
}
```

### Date Issues
```javascript
// Always use ISO 8601 format
console.log(new Date().toISOString());  // ✓ Correct
console.log(new Date().toString());     // ✗ Wrong format

// Check if date is expired
console.log(new Date('2026-05-28') > new Date());  // ✓ Easy comparison
```

### Validation Errors
```javascript
// Common validation errors and solutions:
"Invalid Lebanese phone" → Use format +961 71 123 456
"Email already exists" → Check if user already registered
"Password must be at least 8 characters" → Use longer password
"Discount must be between 0 and 100" → Use percentage 0-100
```

---

## 📞 API Support

### If endpoint returns 401 (Unauthorized)
- Token is missing or expired
- Re-login and get new token
- Store new token in localStorage

### If endpoint returns 403 (Forbidden)
- User doesn't have permission
- Only business can create coupons
- Only admin can delete users
- Check user role

### If endpoint returns 404 (Not Found)
- Resource doesn't exist
- Check if ID is correct
- Resource might have been deleted

### If endpoint returns 409 (Conflict)
- Email or coupon code already exists
- Use different email or code
- Cannot re-use existing values

---

## ✅ Before Going Live

- [ ] All endpoints tested in Postman
- [ ] API client code integrated
- [ ] Authentication flow working
- [ ] User registration working
- [ ] Coupon redemption working
- [ ] Error messages user-friendly
- [ ] Loading states implemented
- [ ] Form validation working
- [ ] Responsive design tested
- [ ] XSS protection (sanitize inputs)
- [ ] CSRF protection (if needed)
- [ ] Security review completed

---

## 📞 Questions?

**Refer to:**
1. **API_QUICK_REFERENCE.md** - For endpoint details
2. **FRONTEND_INTEGRATION_GUIDE.md** - For implementation examples
3. **DASHBOARD_API.md** - For full specification
4. **Dashboard_APIs.postman_collection.json** - To test endpoints

**For bugs or issues:**
1. Check error message from API
2. Look up error in DASHBOARD_API.md troubleshooting section
3. Verify validation rules are followed
4. Test endpoint in Postman first

---

## 🎓 Learning Path

### Beginner
1. Read **API_QUICK_REFERENCE.md** (10 min)
2. Test endpoints in **Postman** (15 min)
3. Follow "Getting Started in 5 Steps" (30 min)

### Intermediate
1. Read **FRONTEND_INTEGRATION_GUIDE.md** sections relevant to your feature (30 min)
2. Copy code examples and adapt to your framework (1 hour)
3. Test in browser with DevTools (30 min)

### Advanced
1. Read complete **DASHBOARD_API.md** for edge cases (1 hour)
2. Implement advanced patterns (error handling, optimistic updates) (2 hours)
3. Optimize performance (debouncing, caching) (1 hour)

---

**Total Time to Integration:** 4-6 hours for basic features, 8-10 hours for full implementation.

Good luck! 🚀
