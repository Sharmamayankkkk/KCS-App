"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function PaymentCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "success" | "failure">("loading")
  const [message, setMessage] = useState("")

  useEffect(() => {
    const orderId = searchParams.get("order_id")
    const paymentStatus = searchParams.get("payment_status")

    if (!orderId) {
      setStatus("failure")
      setMessage("Invalid payment response. Missing order information.")
      return
    }

    // In a real implementation, you would verify the payment status with your backend
    if (paymentStatus === "SUCCESS") {
      setStatus("success")
      setMessage("Your payment was successful! Your Superchat has been sent.")
    } else {
      setStatus("failure")
      setMessage("Payment failed or was cancelled. Please try again.")
    }
  }, [searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="max-w-md w-full p-8 bg-gray-800 rounded-lg shadow-lg">
        {status === "loading" && (
          <div className="text-center">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Processing Payment</h2>
            <p className="text-gray-300">Please wait while we verify your payment...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Payment Successful!</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <Button onClick={() => router.push("/")} className="bg-green-600 hover:bg-green-700">
              Return to Call
            </Button>
          </div>
        )}

        {status === "failure" && (
          <div className="text-center">
            <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Payment Failed</h2>
            <p className="text-gray-300 mb-6">{message}</p>
            <Button onClick={() => router.push("/")} variant="outline" className="mr-2">
              Return to Call
            </Button>
            <Button onClick={() => router.push("/")} className="bg-blue-600 hover:bg-blue-700">
              Try Again
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
