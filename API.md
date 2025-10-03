# API Documentation

Complete API reference for KCS Meet backend endpoints.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [Payment APIs](#payment-apis)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)
- [Webhooks](#webhooks)

---

## Overview

KCS Meet uses Next.js API routes for backend functionality. All API endpoints are located in the `/api` directory.

### Base URL

**Development**: `http://localhost:3000/api`  
**Production**: `https://your-domain.com/api`

### Response Format

All API responses follow this structure:

**Success Response**:
```json
{
  "success": true,
  "data": { ... },
  "message": "Optional success message"
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE"
}
```

---

## Authentication

Most API endpoints require authentication via Clerk. Authentication is handled automatically by Clerk middleware.

### Protected Routes

The following routes require authentication:
- `/` (Home)
- `/meeting/*` (All meeting routes)
- `/recordings` (Recordings page)

### Accessing User Info

```typescript
import { auth } from '@clerk/nextjs';

export async function GET() {
  const { userId } = auth();
  
  if (!userId) {
    return Response.json(
      { error: 'Unauthorized' }, 
      { status: 401 }
    );
  }
  
  // ... rest of your code
}
```

---

## Payment APIs

### 1. Create Cashfree Order

Creates a new payment order for Super Chat.

**Endpoint**: `POST /api/create-cashfree-order`

**Request Headers**:
```
Content-Type: application/json
```

**Request Body**:
```json
{
  "amount": 100,
  "userId": "user_2abc123xyz",
  "callId": "call_meeting_id_123",
  "orderId": "SC-call_123-1234567890-abc",
  "currency": "INR"
}
```

**Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| amount | number | Yes | Payment amount in INR (25-5000) |
| userId | string | Yes | Clerk user ID |
| callId | string | Yes | Meeting/call ID |
| orderId | string | Yes | Unique order ID (format: SC-{callId}-{timestamp}-{random}) |
| currency | string | Yes | Currency code (always "INR") |

**Success Response** (200):
```json
{
  "payment_session_id": "session_abc123xyz",
  "order_id": "SC-call_123-1234567890-abc",
  "order_amount": 100,
  "order_currency": "INR"
}
```

**Error Responses**:

*400 Bad Request*:
```json
{
  "error": "Missing required fields",
  "message": "amount, userId, callId, orderId, and currency are required"
}
```

*500 Internal Server Error*:
```json
{
  "error": "Failed to create order",
  "message": "Error details from Cashfree"
}
```

**Usage Example**:
```typescript
const response = await fetch('/api/create-cashfree-order', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    amount: 100,
    userId: user.id,
    callId: call.id,
    orderId: `SC-${call.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    currency: 'INR'
  })
});

const data = await response.json();
```

---

### 2. Check Payment Status

Checks the current status of a payment order.

**Endpoint**: `GET /api/check-payment-status`

**Query Parameters**:

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| orderId | string | Yes | The order ID to check |

**Request Example**:
```
GET /api/check-payment-status?orderId=SC-call_123-1234567890-abc
```

**Success Response** (200):
```json
{
  "status": "SUCCESS",
  "orderId": "SC-call_123-1234567890-abc",
  "amount": 100,
  "currency": "INR"
}
```

**Payment Status Values**:
- `PENDING` - Payment not yet initiated
- `PROCESSING` - Payment in progress
- `SUCCESS` - Payment completed successfully
- `FAILED` - Payment failed
- `CANCELLED` - Payment cancelled by user

**Error Responses**:

*400 Bad Request*:
```json
{
  "error": "Order ID is required"
}
```

*404 Not Found*:
```json
{
  "error": "Order not found",
  "orderId": "SC-call_123-1234567890-abc"
}
```

**Usage Example**:
```typescript
const response = await fetch(
  `/api/check-payment-status?orderId=${orderId}`
);
const data = await response.json();

