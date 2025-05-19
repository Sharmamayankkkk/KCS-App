"use client"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { AlertCircle, Calendar, X } from "lucide-react"

type AlertProps = {
  title: string
  subtitle?: string
  iconUrl?: string
  onClose?: () => void
  variant?: "warning" | "error" | "info" | "success"
}

const Alert = ({ title, subtitle, iconUrl, onClose, variant = "warning" }: AlertProps) => {
  const variantStyles = {
    warning: "bg-amber-500/10 border-amber-500/30 text-amber-200",
    error: "bg-red-500/10 border-red-500/30 text-red-200",
    info: "bg-blue-500/10 border-blue-500/30 text-blue-200",
    success: "bg-green-500/10 border-green-500/30 text-green-200",
  }

  const getIcon = () => {
    if (iconUrl) {
      return <Image src={iconUrl || "/placeholder.svg"} alt="Alert Icon" width={28} height={28} />
    }

    switch (variant) {
      case "error":
        return <X className="h-6 w-6 text-red-400" />
      case "info":
        return <Calendar className="h-6 w-6 text-blue-400" />
      case "success":
        return <Calendar className="h-6 w-6 text-green-400" />
      case "warning":
      default:
        return <AlertCircle className="h-6 w-6 text-amber-400" />
    }
  }

  return (
    <Card
      className={cn(
        "max-w-lg w-full mx-auto p-6 flex flex-col items-center text-center space-y-4 shadow-xl backdrop-blur-lg border animate-fade-in",
        variantStyles[variant],
      )}
    >
      <div className="rounded-full p-3 bg-black/20 backdrop-blur">{getIcon()}</div>
      <div className="space-y-2">
        <h2 className="text-xl font-bold">{title}</h2>
        {subtitle && <p className="text-sm opacity-80">{subtitle}</p>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="mt-4 px-5 py-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium"
        >
          Got it
        </button>
      )}
    </Card>
  )
}

export default Alert
