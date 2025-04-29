"use client"

import type React from "react"

import { useState } from "react"

type ToastType = "default" | "destructive"

type Toast = {
  id: string
  title?: string
  description: string
  type?: ToastType
  action?: React.ReactNode
}

export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const toast = ({
    title,
    description,
    type = "default",
    action,
  }: {
    title?: string
    description: string
    type?: ToastType
    action?: React.ReactNode
  }) => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((toasts) => [...toasts, { id, title, description, type, action }])
    return id
  }

  const dismiss = (id: string) => {
    setToasts((toasts) => toasts.filter((toast) => toast.id !== id))
  }

  return {
    toast,
    dismiss,
    toasts,
  }
}
