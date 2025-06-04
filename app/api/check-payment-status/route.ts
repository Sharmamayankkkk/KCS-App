import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get("orderId")

    if (!orderId) {
      return NextResponse.json({ message: "Order ID is required" }, { status: 400 })
    }

    // Get API credentials from environment variables
    const apiKey = process.env.CASHFREE_API_KEY
    const secretKey = process.env.CASHFREE_SECRET_KEY

    if (!apiKey || !secretKey) {
      console.error("Missing Cashfree API credentials")
      return NextResponse.json({ message: "Payment gateway credentials not configured" }, { status: 500 })
    }

    // Check payment status with Cashfree API
    const response = await fetch(`https://api.cashfree.com/pg/orders/${orderId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2025-01-01",
        "x-client-id": apiKey,
        "x-client-secret": secretKey,
      },
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("Cashfree API error:", errorData)
      return NextResponse.json(
        { message: errorData.message || "Failed to check payment status" },
        { status: response.status },
      )
    }

    const orderData = await response.json()
    console.log("Payment status check result:", orderData)

    // Return the order status
    return NextResponse.json({
      status: orderData.order_status,
      orderId: orderData.order_id,
      amount: orderData.order_amount,
      currency: orderData.order_currency,
    })
  } catch (error: any) {
    console.error("Payment status check error:", error)
    return NextResponse.json(
      { message: "Failed to check payment status: " + (error.message || "Unknown error") },
      { status: 500 },
    )
  }
}
