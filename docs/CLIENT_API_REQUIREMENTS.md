# API Integration Requirements - Vishwa Lifestyle

To enable real-time data sync between the Vishwa Lifestyle website and your platform, please provide the following details.

---

## 1. Your API Endpoint

We will send HTTP `POST` requests to your API when events occur.

| Question | Your Answer |
| :--- | :--- |
| **Webhook URL** | `https://your-platform.com/api/webhook` |
| **Backup URL (optional)** | |

---

## 2. Authentication

How should we authenticate our requests to your API?

| Method | Details Needed |
| :--- | :--- |
| **API Key in Header** | Header name (e.g., `X-API-Key`) and the key value |
| **Bearer Token** | The token string |
| **Basic Auth** | Username and Password |
| **No Auth** | (Not recommended) |

---

## 3. Events We Will Send

We will call your API for the following events:

### Event: `order_placed`
Triggered when a customer successfully completes a payment.

**Sample Payload:**
```json
{
  "event": "order_placed",
  "timestamp": "2025-12-05T12:00:00Z",
  "data": {
    "order_id": "VL12345ABC",
    "customer_email": "customer@example.com",
    "customer_phone": "+919876543210",
    "items": [
      { "name": "Product Name", "quantity": 2, "price": 499 }
    ],
    "subtotal": 998,
    "discount": 100,
    "shipping": 0,
    "tax": 180,
    "total": 1078,
    "shipping_address": {
      "name": "Customer Name",
      "line1": "123 Street",
      "city": "Mumbai",
      "state": "Maharashtra",
      "postal_code": "400001"
    },
    "payment_status": "paid"
  }
}
```

> **Question:** Do you need any additional fields? Or should we remove any?

---

### Event: `user_signup`
Triggered when a new user registers on the website.

**Sample Payload:**
```json
{
  "event": "user_signup",
  "timestamp": "2025-12-05T12:00:00Z",
  "data": {
    "user_id": "uuid-here",
    "email": "newuser@example.com",
    "name": "New User",
    "phone": "+919876543210",
    "signup_method": "email" 
  }
}
```

> **Note:** `signup_method` can be `email` or `google`.

---

### Event: `user_login`
Triggered when an existing user logs in.

**Sample Payload:**
```json
{
  "event": "user_login",
  "timestamp": "2025-12-05T12:00:00Z",
  "data": {
    "user_id": "uuid-here",
    "email": "user@example.com",
    "login_method": "email"
  }
}
```

---

## 4. Expected Response

What response should we expect from your API?

**Typical Success Response:**
```json
{
  "success": true,
  "message": "Event received"
}
```

**HTTP Status Codes:**
- `200 OK` - Event received successfully
- `4xx` - Client error (we will log but not retry)
- `5xx` - Server error (we can implement retry logic if needed)

---

## 5. Summary Checklist

Please fill in and return:

- [ ] Webhook URL: `________________________`
- [ ] Auth Method: `________________________`
- [ ] Auth Credentials: `________________________`
- [ ] Any changes to order payload? `________________________`
- [ ] Any changes to user payload? `________________________`
- [ ] Do you need retry on failure? `Yes / No`

---

Once you provide these details, we will implement the integration and test it with your staging/production environment.
