# Frontend Integration Guide - Dashboard APIs

Complete guide for integrating the Coupon Management Dashboard APIs into your React frontend.

---

## Table of Contents
1. [Base Setup](#base-setup)
2. [Authentication](#authentication)
3. [Users API](#users-api)
4. [Businesses API](#businesses-api)
5. [Coupons API](#coupons-api)
6. [Error Handling](#error-handling)
7. [Best Practices](#best-practices)

---

## Base Setup

### API Base URL
```
http://localhost:4000/api/dashboard
```

### Headers for All Requests
```javascript
{
  'Content-Type': 'application/json',
  'Authorization': 'Bearer <token>'  // Only for authenticated endpoints
}
```

### Environment Configuration
Create an environment variable file (`.env.local`):
```
REACT_APP_API_BASE_URL=http://localhost:4000/api/dashboard
```

### API Client Setup (Example with Fetch)
```javascript
// apiClient.ts
export const apiClient = {
  baseUrl: process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api/dashboard',
  token: localStorage.getItem('token'),

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'API Error');
    }

    return response.json();
  },

  get(endpoint) {
    return this.request(endpoint, { method: 'GET' });
  },

  post(endpoint, body) {
    return this.request(endpoint, { method: 'POST', body: JSON.stringify(body) });
  },

  put(endpoint, body) {
    return this.request(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  },

  delete(endpoint) {
    return this.request(endpoint, { method: 'DELETE' });
  },

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  },

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  },
};
```

---

## Authentication

### Login Endpoint
User login for the dashboard.

#### Login
```javascript
const login = async (email, password) => {
  const response = await apiClient.post('/auth', {
    email: 'john@example.com',
    password: 'securepass123'
  });

  // Response:
  // {
  //   "success": true,
  //   "data": {
  //     "token": "eyJhbGciOiJIUzI1NiIs...",
  //     "user": {
  //       "id": "60d5ec49c1234567890abcde",
  //       "email": "john@example.com",
  //       "role": "user"
  //     }
  //   }
  // }

  // Store token and user info
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  apiClient.setToken(response.data.token);
  
  return response.data.user;
};
```

#### Logout
```javascript
const logout = () => {
  apiClient.clearToken();
  localStorage.removeItem('user');
  // Redirect to login page
  window.location.href = '/login';
};
```

---

## Users API

### 1. Create User (Registration)
**Endpoint:** `POST /users`  
**Authentication:** None (public)  
**Purpose:** User self-registration

```javascript
const registerUser = async (userData) => {
  try {
    const response = await apiClient.post('/users', {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'securepass123',  // Min 8 characters
      phone: '+961 71123456',    // Format: +961 XXXXXXXX (8 digits)
      status: 'active'             // Optional, defaults to 'active'
    });

    console.log('User created:', response.data);
    // Auto-login user after registration
    const loginResponse = await apiClient.post('/auth', {
      email: 'john@example.com',
      password: 'securepass123',
      type: 'user'
    });
    apiClient.setToken(loginResponse.data.token);
  } catch (error) {
    console.error('Registration failed:', error.message);
    // Validation errors: Email already exists, Invalid phone format, etc.
  }
};
```

### 2. Get Current User
**Endpoint:** `GET /users/me`  
**Authentication:** Required  
**Purpose:** Get logged-in user's profile

```javascript
const getCurrentUser = async () => {
  try {
    const response = await apiClient.get('/users/me');
    console.log('Current user:', response.data);
    // {
    //   "id": "60d5ec49c1234567890abcde",
    //   "name": "John Doe",
    //   "email": "john@example.com",
    //   "phone": "+961 71 123 456",
    //   "status": "active",
    //   "startDate": "2026-05-28T10:00:00Z",
    //   "expiryDate": "2027-05-28T10:00:00Z",
    //   "createdAt": "2026-05-28T10:00:00Z"
    // }
  } catch (error) {
    console.error('Failed to fetch user:', error.message);
  }
};

// Call on app load to check if user is logged in
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    apiClient.setToken(token);
    getCurrentUser();
  }
}, []);
```

### 3. Get User by ID
**Endpoint:** `GET /users/:id`  
**Authentication:** None (public)  
**Purpose:** Get any user's public profile

```javascript
const getUser = async (userId) => {
  try {
    const response = await apiClient.get(`/users/${userId}`);
    console.log('User profile:', response.data);
  } catch (error) {
    console.error('User not found:', error.message);
  }
};
```

### 4. Get All Users (Admin Only)
**Endpoint:** `GET /users?page=1&limit=20&status=active`  
**Authentication:** Required (admin only)  
**Purpose:** List all users (for admin dashboard)

```javascript
const getAllUsers = async (page = 1, limit = 20, status = 'active') => {
  try {
    const response = await apiClient.get(`/users?page=${page}&limit=${limit}&status=${status}`);
    // {
    //   "success": true,
    //   "data": {
    //     "data": [ /* array of users */ ],
    //     "pagination": {
    //       "page": 1,
    //       "limit": 20,
    //       "total": 100,
    //       "pages": 5
    //     }
    //   }
    // }
    return response.data;
  } catch (error) {
    console.error('Failed to fetch users:', error.message);
  }
};

// Usage in pagination component
const [page, setPage] = useState(1);
const [users, setUsers] = useState([]);

const loadUsers = async () => {
  const result = await getAllUsers(page);
  setUsers(result.data);
};

useEffect(() => {
  loadUsers();
}, [page]);
```

### 5. Update User
**Endpoint:** `PUT /users/:id`  
**Authentication:** Required (can update own, admin can update any)  
**Purpose:** Update user profile

```javascript
const updateUser = async (userId, updateData) => {
  try {
    const response = await apiClient.put(`/users/${userId}`, {
      name: 'John Updated',          // Optional
      phone: '+961 71 987 654',      // Optional
      status: 'active'                // Optional
    });

    console.log('User updated:', response.data);
    // Update local state/context
  } catch (error) {
    console.error('Update failed:', error.message);
  }
};

// Usage in profile edit form
const handleUpdateProfile = async (formData) => {
  const currentUser = JSON.parse(localStorage.getItem('user'));
  await updateUser(currentUser.id, {
    name: formData.name,
    phone: formData.phone
  });
};
```

### 6. Renew User Subscription
**Endpoint:** `POST /users/:id/renew`  
**Authentication:** Required (can renew own, admin can renew any)  
**Purpose:** Extend user's subscription by 1 year

```javascript
const renewSubscription = async (userId) => {
  try {
    const response = await apiClient.post(`/users/${userId}/renew`, {});
    console.log('Subscription renewed until:', response.data.expiryDate);
    // Update user in local state
  } catch (error) {
    console.error('Renewal failed:', error.message);
  }
};

// Usage: Show renewal button when subscription is about to expire
const isExpiringSoon = (expiryDate) => {
  const daysUntilExpiry = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
  return daysUntilExpiry <= 30;  // Show warning if less than 30 days
};
```

### 7. Delete User (Soft Delete)
**Endpoint:** `DELETE /users/:id`  
**Authentication:** Required (admin only)  
**Purpose:** Deactivate user account

```javascript
const deleteUser = async (userId) => {
  try {
    await apiClient.delete(`/users/${userId}`);
    console.log('User deleted (marked inactive)');
    // Refresh users list
  } catch (error) {
    console.error('Deletion failed:', error.message);
  }
};
```

---

## Businesses API

### 1. Create Business (Registration)
**Endpoint:** `POST /businesses`  
**Authentication:** None (public)  
**Purpose:** Business self-registration

```javascript
const registerBusiness = async (businessData) => {
  try {
    const response = await apiClient.post('/businesses', {
      name: 'Restaurant ABC',
      type: 'restaurant',                     // restaurant | hotel | other
      email: 'owner@restaurant.com',
      password: 'securepass123',             // Min 8 characters
      phone: '+961 71111111',              // Format: +961 XXXXXXXX (8 digits)
      ownerName: 'Owner Name',
      city: 'Beirut',                        // One of 12 Lebanese cities
      businessModel: 'limited',              // unlimited | limited
      usageLimit: 100                        // Required if businessModel is 'limited'
    });

    console.log('Business created:', response.data);
    // Auto-login business
    const loginResponse = await apiClient.post('/auth', {
      email: 'owner@restaurant.com',
      password: 'securepass123',
      type: 'business'
    });
    apiClient.setToken(loginResponse.data.token);
  } catch (error) {
    console.error('Registration failed:', error.message);
  }
};

// Valid Lebanese Cities
const LEBANESE_CITIES = [
  'Beirut', 'Tripoli', 'Sidon', 'Tyre', 'Zahle',
  'Jounieh', 'Baalbek', 'Nabatieh', 'Byblos',
  'Aley', 'Chouf', 'Bint Jbeil'
];
```

### 2. Get All Businesses
**Endpoint:** `GET /businesses?page=1&limit=20&type=restaurant&city=Beirut`  
**Authentication:** None (public)  
**Purpose:** Browse all businesses with filters

```javascript
const getAllBusinesses = async (page = 1, limit = 20, type = null, city = null) => {
  try {
    let url = `/businesses?page=${page}&limit=${limit}`;
    if (type) url += `&type=${type}`;
    if (city) url += `&city=${city}`;

    const response = await apiClient.get(url);
    // {
    //   "data": {
    //     "data": [
    //       {
    //         "id": "...",
    //         "name": "Restaurant ABC",
    //         "type": "restaurant",
    //         "city": "Beirut",
    //         "businessModel": "limited",
    //         "couponsCount": 5,
    //         "totalUsageCount": 150
    //       }
    //     ],
    //     "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 }
    //   }
    // }
    return response.data;
  } catch (error) {
    console.error('Failed to fetch businesses:', error.message);
  }
};

// Usage: Business listing with filters
const [businesses, setBusinesses] = useState([]);
const [selectedType, setSelectedType] = useState(null);
const [selectedCity, setSelectedCity] = useState(null);

const loadBusinesses = async () => {
  const result = await getAllBusinesses(1, 20, selectedType, selectedCity);
  setBusinesses(result.data);
};

useEffect(() => {
  loadBusinesses();
}, [selectedType, selectedCity]);
```

### 3. Get Business by ID
**Endpoint:** `GET /businesses/:id`  
**Authentication:** None (public)  
**Purpose:** Get business details with stats

```javascript
const getBusiness = async (businessId) => {
  try {
    const response = await apiClient.get(`/businesses/${businessId}`);
    const business = response.data;
    // {
    //   "id": "...",
    //   "name": "Restaurant ABC",
    //   "type": "restaurant",
    //   "email": "owner@restaurant.com",
    //   "phone": "+961 71 111 111",
    //   "ownerName": "Owner Name",
    //   "city": "Beirut",
    //   "businessModel": "limited",
    //   "usageLimit": 100,
    //   "couponsCount": 5,
    //   "totalUsageCount": 150
    // }
    return business;
  } catch (error) {
    console.error('Business not found:', error.message);
  }
};

// Usage: Business detail page
const BusinessDetailPage = ({ businessId }) => {
  const [business, setBusiness] = useState(null);

  useEffect(() => {
    getBusiness(businessId).then(setBusiness);
  }, [businessId]);

  if (!business) return <div>Loading...</div>;

  return (
    <div>
      <h1>{business.name}</h1>
      <p>Type: {business.type}</p>
      <p>Coupons: {business.couponsCount}</p>
      <p>City: {business.city}</p>
    </div>
  );
};
```

### 4. Update Business
**Endpoint:** `PUT /businesses/:id`  
**Authentication:** Required (business owner or admin)  
**Purpose:** Update business information

```javascript
const updateBusiness = async (businessId, updateData) => {
  try {
    const response = await apiClient.put(`/businesses/${businessId}`, {
      name: 'Restaurant ABC Updated',      // Optional
      type: 'hotel',                        // Optional
      phone: '+961 71 222 222',            // Optional
      ownerName: 'New Owner',              // Optional
      usageLimit: 200                      // Optional (for limited model only)
    });

    console.log('Business updated:', response.data);
  } catch (error) {
    console.error('Update failed:', error.message);
  }
};
```

### 5. Get Usage Remaining (For Limited Model)
**Endpoint:** `GET /businesses/:id/usage-remaining`  
**Authentication:** Required (business owner only)  
**Purpose:** Check remaining coupon usage for limited businesses

```javascript
const getUsageRemaining = async (businessId) => {
  try {
    const response = await apiClient.get(`/businesses/${businessId}/usage-remaining`);
    
    if (response.data.businessModel === 'unlimited') {
      console.log('Unlimited usage');
      return { unlimited: true };
    } else {
      const { totalLimit, usedCount, remainingCount } = response.data;
      // {
      //   "businessModel": "limited",
      //   "totalLimit": 100,
      //   "usedCount": 35,
      //   "remainingCount": 65
      // }
      return { unlimited: false, totalLimit, usedCount, remainingCount };
    }
  } catch (error) {
    console.error('Failed to fetch usage:', error.message);
  }
};

// Usage: Business dashboard showing usage bar
const BusinessDashboard = ({ businessId }) => {
  const [usage, setUsage] = useState(null);

  useEffect(() => {
    getUsageRemaining(businessId).then(setUsage);
  }, [businessId]);

  if (!usage) return <div>Loading...</div>;

  if (usage.unlimited) {
    return <div>Unlimited coupons available</div>;
  }

  const percentage = (usage.usedCount / usage.totalLimit) * 100;
  return (
    <div>
      <p>Used: {usage.usedCount} / {usage.totalLimit}</p>
      <div style={{ width: '100%', backgroundColor: '#eee' }}>
        <div style={{ width: `${percentage}%`, backgroundColor: '#4CAF50', height: '20px' }} />
      </div>
    </div>
  );
};
```

---

## Coupons API

### 1. Create Coupon
**Endpoint:** `POST /coupons`  
**Authentication:** Required (business only)  
**Purpose:** Create a new coupon

```javascript
const createCoupon = async (couponData) => {
  try {
    const response = await apiClient.post('/coupons', {
      code: 'SAVE20',                          // Unique code
      discount: 20,                           // 0-100
      description: '20% off on all items',
      expiryDate: '2025-12-31T23:59:59Z',    // ISO 8601 format, must be in future
      maxUsagePerUser: 5                      // How many times a user can use it
    });

    console.log('Coupon created:', response.data);
    // Check if business has limited model - usage might be decremented
    return response.data;
  } catch (error) {
    console.error('Creation failed:', error.message);
    // Possible errors:
    // - "Coupon code already exists" (409)
    // - "Discount must be between 0 and 100"
    // - "Expiry date must be in the future"
    // - "Business has reached its usage limit"
  }
};

// Usage: Create coupon form in business dashboard
const CreateCouponForm = ({ businessId }) => {
  const [formData, setFormData] = useState({
    code: '',
    discount: 50,
    description: '',
    expiryDate: '',
    maxUsagePerUser: 3
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createCoupon(formData);
      alert('Coupon created successfully!');
      // Reset form and refresh list
    } catch (error) {
      alert(`Error: ${error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        placeholder="Coupon Code (e.g., SAVE20)"
        value={formData.code}
        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
        required
      />
      <input
        type="number"
        placeholder="Discount %"
        min="0"
        max="100"
        value={formData.discount}
        onChange={(e) => setFormData({ ...formData, discount: parseInt(e.target.value) })}
        required
      />
      <textarea
        placeholder="Description"
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        required
      />
      <input
        type="datetime-local"
        value={formData.expiryDate}
        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
        required
      />
      <input
        type="number"
        placeholder="Max uses per user"
        min="1"
        value={formData.maxUsagePerUser}
        onChange={(e) => setFormData({ ...formData, maxUsagePerUser: parseInt(e.target.value) })}
        required
      />
      <button type="submit">Create Coupon</button>
    </form>
  );
};
```

### 2. Get All Coupons
**Endpoint:** `GET /coupons?page=1&limit=20&businessId=xxx&code=SAVE20`  
**Authentication:** None (public)  
**Purpose:** Browse all active coupons

```javascript
const getAllCoupons = async (page = 1, limit = 20, businessId = null, code = null) => {
  try {
    let url = `/coupons?page=${page}&limit=${limit}`;
    if (businessId) url += `&businessId=${businessId}`;
    if (code) url += `&code=${code}`;

    const response = await apiClient.get(url);
    // {
    //   "data": {
    //     "data": [
    //       {
    //         "id": "...",
    //         "code": "SAVE20",
    //         "businessId": "...",
    //         "businessName": "Restaurant ABC",
    //         "discount": 20,
    //         "description": "20% off on all items",
    //         "expiryDate": "2025-12-31T23:59:59Z",
    //         "maxUsagePerUser": 5,
    //         "totalUsageCount": 150
    //       }
    //     ],
    //     "pagination": { "page": 1, "limit": 20, "total": 500, "pages": 25 }
    //   }
    // }
    return response.data;
  } catch (error) {
    console.error('Failed to fetch coupons:', error.message);
  }
};

// Usage: Coupon listing with search and filters
const CouponListingPage = ({ businessId }) => {
  const [coupons, setCoupons] = useState([]);
  const [page, setPage] = useState(1);
  const [searchCode, setSearchCode] = useState('');

  const loadCoupons = async () => {
    const result = await getAllCoupons(page, 20, businessId, searchCode);
    setCoupons(result.data);
  };

  useEffect(() => {
    loadCoupons();
  }, [page, searchCode, businessId]);

  return (
    <div>
      <input
        placeholder="Search by coupon code"
        value={searchCode}
        onChange={(e) => { setSearchCode(e.target.value); setPage(1); }}
      />
      <div className="coupons-grid">
        {coupons.map(coupon => (
          <CouponCard key={coupon.id} coupon={coupon} />
        ))}
      </div>
      {/* Pagination controls */}
    </div>
  );
};
```

### 3. Get Coupon by ID
**Endpoint:** `GET /coupons/:id`  
**Authentication:** None (public)  
**Purpose:** Get coupon details

```javascript
const getCoupon = async (couponId) => {
  try {
    const response = await apiClient.get(`/coupons/${couponId}`);
    return response.data;
  } catch (error) {
    console.error('Coupon not found:', error.message);
  }
};
```

### 4. Update Coupon
**Endpoint:** `PUT /coupons/:id`  
**Authentication:** Required (business owner only)  
**Purpose:** Update coupon (cannot change discount or code)

```javascript
const updateCoupon = async (couponId, updateData) => {
  try {
    const response = await apiClient.put(`/coupons/${couponId}`, {
      description: 'Updated description',    // Optional
      expiryDate: '2026-12-31T23:59:59Z',   // Optional
      maxUsagePerUser: 10                   // Optional
      // Note: code and discount cannot be changed after creation
    });

    console.log('Coupon updated:', response.data);
  } catch (error) {
    console.error('Update failed:', error.message);
  }
};
```

### 5. Delete Coupon (Soft Delete)
**Endpoint:** `DELETE /coupons/:id`  
**Authentication:** Required (business owner only)  
**Purpose:** Deactivate coupon

```javascript
const deleteCoupon = async (couponId) => {
  try {
    await apiClient.delete(`/coupons/${couponId}`);
    console.log('Coupon deleted (marked inactive)');
  } catch (error) {
    console.error('Deletion failed:', error.message);
  }
};
```

### 6. Use/Redeem Coupon
**Endpoint:** `POST /coupons/:id/use`  
**Authentication:** Required (user only)  
**Purpose:** User redeems a coupon

```javascript
const useCoupon = async (couponId) => {
  try {
    const response = await apiClient.post(`/coupons/${couponId}/use`, {});
    // {
    //   "success": true,
    //   "data": {
    //     "couponUsage": {
    //       "id": "...",
    //       "couponId": "...",
    //       "userId": "...",
    //       "businessId": "...",
    //       "usedAt": "2026-05-28T15:30:45Z"
    //     }
    //   }
    // }
    console.log('Coupon used successfully!');
    return response.data.couponUsage;
  } catch (error) {
    console.error('Failed to use coupon:', error.message);
    // Possible errors:
    // - "User account is inactive"
    // - "User subscription has expired"
    // - "Coupon has expired"
    // - "Coupon usage limit exceeded for this user"
  }
};

// Usage: Coupon redemption button in user dashboard
const CouponCard = ({ coupon, userId }) => {
  const [loading, setLoading] = useState(false);
  const [used, setUsed] = useState(false);

  const handleRedeem = async () => {
    setLoading(true);
    try {
      await useCoupon(coupon.id);
      setUsed(true);
      alert('Coupon redeemed successfully!');
    } catch (error) {
      alert(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = new Date(coupon.expiryDate) < new Date();

  return (
    <div className="coupon-card">
      <h3>{coupon.code}</h3>
      <p className="discount">{coupon.discount}% OFF</p>
      <p className="description">{coupon.description}</p>
      <p className="business">From: {coupon.businessName}</p>
      <p className="expiry">Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</p>
      <button
        onClick={handleRedeem}
        disabled={loading || isExpired || used}
        className={isExpired ? 'expired' : used ? 'used' : ''}
      >
        {isExpired ? 'Expired' : used ? 'Used' : loading ? 'Redeeming...' : 'Redeem'}
      </button>
    </div>
  );
};
```

### 7. Get Coupon Usage Statistics
**Endpoint:** `GET /coupons/:id/usage-stats`  
**Authentication:** Required (business owner only)  
**Purpose:** Get detailed usage analytics for a coupon

```javascript
const getCouponUsageStats = async (couponId) => {
  try {
    const response = await apiClient.get(`/coupons/${couponId}/usage-stats`);
    // {
    //   "couponId": "...",
    //   "code": "SAVE20",
    //   "totalUsageCount": 150,
    //   "maxUsagePerUser": 5,
    //   "uniqueUsersCount": 45,
    //   "usageHistory": [
    //     {
    //       "userId": "...",
    //       "userName": "John Doe",
    //       "userEmail": "john@example.com",
    //       "usageCount": 3,
    //       "usages": [ "2026-05-20T10:00:00Z", "2026-05-21T14:30:00Z", ... ]
    //     }
    //   ]
    // }
    return response.data;
  } catch (error) {
    console.error('Failed to fetch stats:', error.message);
  }
};

// Usage: Analytics page for business owner
const CouponAnalyticsPage = ({ couponId }) => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getCouponUsageStats(couponId).then(setStats);
  }, [couponId]);

  if (!stats) return <div>Loading...</div>;

  return (
    <div className="analytics">
      <h2>{stats.code}</h2>
      <div className="stat">
        <label>Total Redemptions:</label>
        <span>{stats.totalUsageCount}</span>
      </div>
      <div className="stat">
        <label>Unique Users:</label>
        <span>{stats.uniqueUsersCount}</span>
      </div>
      <div className="stat">
        <label>Max per User:</label>
        <span>{stats.maxUsagePerUser}</span>
      </div>
      <table>
        <thead>
          <tr>
            <th>User Name</th>
            <th>Email</th>
            <th>Times Used</th>
            <th>Last Used</th>
          </tr>
        </thead>
        <tbody>
          {stats.usageHistory.map(user => (
            <tr key={user.userId}>
              <td>{user.userName}</td>
              <td>{user.userEmail}</td>
              <td>{user.usageCount}</td>
              <td>{user.usages[user.usages.length - 1] ? new Date(user.usages[user.usages.length - 1]).toLocaleDateString() : '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
```

---

## Error Handling

### Standard Error Response Format
```javascript
{
  "success": false,
  "error": "Error message",
  "timestamp": "2026-05-28T10:00:00Z"
}
```

### HTTP Status Codes
- **400** - Bad Request (Validation error)
- **401** - Unauthorized (Missing/invalid token)
- **403** - Forbidden (Insufficient permissions)
- **404** - Not Found (Resource doesn't exist)
- **409** - Conflict (Email/code already exists)
- **500** - Server Error

### Global Error Handler
```javascript
// errorHandler.ts
export const handleApiError = (error) => {
  if (error instanceof Error) {
    const message = error.message;
    
    // Check if it's a validation error
    if (message.includes('Email already exists')) {
      return { field: 'email', message: 'This email is already registered' };
    }
    if (message.includes('Invalid Lebanese phone')) {
      return { field: 'phone', message: 'Phone must be in format: +961 XXXXXXXX (8 digits)' };
    }
    if (message.includes('Password must be')) {
      return { field: 'password', message: 'Password must be at least 8 characters' };
    }
    if (message.includes('expired')) {
      return { type: 'warning', message: 'Your subscription has expired. Please renew.' };
    }
    if (message.includes('usage limit exceeded')) {
      return { type: 'warning', message: 'You have reached the coupon usage limit' };
    }
    if (message.includes('Unauthorized')) {
      return { type: 'error', message: 'Please log in first' };
    }
    if (message.includes('Forbidden')) {
      return { type: 'error', message: 'You do not have permission to access this resource' };
    }
    
    return { type: 'error', message };
  }
  
  return { type: 'error', message: 'An unexpected error occurred' };
};

// Usage in components
const handleSubmit = async (formData) => {
  try {
    await createCoupon(formData);
  } catch (error) {
    const errorInfo = handleApiError(error);
    if (errorInfo.field) {
      setFieldError(errorInfo.field, errorInfo.message);
    } else {
      setGlobalError(errorInfo.message);
    }
  }
};
```

---

## Best Practices

### 1. Token Management
```javascript
// Store in secure location
const storeToken = (token) => {
  localStorage.setItem('token', token);
  // Or use HttpOnly cookie for better security
};

// Clear on logout
const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  apiClient.clearToken();
};

// Refresh token before expiry (optional, implement if needed)
const refreshTokenIfNeeded = async () => {
  const token = localStorage.getItem('token');
  if (token) {
    apiClient.setToken(token);
  }
};
```

### 2. Request Debouncing
```javascript
// Prevent duplicate requests when user searches
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (searchTerm) => {
  const result = await getAllCoupons(1, 20, null, searchTerm);
  setCoupons(result.data);
}, 500);

const handleSearch = (e) => {
  const value = e.target.value;
  setSearchTerm(value);
  debouncedSearch(value);
};
```

### 3. Pagination Implementation
```javascript
const PaginatedList = ({ apiCall, pageSize = 20 }) => {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadItems = async (pageNum) => {
    const result = await apiCall(pageNum, pageSize);
    setItems(result.data);
    setTotal(result.pagination.total);
  };

  const pages = Math.ceil(total / pageSize);

  return (
    <div>
      {items.map(item => <ItemComponent key={item.id} item={item} />)}
      <div className="pagination">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {pages}</span>
        <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}>
          Next
        </button>
      </div>
    </div>
  );
};
```

### 4. Date Handling
```javascript
// Always use ISO 8601 format for API communication
const formatDateForAPI = (date) => {
  return new Date(date).toISOString();
};

// Format for display
const formatDateForDisplay = (isoString) => {
  return new Date(isoString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Check if expired
const isExpired = (expiryDate) => {
  return new Date(expiryDate) < new Date();
};

// Days until expiry
const daysUntilExpiry = (expiryDate) => {
  const diffTime = new Date(expiryDate) - new Date();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
```

### 5. Form Validation Before API Call
```javascript
const validateCouponForm = (formData) => {
  const errors = {};

  if (!formData.code || formData.code.trim() === '') {
    errors.code = 'Coupon code is required';
  }

  if (!formData.discount || formData.discount < 0 || formData.discount > 100) {
    errors.discount = 'Discount must be between 0 and 100';
  }

  if (!formData.expiryDate) {
    errors.expiryDate = 'Expiry date is required';
  } else if (new Date(formData.expiryDate) <= new Date()) {
    errors.expiryDate = 'Expiry date must be in the future';
  }

  if (!formData.maxUsagePerUser || formData.maxUsagePerUser < 1) {
    errors.maxUsagePerUser = 'Max usage must be at least 1';
  }

  return Object.keys(errors).length === 0 ? null : errors;
};
```

### 6. Optimistic Updates
```javascript
const redeemCoupon = async (coupon) => {
  // Update UI immediately (optimistic)
  setRedeemedCoupons([...redeemedCoupons, coupon.id]);

  try {
    // Make API call
    await useCoupon(coupon.id);
    // Success - UI is already updated
  } catch (error) {
    // Revert on error
    setRedeemedCoupons(redeemedCoupons.filter(id => id !== coupon.id));
    showError('Failed to redeem coupon');
  }
};
```

### 7. Loading States
```javascript
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const fetchData = async () => {
  setLoading(true);
  setError(null);

  try {
    const result = await getAllCoupons();
    // Update state with result
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

if (loading) return <Spinner />;
if (error) return <ErrorMessage message={error} />;
return <DataDisplay data={data} />;
```

---

## Summary

**Key Points for Frontend Implementation:**
1. ✅ Always include `Authorization: Bearer <token>` for authenticated endpoints
2. ✅ Handle all error responses and display user-friendly messages
3. ✅ Validate form inputs before API calls
4. ✅ Use ISO 8601 format for all dates
5. ✅ Implement proper loading and error states
6. ✅ Store JWT token securely (localStorage or HttpOnly cookie)
7. ✅ Check user/coupon expiry before allowing operations
8. ✅ Handle limited business usage limits appropriately
9. ✅ Implement pagination for list views
10. ✅ Use debouncing for search/filter inputs

For any questions, refer to the `DASHBOARD_API.md` and `Dashboard_APIs.postman_collection.json` files.
