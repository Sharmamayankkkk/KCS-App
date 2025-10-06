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
        return <Monitor className="w-4 h-4" />
      case 'blur':
        return <Blur className="w-4 h-4" />
      case 'image':
        return <ImageIcon className="w-4 h-4" />
      default:
        return <ImageIcon className="w-4 h-4" />
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#292F36]/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl mx-4 bg-[#FAF5F1] rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E0DBD8] bg-gradient-to-r from-[#FAF5F1] to-[#E0DBD8]">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#A41F13] to-[#8F7A6E] rounded-full flex items-center justify-center">
                <ImageIcon size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#292F36]">Background Settings</h3>
                <p className="text-sm text-[#8F7A6E]">Choose your video background</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-[#8F7A6E] hover:text-[#292F36] hover:bg-[#E0DBD8] rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {/* Upload Section */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#8F7A6E] mb-3">Upload Custom Background</h4>
            <div className="flex items-center space-x-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <Upload size={16} />
                <span>Upload Image</span>
              </Button>
              <p className="text-xs text-[#8F7A6E]">
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
            <h4 className="text-sm font-semibold text-[#8F7A6E]">Available Backgrounds</h4>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {allBackgrounds.map((background) => {
                const isSelected = selectedBackground.id === background.id
                const isCustom = background.id.startsWith('custom-')

                return (
                  <div
                    key={background.id}
                    className={cn(
                      "relative group cursor-pointer rounded-xl overflow-hidden border-2 transition-all duration-200",
                      isSelected
                        ? "border-[#A41F13] ring-2 ring-[#A41F13]/50"
                        : "border-[#E0DBD8] hover:border-[#8F7A6E]"
                    )}
                    onClick={() => onBackgroundChange(background)}
                  >
                    {/* Background Preview */}
                    <div className="aspect-video relative bg-[#E0DBD8]">
                      {background.type === 'none' && (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E0DBD8] to-[#FAF5F1]">
                          <Monitor className="w-8 h-8 text-[#8F7A6E]" />
                        </div>
                      )}
                      
                      {background.type === 'blur' && (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#E0DBD8] to-[#FAF5F1]">
                          <Blur className="w-8 h-8 text-[#8F7A6E]" />
                        </div>
                      )}
                      
                      {background.type === 'image' && background.preview && (
                        <img
                          src={background.preview}
                          alt={background.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent) {
                              parent.innerHTML = `
                                <div class="w-full h-full flex items-center justify-center bg-[#E0DBD8]">
                                  <span class="text-[#8F7A6E] text-xs">Failed to load</span>
                                </div>
                              `
                            }
                          }}
                        />
                      )}

                      {/* Selection Indicator */}
                      {isSelected && (
                        <div className="absolute inset-0 bg-[#A41F13]/20 flex items-center justify-center">
                          <div className="w-8 h-8 bg-[#A41F13] rounded-full flex items-center justify-center">
                            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                          className="absolute top-2 right-2 w-6 h-6 bg-[#A41F13] hover:bg-[#A41F13]/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={12} className="text-white" />
                        </button>
                      )}
                    </div>

                    {/* Background Info */}
                    <div className="p-3 bg-white">
                      <div className="flex items-center space-x-2">
                        {getBackgroundIcon(background.type)}
                        <span className="text-sm font-medium text-[#292F36] truncate">
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
        <div className="px-6 py-4 border-t border-[#E0DBD8] bg-[#FAF5F1]">
          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose} className="bg-[#A41F13] hover:bg-[#A41F13]/90">
              Apply Background
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}