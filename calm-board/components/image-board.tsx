"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"

interface ImageData {
  id: string
  url: string
  fullUrl: string
  alt: string
  photographer: string
  photographerUrl: string
}

interface ImageBoardProps {
  mood: string
}

export default function ImageBoard({ mood }: ImageBoardProps) {
  const [images, setImages] = useState<ImageData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<ImageData | null>(null)

  useEffect(() => {
    const fetchImages = async () => {
      if (!mood) return

      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/images?mood=${encodeURIComponent(mood)}`)

        if (!response.ok) {
          throw new Error("Failed to fetch images")
        }

        const data = await response.json()
        setImages(data.images || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load images")
        setImages([])
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [mood])

  const openModal = (image: ImageData) => {
    setSelectedImage(image)
  }

  const closeModal = () => {
    setSelectedImage(null)
  }

  const handleKeyDown = (event: React.KeyboardEvent, image: ImageData) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      openModal(image)
    }
  }

  const handleModalKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") {
      closeModal()
    }
  }

  if (loading) {
    return (
      <section
        className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 animate-in fade-in duration-500"
        aria-labelledby="visual-inspiration-heading"
      >
        <header className="text-center mb-6">
          <h3 id="visual-inspiration-heading" className="text-xl font-medium text-slate-800">
            Visual Inspiration
          </h3>
          <p className="text-slate-600 text-sm font-light mt-2">Finding images that match your mood...</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" role="img" aria-label="Loading images">
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              className="aspect-video bg-gradient-to-br from-slate-200 to-slate-300 rounded-2xl animate-pulse"
              aria-hidden="true"
            />
          ))}
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section
        className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 animate-in fade-in duration-500"
        aria-labelledby="visual-inspiration-heading"
      >
        <div className="text-center" role="alert">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">Images Unavailable</h3>
          <p className="text-slate-600 text-sm">
            We couldn't load visual inspiration right now, but your reflection is still valuable.
          </p>
        </div>
      </section>
    )
  }

  if (images.length === 0) {
    return (
      <section
        className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 animate-in fade-in duration-500"
        aria-labelledby="visual-inspiration-heading"
      >
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">No Images Found</h3>
          <p className="text-slate-600 text-sm">
            We couldn't find images for "{mood}", but your feelings are still valid and important.
          </p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section
        className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 animate-in slide-in-from-bottom-4 duration-700"
        aria-labelledby="visual-inspiration-heading"
      >
        <header className="text-center mb-6">
          <h3 id="visual-inspiration-heading" className="text-xl font-medium text-slate-800">
            Visual Inspiration
          </h3>
          <p className="text-slate-600 text-sm font-light mt-2">Images that reflect your mood</p>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4" role="grid" aria-label="Mood-related images">
          {images.map((image, index) => (
            <button
              key={image.id}
              onClick={() => openModal(image)}
              onKeyDown={(e) => handleKeyDown(e, image)}
              className="group relative aspect-video overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-300/50"
              style={{
                animationDelay: `${index * 100}ms`,
              }}
              aria-label={`View larger image: ${image.alt} by ${image.photographer}`}
              role="gridcell"
            >
              <Image
                src={image.url || "/placeholder.svg"}
                alt={image.alt}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 33vw"
              />

              {/* Overlay with photographer credit */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="absolute bottom-2 left-2 right-2">
                  <p className="text-white text-xs font-light truncate">Photo by {image.photographer}</p>
                </div>
              </div>
            </button>
          ))}
        </div>

        <footer className="text-center mt-6">
          <p className="text-slate-500 text-xs">
            Images provided by{" "}
            <a
              href="https://unsplash.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-300/50 rounded"
            >
              Unsplash
            </a>
          </p>
        </footer>
      </section>

      {/* Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300"
          onClick={closeModal}
          onKeyDown={handleModalKeyDown}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          aria-describedby="modal-description"
          tabIndex={-1}
        >
          <div className="relative max-w-4xl max-h-[90vh] w-full">
            <button
              onClick={closeModal}
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors duration-200 z-10 focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
              aria-label="Close image modal"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
              <Image
                src={selectedImage.fullUrl || selectedImage.url}
                alt={selectedImage.alt}
                fill
                className="object-cover"
                sizes="90vw"
                priority
              />
            </div>

            <div className="mt-4 text-center">
              <h4 id="modal-title" className="sr-only">
                {selectedImage.alt}
              </h4>
              <p id="modal-description" className="text-white text-sm">
                Photo by{" "}
                <a
                  href={selectedImage.photographerUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-white/50 rounded"
                >
                  {selectedImage.photographer}
                </a>{" "}
                on Unsplash
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
