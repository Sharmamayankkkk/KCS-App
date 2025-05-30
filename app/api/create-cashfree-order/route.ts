import { NextResponse } from "next/server"

// Validate the request body
function validateRequestBody(body: any) {
  const { amount, userId, callId, orderId } = body

  if (!amount || typeof amount !== "number" || amount <= 0) {
    return "Invalid amount"
  }

  if (!userId || typeof userId !== "string") {
    return "Invalid user ID"
  }

  if (!callId || typeof callId !== "string") {
    return "Invalid call ID"
  }

  if (!orderId || typeof orderId !== "string") {
    return "Invalid order ID"
  }

  return null
}

export async function POST(request: Request) {
  try {
    // Get API credentials from environment variables
    const apiKey = process.env.CASHFREE_API_KEY
    const secretKey = process.env.CASHFREE_SECRET_KEY

    if (!apiKey || !secretKey) {
      console.error("Missing Cashfree API credentials")
      return NextResponse.json({ message: "Payment gateway credentials not configured" }, { status: 500 })
    }

    // Parse and validate request body
    const body = await request.json()
    const validationError = validateRequestBody(body)

    if (validationError) {
      return NextResponse.json({ message: validationError }, { status: 400 })
    }

    const { amount, userId, callId, orderId, currency = "INR" } = body

    // Production implementation - make a request to Cashfree API
    try {
      const response = await fetch("https://api.cashfree.com/pg/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-version": "2025-01-01",
          "x-client-id": apiKey,
          "x-client-secret": secretKey,
        },
        body: JSON.stringify({
          order_id: orderId,
          order_amount: amount,
          order_currency: currency,
          customer_details: {
            customer_id: userId,
            customer_email: "226mayankkle@gmail.com",
            customer_phone: "7710807886"
          },
          order_meta: {
            return_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback?order_id={order_id}`,
            notify_url: `${process.env.NEXT_PUBLIC_APP_URL}/api/cashfree-webhook`
          },
          order_note: `Superchat payment for call ${callId}`
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Cashfree API error:", errorData)
        return NextResponse.json({ message: errorData.message || "Payment gateway error" }, { status: response.status })
      }

      const responseData = await response.json()
      console.log("Cashfree API response:", responseData)

      // Return the response data directly without modification
      return NextResponse.json(responseData)
    } catch (apiError) {
      console.error("Cashfree API request error:", apiError)
      return NextResponse.json({ message: "Failed to communicate with payment gateway" }, { status: 500 })
    }
  } catch (error: any) {
    console.error("Order creation error:", error)
    return NextResponse.json(
      { message: "Failed to create payment order: " + (error.message || "Unknown error") },
      { status: 500 },
    )
  }
}
