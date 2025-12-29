"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { getBlurPlaceholder } from "@/lib/image-utils";

interface ImageZoomProps {
  images: string[];
  alt: string;
  selectedIndex: number;
  onIndexChange: (index: number) => void;
  lqips?: string[];
}

export default function ImageZoom({
  images,
  alt,
  selectedIndex,
  onIndexChange,
  lqips,
}: ImageZoomProps) {
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLightboxZoomed, setIsLightboxZoomed] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const [lightboxZoomPosition, setLightboxZoomPosition] = useState({ x: 50, y: 50 });
  const imageRef = useRef<HTMLDivElement>(null);
  const lightboxImageRef = useRef<HTMLDivElement>(null);

  // Fallback placeholder if no images
  const placeholderImage = "https://images.unsplash.com/photo-1602825266970-721285fc6e43?q=80&w=1200&auto=format&fit=crop";
  const displayImages = images.length > 0 ? images : [placeholderImage];
  const currentImage = displayImages[selectedIndex] || displayImages[0];

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  }, []);

  const handleLightboxMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!lightboxImageRef.current || !isLightboxZoomed) return;

    const rect = lightboxImageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setLightboxZoomPosition({ x, y });
  }, [isLightboxZoomed]);

  const handlePrevious = useCallback(() => {
    const newIndex = selectedIndex === 0 ? displayImages.length - 1 : selectedIndex - 1;
    onIndexChange(newIndex);
  }, [selectedIndex, displayImages.length, onIndexChange]);

  const handleNext = useCallback(() => {
    const newIndex = selectedIndex === displayImages.length - 1 ? 0 : selectedIndex + 1;
    onIndexChange(newIndex);
  }, [selectedIndex, displayImages.length, onIndexChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowLeft":
        handlePrevious();
        break;
      case "ArrowRight":
        handleNext();
        break;
      case "Escape":
        setIsLightboxOpen(false);
        break;
    }
  }, [handlePrevious, handleNext]);

  // Reset image loaded state when index changes
  useEffect(() => {
    setIsImageLoaded(false);
  }, [selectedIndex]);

  return (
    <>
      {/* Main Image with Hover Zoom */}
      <div className="w-full lg:w-1/2">
        <div
          ref={imageRef}
          className="relative aspect-square bg-background-alt overflow-hidden mb-4 cursor-zoom-in group"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsZoomed(true)}
          onMouseLeave={() => setIsZoomed(false)}
          onClick={() => setIsLightboxOpen(true)}
          role="button"
          tabIndex={0}
          aria-label="Click to open image gallery"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              setIsLightboxOpen(true);
            }
          }}
        >
          {/* Original Image */}
          <div className="relative w-full h-full">
            <Image
              src={currentImage}
              alt={alt}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover transition-opacity duration-300"
              priority
              placeholder="blur"
              blurDataURL={lqips?.[selectedIndex] || getBlurPlaceholder(currentImage)}
              onLoad={() => setIsImageLoaded(true)}
            />
          </div>

          {/* Zoomed Image (visible on hover, desktop only) */}
          <div
            className={`absolute inset-0 hidden lg:block transition-opacity duration-300 ${isZoomed ? "opacity-100" : "opacity-0"
              }`}
            style={{
              backgroundImage: `url("${currentImage}")`,
              backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
              backgroundSize: "250%",
              backgroundRepeat: "no-repeat",
              pointerEvents: "none",
            }}
          />

          {/* Zoom Hint */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
            <ZoomIn size={20} className="text-foreground-muted" />
          </div>
        </div>

        {/* Thumbnail Grid */}
        {displayImages.length > 1 && (
          <div className="grid grid-cols-4 gap-2" role="group" aria-label="Product image thumbnails">
            {displayImages.map((img, idx) => (
              <button
                key={`${img}-${idx}`}
                onClick={() => onIndexChange(idx)}
                className={`aspect-square bg-background-alt overflow-hidden border-2 transition-colors relative ${selectedIndex === idx ? "border-accent-gold" : "border-transparent hover:border-gray-300"
                  }`}
                aria-label={`View image ${idx + 1}`}
                aria-current={selectedIndex === idx ? "true" : undefined}
              >
                <Image
                  src={img}
                  alt={`${alt} ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 25vw, 10vw"
                  className="object-cover"
                  loading="lazy"
                  placeholder="blur"
                  blurDataURL={lqips?.[idx] || getBlurPlaceholder(img)}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 z-[100] flex items-center justify-center"
            onClick={() => setIsLightboxOpen(false)}
            onKeyDown={handleKeyDown}
            role="dialog"
            aria-modal="true"
            aria-label="Image gallery"
            tabIndex={-1}
          >
            {/* Close Button */}
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-4 right-4 p-3 text-white/80 hover:text-white transition-colors z-10"
              aria-label="Close gallery"
            >
              <X size={24} />
            </button>

            {/* Navigation Buttons */}
            {displayImages.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevious();
                  }}
                  className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white transition-colors z-10"
                  aria-label="Previous image"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/80 hover:text-white transition-colors z-10"
                  aria-label="Next image"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            {/* Main Lightbox Image */}
            <motion.div
              key={selectedIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-5xl h-[70vh] mx-4 overflow-hidden flex items-center justify-center bg-transparent"
              onClick={(e) => e.stopPropagation()}
            >
              <div
                ref={lightboxImageRef}
                className={`relative w-full h-full transition-transform duration-300 ease-out cursor-zoom-in ${isLightboxZoomed ? 'scale-150 cursor-zoom-out' : 'scale-100'}`}
                onMouseMove={handleLightboxMouseMove}
                onClick={() => setIsLightboxZoomed(!isLightboxZoomed)}
                style={isLightboxZoomed ? {
                  transformOrigin: `${lightboxZoomPosition.x}% ${lightboxZoomPosition.y}%`
                } : {}}
              >
                <Image
                  src={currentImage}
                  alt={alt}
                  fill
                  sizes="100vw"
                  className="object-contain"
                  priority
                  placeholder="blur"
                  blurDataURL={lqips?.[selectedIndex] || getBlurPlaceholder(currentImage)}
                />
              </div>

              {!isLightboxZoomed && (
                <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full text-white/70 text-xs uppercase tracking-widest pointer-events-none">
                  Click to Zoom
                </div>
              )}
            </motion.div>

            {/* Image Counter */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-sm">
                {selectedIndex + 1} / {displayImages.length}
              </div>
            )}

            {/* Thumbnail Strip */}
            {displayImages.length > 1 && (
              <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex gap-2">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={(e) => {
                      e.stopPropagation();
                      onIndexChange(idx);
                    }}
                    className={`w-16 h-16 overflow-hidden border-2 transition-colors ${selectedIndex === idx ? "border-white" : "border-transparent opacity-50 hover:opacity-100"
                      }`}
                    aria-label={`View image ${idx + 1}`}
                  >
                    <div className="relative w-full h-full">
                      <Image
                        src={img}
                        alt={`${alt} ${idx + 1}`}
                        fill
                        sizes="64px"
                        className="object-cover"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL={getBlurPlaceholder(img)}
                      />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

