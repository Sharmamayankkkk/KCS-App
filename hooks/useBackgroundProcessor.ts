"use client"

import { useRef, useCallback, useEffect } from "react"
import * as bodySegmentation from "@tensorflow-models/body-segmentation"

interface BackgroundOption {
  id: string
  name: string
  type: 'none' | 'blur' | 'image'
  url?: string
}

export const useBackgroundProcessor = () => {
  const segmenterRef = useRef<bodySegmentation.BodySegmenter | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const backgroundImageRef = useRef<HTMLImageElement | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isProcessingRef = useRef(false)
  const currentStreamRef = useRef<MediaStream | null>(null)
  const currentBackgroundRef = useRef<BackgroundOption | null>(null)

  // Initialize the segmentation model
  const initializeSegmenter = useCallback(async () => {
    if (segmenterRef.current) return segmenterRef.current

    try {
      const model = bodySegmentation.SupportedModels.MediaPipeSelfieSegmentation
      segmenterRef.current = await bodySegmentation.createSegmenter(model, {
        runtime: 'mediapipe',
        solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation',
      })
      return segmenterRef.current
    } catch (error) {
      console.error('Failed to initialize segmenter:', error)
      return null
    }
  }, [])

  // Process video frame with background replacement
  const processFrame = useCallback(async (
    originalStream: MediaStream,
    background: BackgroundOption
  ): Promise<MediaStream | null> => {
    // If background is 'none', return original stream
    if (background.type === 'none') {
      cleanup() // Clean up any existing processing
      return originalStream
    }

    // If the background hasn't changed and we're already processing, return current stream
    if (currentBackgroundRef.current?.id === background.id && currentStreamRef.current) {
      return currentStreamRef.current
    }

    // Clean up previous processing
    cleanup()
    
    // Update current background reference
    currentBackgroundRef.current = background

    try {
      const segmenter = await initializeSegmenter()
      if (!segmenter) return originalStream

      // Create video element if it doesn't exist
      if (!videoRef.current) {
        videoRef.current = document.createElement('video')
        videoRef.current.autoplay = true
        videoRef.current.muted = true
        videoRef.current.playsInline = true
      }

      // Create canvas if it doesn't exist
      if (!canvasRef.current) {
        canvasRef.current = document.createElement('canvas')
      }

      const video = videoRef.current
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')

      if (!ctx) return originalStream

      // Set video source
      video.srcObject = originalStream
      await video.play()

      // Wait for video to be ready
      if (video.readyState < 2) {
        await new Promise((resolve) => {
          video.addEventListener('loadeddata', resolve, { once: true })
        })
      }

      // Set canvas dimensions
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight

      // Load background image if needed
      if (background.type === 'image' && background.url) {
        if (!backgroundImageRef.current || backgroundImageRef.current.src !== background.url) {
          backgroundImageRef.current = new Image()
          backgroundImageRef.current.crossOrigin = 'anonymous'
          
          await new Promise((resolve, reject) => {
            backgroundImageRef.current!.onload = resolve
            backgroundImageRef.current!.onerror = (error) => {
              console.error('Failed to load background image:', error)
              reject(error)
            }
            backgroundImageRef.current!.src = background.url!
          })
        }
      }

      // Start processing frames
      const processVideoFrame = async () => {
        if (!video || !canvas || !ctx || !segmenter || isProcessingRef.current) return
        
        // Check if background has changed, if so, stop processing
        if (currentBackgroundRef.current?.id !== background.id) return

        isProcessingRef.current = true

        try {
          if (video.readyState >= 2) {
            const segmentation = await segmenter.segmentPeople(video)

            if (background.type === 'blur') {
              // Apply blur effect
              await bodySegmentation.drawBokehEffect(
                canvas,
                video,
                segmentation,
                0.7, // foregroundThreshold
                3,   // backgroundBlurAmount
                3,   // edgeBlurAmount
                false // flipHorizontal
              )
            } else if (background.type === 'image' && backgroundImageRef.current) {
              // Apply custom background
              const mask = await bodySegmentation.toBinaryMask(
                segmentation,
                { r: 0, g: 0, b: 0, a: 255 }, // Person pixels (keep opaque)
                { r: 0, g: 0, b: 0, a: 0 }    // Background pixels (make transparent)
              )

              // Draw background image
              ctx.drawImage(backgroundImageRef.current, 0, 0, canvas.width, canvas.height)

              // Create temporary canvas for person
              const tempCanvas = document.createElement('canvas')
              tempCanvas.width = canvas.width
              tempCanvas.height = canvas.height
              const tempCtx = tempCanvas.getContext('2d')

              if (tempCtx) {
                // Draw the person
                tempCtx.drawImage(video, 0, 0, canvas.width, canvas.height)

                // Apply mask
                const imageData = tempCtx.getImageData(0, 0, canvas.width, canvas.height)
                const maskData = mask.data

                for (let i = 0; i < imageData.data.length; i += 4) {
                  const maskIndex = Math.floor(i / 4)
                  if (maskData[maskIndex * 4 + 3] === 0) {
                    // Background pixel - make transparent to show custom background
                    imageData.data[i + 3] = 0
                  }
                }

                tempCtx.putImageData(imageData, 0, 0)

                // Draw the masked person on top of background
                ctx.drawImage(tempCanvas, 0, 0)
              }
            }
          }
        } catch (error) {
          console.error('Error processing frame:', error)
        } finally {
          isProcessingRef.current = false
        }

        // Continue processing if still active and background hasn't changed
        if (background.type !== 'none' && currentBackgroundRef.current?.id === background.id) {
          animationFrameRef.current = requestAnimationFrame(processVideoFrame)
        }
      }

      // Start the processing loop
      processVideoFrame()

      // Create and return the canvas stream
      const canvasStream = canvas.captureStream(30) // 30 FPS
      currentStreamRef.current = canvasStream
      return canvasStream
    } catch (error) {
      console.error('Error setting up background processing:', error)
      return originalStream
    }
  }, [initializeSegmenter])

  // Cleanup function
  const cleanup = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    isProcessingRef.current = false
    currentBackgroundRef.current = null
    if (currentStreamRef.current) {
      currentStreamRef.current.getTracks().forEach(track => track.stop())
      currentStreamRef.current = null
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return cleanup
  }, [cleanup])

  return {
    processFrame,
    cleanup,
  }
}