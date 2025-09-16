"use client"

import { useState, useRef, useEffect } from "react"
import { Image as ImageIcon, Upload, X, Bluetooth as Blur, Monitor } from "lucide-react"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"

interface BackgroundOption {
  id: string
  name: string
  type: 'none' | 'blur' | 'image'
  url?: string
  preview?: string
}

const PREDEFINED_BACKGROUNDS: BackgroundOption[] = [
  {
    id: 'none',
    name: 'No Background',
    type: 'none',
  },
  {
    id: 'blur',
    name: 'Blur Background',
    type: 'blur',
  },
  {
    id: 'office',
    name: 'Modern Office',
    type: 'image',
    url: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    preview: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
  },
  {
    id: 'library',
    name: 'Library',
    type: 'image',
    url: 'https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    preview: 'https://images.pexels.com/photos/2041540/pexels-photo-2041540.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
  },
  {
    id: 'nature',
    name: 'Nature View',
    type: 'image',
    url: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    preview: 'https://images.pexels.com/photos/1366919/pexels-photo-1366919.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
  },
  {
    id: 'temple',
    name: 'Temple',
    type: 'image',
    url: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
    preview: 'https://images.pexels.com/photos/2166553/pexels-photo-2166553.jpeg?auto=compress&cs=tinysrgb&w=300&h=200&fit=crop',
  },
]

interface BackgroundSelectorProps {
  selectedBackground: BackgroundOption
  onBackgroundChange: (background: BackgroundOption) => void
  onClose: () => void
}

export const BackgroundSelector = ({
  selectedBackground,
  onBackgroundChange,
  onClose,
}: BackgroundSelectorProps) => {
  const [customBackgrounds, setCustomBackgrounds] = useState<BackgroundOption[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    const reader = new FileReader()
    reader.onload = (e) => {
      const imageUrl = e.target?.result as string
      const newBackground: BackgroundOption = {
        id: `custom-${Date.now()}`,
        name: file.name.split('.')[0],
        type: 'image',
        url: imageUrl,
        preview: imageUrl,
      }

      setCustomBackgrounds(prev => [...prev, newBackground])
      // Automatically select the newly uploaded background
      onBackgroundChange(newBackground)
    }
    reader.readAsDataURL(file)
  }

  const removeCustomBackground = (id: string) => {
    setCustomBackgrounds(prev => prev.filter(bg => bg.id !== id))
    if (selectedBackground.id === id) {
      onBackgroundChange(PREDEFINED_BACKGROUNDS[0])
    }
  }

  const allBackgrounds = [...PREDEFINED_BACKGROUNDS, ...customBackgrounds]

  const getBackgroundIcon = (type: string) => {
    switch (type) {
      case 'none':
        return <Monitor className="size-4" />
      case 'blur':
        return <Blur className="size-4" />
      case 'image':
        return <ImageIcon className="size-4" />
      default:
        return <ImageIcon className="size-4" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500">
                <ImageIcon size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Background Settings</h3>
                <p className="text-sm text-gray-500">Choose your video background</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto p-6">
          {/* Upload Section */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold text-gray-700">Upload Custom Background</h4>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>Upload Image</span>
              </Button>
              <p className="text-xs text-gray-500">
                Supports JPG, PNG, GIF (max 10MB)
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Background Options Grid */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-700">Available Backgrounds</h4>
            
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
              {allBackgrounds.map((background) => {
                const isSelected = selectedBackground.id === background.id
                const isCustom = background.id.startsWith('custom-')

                return (
                  <div
                    key={background.id}
                    className={cn(
                      "relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200",
                      isSelected
                        ? "border-blue-500 ring-2 ring-blue-200"
                        : "border-gray-200 hover:border-gray-300"
                    )}
                    onClick={() => onBackgroundChange(background)}
                  >
                    {/* Background Preview */}
                    <div className="relative aspect-video bg-gray-100">
                      {background.type === 'none' && (
                        <div className="flex size-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                          <Monitor className="size-8 text-gray-400" />
                        </div>
                      )}
                      
                      {background.type === 'blur' && (
                        <div className="flex size-full items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
                          <Blur className="size-8 text-blue-500" />
                        </div>
                      )}
                      
                      {background.type === 'image' && background.preview && (
                        <img
                          src={background.preview}
                          alt={background.name}
                          className="size-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-gray-200">
                                  <span class="text-gray-500 text-xs">Failed to load</span>
                                </div>
                              `
                            }
                          }}
                        />
                      )}

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 flex items-center justify-center bg-blue-500/20">
                          <div className="flex size-8 items-center justify-center rounded-full bg-blue-500">
                            <svg className="size-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      )}

                      {/* Custom Background Remove Button */}
                      {isCustom && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeCustomBackground(background.id)
                          }}
                          className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-red-500 opacity-0 transition-opacity hover:bg-red-600 group-hover:opacity-100"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      )}
                    </div>

                    {/* Background Info */}
                    <div className="bg-white p-3">
                      <div className="flex items-center space-x-2">
                        {getBackgroundIcon(background.type)}
                        <span className="truncate text-sm font-medium text-gray-900">
                          {background.name}
                        </span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose} className="bg-blue-500 hover:bg-blue-600">
              Apply Background
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}