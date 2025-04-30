import { NextResponse } from "next/server";  
import crypto from "crypto";  
  
// Validate the request body  
function validateRequestBody(body: any) {  
  const { amount, userId, callId, orderId } = body;  
  
  if (!amount || typeof amount !== "number" || amount <= 0) {  
    return "Invalid amount";  
  }  
  
  if (!userId || typeof userId !== "string") {  
    return "Invalid user ID";  
  }  
  
  if (!callId || typeof callId !== "string") {  
    return "Invalid call ID";  
  }  
  
  if (!orderId || typeof orderId !== "string") {  
    return "Invalid order ID";  
  }  
  
  return null;  
}  
  
export async function POST(request: Request) {  
  try {  
    // Get API credentials from environment variables  
    const apiKey = process.env.CASHFREE_API_KEY;  
    const secretKey = process.env.CASHFREE_SECRET_KEY;  
  
    if (!apiKey || !secretKey) {  
      console.error("Missing Cashfree API credentials");  
      return NextResponse.json({ message: "Payment gateway credentials not configured" }, { status: 500 });  
    }  
  
    // Parse and validate request body  
    const body = await request.json();  
    const validationError = validateRequestBody(body);  
  
    if (validationError) {  
      return NextResponse.json({ message: validationError }, { status: 400 });  
    }  
  
    const { amount, userId, callId, orderId, currency = "INR" } = body;  
  
    // In production, make a request to Cashfree API  
    // Documentation: https://docs.cashfree.com/reference/createorder  
  
    // Uncomment the following block for production:  
    const response = await fetch('https://api.cashfree.com/pg/orders', {  
      method: 'POST',  
      headers: {  
        'Content-Type': 'application/json',  
        'x-api-version': '2022-09-01',  
        'x-client-id': apiKey,  
        'x-client-secret': secretKey,  
      },  
      body: JSON.stringify({  
        order_id: orderId,  
        order_amount: amount,  
        order_currency: currency,  
        customer_details: {  
          customer_id: userId,  
          customer_email: 'user@example.com', // Replace with actual user email  
          customer_phone: '9999999999' // Replace with actual user phone  
        },  
        order_meta: {  
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback?order_id={order_id}`,  
          notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cashfree-webhook`,  
        },  
        order_note: `Superchat payment for call ${callId}`  
      }),  
    });  
  
    if (!response.ok) {  
      const errorData = await response.json();  
      console.error('Cashfree API error:', errorData);  
      return NextResponse.json(  
        { message: errorData.message || 'Payment gateway error' },  
        { status: response.status }  
      );  
    }  
  
    const responseData = await response.json();  
  
    // Insert order details into Supabase table (if using Supabase)
    const { data, error } = await supabase
      .from('superchats')
      .insert([
        {
          call_id: callId,
          sender_id: userId,
          sender_name: 'Sender Name', // Replace with actual sender name
          message: 'Payment for Superchat',
          amount,
          currency,
          order_reference: responseData.order_id,
          order_token: responseData.order_token,
          payment_gateway: 'cashfree',
          payment_status: 'pending',
        },
      ]);
  
    if (error) {
      console.error("Error saving superchat payment data:", error);
      return NextResponse.json({ message: 'Error saving order to database' }, { status: 500 });
    }
  
    return NextResponse.json(responseData);  
  
    // For development, use mock response (comment out for production):
    // const orderTime = new Date().toISOString();
    // const expiryTime = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    // const dataToSign = orderId + amount + orderTime + currency;
    // const signature = crypto.createHmac("sha256", secretKey).update(dataToSign).digest("hex");
    // const mockResponse = {
    //   cf_order_id: orderId,
    //   order_id: orderId,
    //   entity: "order",
    //   order_amount: amount,
    //   order_currency: currency,
    //   order_expiry_time: expiryTime,
    //   order_status: "ACTIVE",
    //   payment_session_id: `sess_${crypto.randomBytes(8).toString("hex")}`,
    //   order_token: `token_${crypto.randomBytes(16).toString("hex")}`,
    //   order_note: `Superchat payment for call ${callId}`,
    //   created_at: orderTime,
    //   signature: signature,
    // };
    // return NextResponse.json(mockResponse);
  } catch (error: any) {  
    console.error("Order creation error:", error);  
    return NextResponse.json(  
      { message: "Failed to create payment order: " + (error.message || "Unknown error") },  
      { status: 500 },  
    );  
  }  
}
