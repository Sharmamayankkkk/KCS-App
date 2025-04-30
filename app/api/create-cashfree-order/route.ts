import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
      return NextResponse.json(
        { message: "Payment gateway credentials not configured" },
        { status: 500 }
      );
    }

    // Parse and validate request body
    const body = await request.json();
    const validationError = validateRequestBody(body);

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 });
    }

    const { amount, userId, callId, orderId, currency = "INR" } = body;

    // Create order with Cashfree
    const response = await fetch("https://api.cashfree.com/pg/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2022-09-01",
        "x-client-id": apiKey,
        "x-client-secret": secretKey,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amount,
        order_currency: currency,
        customer_details: {
          customer_id: userId,
          customer_email: "226mayankkle@gmail.com", // Replace with actual user email
          customer_phone: "7710807886",       // Replace with actual user phone
        },
        order_meta: {
          return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback?order_id={order_id}`,
          notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cashfree-webhook`,
        },
        order_note: `Superchat payment for call ${callId}`,
      }),
    });

    const responseData = await response.json();

    if (!response.ok) {
      console.error("Cashfree API Error:", responseData);
      return NextResponse.json(
        {
          message: responseData.message || "Payment gateway error",
          details: responseData,
        },
        { status: response.status }
      );
    }

    if (!responseData.order_token) {
      console.error("Missing order_token in Cashfree response:", responseData);
      return NextResponse.json(
        { message: "No order token received from Cashfree" },
        { status: 502 }
      );
    }

    // Store order details in Supabase
    const { error } = await supabase.from("superchats").insert([
      {
        call_id: callId,
        sender_id: userId,
        sender_name: "Anonymous", // Replace with actual sender name if available
        message: "",              // Replace with actual message if available
        amount: amount,
        currency: currency,
        order_reference: orderId,
        order_token: responseData.order_token,
        payment_gateway: "cashfree",
        payment_status: "pending",
      },
    ]);

    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json(
        { message: "Failed to store order details in database" },
        { status: 500 }
      );
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Order creation error:", error);
    return NextResponse.json(
      {
        message:
          "Failed to create payment order: " + (error.message || "Unknown error"),
      },
      { status: 500 }
    );
  }
}