if (data.status === 'SUCCESS') {
  // Payment successful
  showSuccessMessage();
}
```

---

### 3. Cashfree Webhook

Receives payment notifications from Cashfree.

**Endpoint**: `POST /api/cashfree-webhook`

**Headers** (from Cashfree):
```
x-webhook-signature: <signature>
x-webhook-timestamp: <timestamp>
Content-Type: application/json
```

**Request Body** (from Cashfree):
```json
{
  "type": "PAYMENT_SUCCESS_WEBHOOK",
  "data": {
    "order": {
      "order_id": "SC-call_123-1234567890-abc",
      "order_amount": 100.00,
      "order_currency": "INR"
    },
    "payment": {
      "cf_payment_id": "12345",
      "payment_status": "SUCCESS",
      "payment_amount": 100.00,
      "payment_time": "2024-01-15T10:30:00Z"
    },
    "customer_details": {
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "9999999999"
    }
  }
}
```

**Success Response** (200):
```json
{
  "success": true,
  "message": "Webhook processed successfully"
}
```

**Process Flow**:
1. Cashfree sends webhook notification
2. Webhook signature verified
3. Order status updated in database
4. Super Chat message inserted into database
5. Real-time notification sent to meeting participants

**Security**:
- Webhook signature verification required
- HTTPS required for production
- IP whitelisting recommended

---

## Error Handling

### Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `UNAUTHORIZED` | 401 | User not authenticated |
| `FORBIDDEN` | 403 | User lacks required permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `INVALID_REQUEST` | 400 | Invalid request parameters |
| `PAYMENT_FAILED` | 402 | Payment processing failed |
| `INTERNAL_ERROR` | 500 | Server error |
| `SERVICE_UNAVAILABLE` | 503 | External service unavailable |

### Error Response Format

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  }
}
```

### Handling Errors (Client-side)

```typescript
try {
  const response = await fetch('/api/create-cashfree-order', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(orderData)
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Request failed');
  }

  const data = await response.json();
  // Handle success
} catch (error) {
  console.error('API Error:', error);
  // Show error to user
}
```

---

## Rate Limiting

### Limits

To prevent abuse, the following rate limits are applied:

| Endpoint | Limit | Window |
|----------|-------|--------|
| `/api/create-cashfree-order` | 10 requests | 1 minute |
| `/api/check-payment-status` | 60 requests | 1 minute |
| `/api/cashfree-webhook` | Unlimited | - |

### Rate Limit Response

When rate limit exceeded:

**Status**: `429 Too Many Requests`

```json
{
  "error": "Rate limit exceeded",
  "retryAfter": 60,
  "message": "Please try again in 60 seconds"
}
```

### Best Practices

1. **Implement exponential backoff** for retries
2. **Cache responses** when possible
3. **Batch requests** if applicable
4. **Use webhooks** instead of polling

---

## Webhooks

### Configuring Webhooks

#### Cashfree Webhook Setup

1. Log in to Cashfree Dashboard
2. Navigate to **Developers** → **Webhooks**
3. Add webhook URL: `https://your-domain.com/api/cashfree-webhook`
4. Select events:
   - Payment Success
   - Payment Failed
   - Payment User Dropped
5. Save configuration

### Webhook Security

#### Signature Verification

Cashfree webhooks include signature verification:

```typescript
import crypto from 'crypto';

function verifyWebhookSignature(
  payload: string,
  timestamp: string,
  signature: string,
  secret: string
): boolean {
  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');
  
  return signature === expectedSignature;
}
```

#### IP Whitelisting

Recommended Cashfree webhook IPs:
- Contact Cashfree support for current IP list
- Configure firewall/security groups accordingly

### Webhook Events

#### Payment Success

```json
{
  "type": "PAYMENT_SUCCESS_WEBHOOK",
  "data": {
    "order": { ... },
    "payment": {
      "payment_status": "SUCCESS",
      ...
    }
  }
}
```

**Actions**:
1. Verify order exists
2. Update payment status to "SUCCESS"
3. Insert Super Chat message
4. Send real-time notification

#### Payment Failed

```json
{
  "type": "PAYMENT_FAILED_WEBHOOK",
  "data": {
    "order": { ... },
    "payment": {
      "payment_status": "FAILED",
      "error_details": { ... }
    }
  }
}
```

**Actions**:
1. Update payment status to "FAILED"
2. Log error details
3. (Optional) Notify user

### Testing Webhooks

#### Local Testing with ngrok

1. Install ngrok: `npm install -g ngrok`
2. Start your dev server: `npm run dev`
3. Expose localhost: `ngrok http 3000`
4. Use ngrok URL in Cashfree dashboard: `https://abc123.ngrok.io/api/cashfree-webhook`

