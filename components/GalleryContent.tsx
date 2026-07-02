"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";
import useEmblaCarousel from "embla-carousel-react";

interface GalleryContentProps {
  images: string[];
}

export default function GalleryContent({ images }: GalleryContentProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(
    null,
  );

  const openModal = (index: number) => {
    setSelectedImageIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedImageIndex(null);
    document.body.style.overflow = "auto";
  };

  return (
    <>
      {/* Artistic Header */}
      <header className="text-center mb-12 max-w-4xl mx-auto">
        <div className="px-4">
          <span className="text-accent-gold text-xs font-bold uppercase tracking-[0.5em] mb-4 block">
            The Visual Narrative
          </span>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-gray-900 mb-8 tracking-tight leading-[1.1]">
            Sacred Spaces <br />
            <span className="text-gray-400 font-light italic">&</span> Mindful
            Moments
          </h1>
          <div className="w-16 h-[2px] bg-accent-gold/30 mx-auto mb-10"></div>
          <p className="text-lg md:text-xl text-gray-600 font-serif leading-relaxed italic">
            "A curation of moments reflecting the purity of Agnihotra, the
            beauty of Vedic traditions, and the serenity of mindful living."
          </p>
        </div>
      </header>

      {/* Gallery Masonry Grid */}
      <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
        {images.map((src, index) => (
          <motion.div
            key={src}
            initial="initial"
            whileHover="hover"
            className="relative break-inside-avoid group cursor-pointer overflow-hidden rounded-2xl bg-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 mb-6"
            onClick={() => openModal(index)}
          >
            <Image
              src={src}
              alt={`Gallery image ${index + 1}`}
              width={800}
              height={1000}
              className="w-full h-auto object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />

            {/* Elegant Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex flex-col justify-end p-6 md:p-8">
              <motion.div
                variants={{
                  initial: { y: 20, opacity: 0 },
                  hover: { y: 0, opacity: 1 },
                }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="space-y-2 pointer-events-none"
              >
                <span className="text-accent-gold text-[10px] uppercase tracking-[0.3em] font-bold">
                  Vishwa Collection
                </span>
                <div className="flex items-center justify-between">
                  <h3 className="text-white font-serif text-lg">
                    View Essence
                  </h3>
                  <div className="bg-white/20 backdrop-blur-md p-2 rounded-full border border-white/30">
                    <Maximize2 className="text-white" size={18} />
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Subtle Border Glow on Hover */}
            <div className="absolute inset-0 border-0 group-hover:border-[1px] border-white/20 transition-all duration-500 rounded-2xl pointer-events-none"></div>
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <GalleryModal
            images={images}
            initialIndex={selectedImageIndex}
            onClose={closeModal}
          />
        )}
      </AnimatePresence>
    </>
  );
}

interface GalleryModalProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

function GalleryModal({ images, initialIndex, onClose }: GalleryModalProps) {
  const [selectedIndex, setSelectedIndex] = useState(initialIndex);
  const [emblaRef, emblaApi] = useEmblaCarousel({
    startIndex: initialIndex,
    loop: true,
    duration: 30,
  });

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  const scrollPrev = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      emblaApi?.scrollPrev();
    },
    [emblaApi],
  );

  const scrollNext = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      emblaApi?.scrollNext();
    },
    [emblaApi],
  );

  // Handle keyboard events
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") emblaApi?.scrollPrev();
      if (e.key === "ArrowRight") emblaApi?.scrollNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, emblaApi]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 md:p-10"
      onClick={onClose}
    >
      {/* Close Button */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-[110]">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
            <span className="text-white/90 text-xs font-bold tracking-[0.2em] uppercase font-sans">
              {selectedIndex + 1} / {images.length}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigator.clipboard.writeText(
                window.location.origin + images[selectedIndex],
              );
              alert("Image link copied!");
            }}
            className="p-3 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-all"
            title="Copy Image Link"
          >
            <Maximize2 size={20} strokeWidth={1.5} />
          </button>
          <button
            className="p-3 rounded-full bg-accent-gold/20 hover:bg-accent-gold/40 border border-accent-gold/30 text-accent-gold transition-all"
            onClick={onClose}
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* Carousel Container */}
      <div
        className="relative w-full h-full flex items-center justify-center pt-20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Previous Button */}
        <button
          className="absolute left-10 z-[110] text-white/30 hover:text-white transition-all p-6 hidden lg:block group"
          onClick={scrollPrev}
        >
          <ChevronLeft
            size={64}
            strokeWidth={0.5}
            className="group-hover:-translate-x-2 transition-transform"
          />
        </button>

        {/* Main Content */}
        <div className="overflow-hidden w-full h-full" ref={emblaRef}>
          <div className="flex h-full">
            {images.map((src, index) => (
              <div
                key={`modal-${src}`}
                className="flex-[0_0_100%] min-w-0 h-full flex items-center justify-center px-4 md:px-20"
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative w-full h-full"
                >
                  <Image
                    src={src}
                    alt={`Gallery image large ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="100vw"
                    priority={index === initialIndex}
                  />
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Next Button */}
        <button
          className="absolute right-10 z-[110] text-white/30 hover:text-white transition-all p-6 hidden lg:block group"
          onClick={scrollNext}
        >
          <ChevronRight
            size={64}
            strokeWidth={0.5}
            className="group-hover:translate-x-2 transition-transform"
          />
        </button>
      </div>

      {/* Mobile Swipe Instructions */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 sm:hidden text-white/30 text-[10px] tracking-[0.4em] uppercase font-sans animate-pulse">
        Swipe to navigate
      </div>
    </motion.div>
  );
}