#### Manual Testing

Use curl to simulate webhook:

```bash
curl -X POST https://your-domain.com/api/cashfree-webhook \
  -H "Content-Type: application/json" \
  -H "x-webhook-signature: test_signature" \
  -H "x-webhook-timestamp: 1234567890" \
  -d '{
    "type": "PAYMENT_SUCCESS_WEBHOOK",
    "data": {
      "order": {
        "order_id": "test_order_123"
      }
    }
  }'
```

---

## Database API Patterns

### Supabase Client Usage

All database operations use Supabase client:

```typescript
import { supabase } from '@/lib/supabaseClient';

// Insert
const { data, error } = await supabase
  .from('superchats')
  .insert({
    call_id: callId,
    sender_id: userId,
    message: message,
    amount: amount
  });

// Query
const { data, error } = await supabase
  .from('polls')
  .select('*')
  .eq('call_id', callId)
  .order('created_at', { ascending: false });

// Update
const { error } = await supabase
  .from('polls')
  .update({ is_active: false })
  .eq('id', pollId);

// Delete
const { error } = await supabase
  .from('poll_votes')
  .delete()
  .eq('user_id', userId)
  .eq('poll_id', pollId);
```

### Real-time Subscriptions

```typescript
// Subscribe to changes
const subscription = supabase
  .channel(`messages-${callId}`)
  .on(
    'postgres_changes',
    {
      event: 'INSERT',
      schema: 'public',
      table: 'chat_messages',
      filter: `call_id=eq.${callId}`
    },
    (payload) => {
      console.log('New message:', payload.new);
    }
  )
  .subscribe();

// Cleanup
supabase.removeChannel(subscription);
```

---

## Stream.io Integration

### Token Generation

Server-side token generation for Stream.io:

```typescript
import { StreamClient } from '@stream-io/node-sdk';

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const apiSecret = process.env.STREAM_SECRET_KEY!;

const client = new StreamClient(apiKey, apiSecret);

// Create token for user
const token = client.createToken(userId);
```

### Call Management

```typescript
// Create call
const call = client.video.call('default', callId);
await call.getOrCreate({
  data: {
    created_by_id: userId,
    starts_at: new Date().toISOString(),
    custom: {
      description: 'Meeting description'
    }
  }
});

// End call
await call.end();
```

---

## Best Practices

### API Development

1. **Always validate inputs**
   ```typescript
   if (!amount || !userId || !callId) {
     return Response.json(
       { error: 'Missing required fields' },
       { status: 400 }
     );
   }
   ```

2. **Handle errors gracefully**
   ```typescript
   try {
     // API logic
   } catch (error) {
     console.error('API Error:', error);
     return Response.json(
       { error: 'Internal server error' },
       { status: 500 }
     );
   }
   ```

3. **Use TypeScript types**
   ```typescript
   interface OrderRequest {
     amount: number;
     userId: string;
     callId: string;
     orderId: string;
     currency: string;
   }
   ```

4. **Implement logging**
   ```typescript
   console.log('Order created:', { orderId, amount });
   ```

5. **Return consistent responses**
   ```typescript
   return Response.json({
     success: true,
     data: result
   });
   ```

---

## Testing APIs

### Using curl

```bash
# Create order
curl -X POST http://localhost:3000/api/create-cashfree-order \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 100,
    "userId": "user_123",
    "callId": "call_456",
    "orderId": "SC-call_456-1234567890",
    "currency": "INR"
  }'

# Check payment status
curl http://localhost:3000/api/check-payment-status?orderId=SC-call_456-1234567890
```

### Using Postman

1. Import API collection
2. Set environment variables
3. Test each endpoint
4. Save responses for documentation

### Integration Tests

```typescript
describe('Payment API', () => {
  it('should create order successfully', async () => {
    const response = await fetch('/api/create-cashfree-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: 100,
        userId: 'test_user',
        callId: 'test_call',
        orderId: 'test_order',
        currency: 'INR'
      })
    });

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data.payment_session_id).toBeDefined();
  });
});
```

---

## Support

For API-related questions:
- Email: divineconnectionkcs@gmail.com
- GitHub Issues: [Report bugs](https://github.com/Sharmamayankkkk/KCS-App/issues)

---

**Last Updated**: 2024  
**API Version**: 1.0
