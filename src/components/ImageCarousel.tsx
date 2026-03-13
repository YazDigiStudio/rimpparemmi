// ImageCarousel.tsx
// Horizontal scrollable thumbnail strip with full-screen modal viewer.
// Clicking a thumbnail opens the image in a modal with prev/next navigation.
// No download button — images are served via Next.js optimised Image component.

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import type { ProductionImage } from "@/lib/content";

type Props = { images: ProductionImage[] };

export default function ImageCarousel({ images }: Props) {
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  const closeModal = useCallback(() => setModalIndex(null), []);
  const goPrev = useCallback(() =>
    setModalIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null)),
    [images.length]
  );
  const goNext = useCallback(() =>
    setModalIndex((i) => (i !== null ? (i + 1) % images.length : null)),
    [images.length]
  );

  // Keyboard navigation
  useEffect(() => {
    if (modalIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [modalIndex, closeModal, goPrev, goNext]);

  // Lock body scroll when modal open
  useEffect(() => {
    document.body.style.overflow = modalIndex !== null ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modalIndex]);

  const scrollStrip = (dir: "left" | "right") => {
    stripRef.current?.scrollBy({ left: dir === "left" ? -360 : 360, behavior: "smooth" });
  };

  if (images.length === 0) return null;

  const modalImage = modalIndex !== null ? images[modalIndex] : null;

  const arrowBtnStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    zIndex: 2,
    background: "rgba(0,0,0,0.5)",
    color: "#fff",
    border: "none",
    width: "2.25rem",
    height: "2.25rem",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "1.4rem",
    lineHeight: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  const modalArrowStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    transform: "translateY(-50%)",
    background: "rgba(255,255,255,0.12)",
    border: "none",
    color: "#fff",
    width: "3rem",
    height: "3rem",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "1.6rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <>
      {/* ── Thumbnail strip ── */}
      <div style={{ position: "relative" }}>
        <button
          onClick={() => scrollStrip("left")}
          aria-label="Selaa vasemmalle"
          style={{ ...arrowBtnStyle, left: 0 }}
        >
          ‹
        </button>

        <div
          ref={stripRef}
          style={{
            display: "flex",
            gap: "0.75rem",
            overflowX: "auto",
            scrollbarWidth: "none",
            padding: "0 3rem",
            scrollSnapType: "x mandatory",
          }}
        >
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setModalIndex(i)}
              aria-label={`Avaa kuva ${i + 1}`}
              style={{
                position: "relative",
                width: "300px",
                height: "210px",
                flexShrink: 0,
                border: "none",
                padding: 0,
                borderRadius: "4px",
                overflow: "hidden",
                cursor: "pointer",
                scrollSnapAlign: "start",
              }}
            >
              <Image
                src={img.src}
                alt={img.photographer ? `Kuva: ${img.photographer}` : ""}
                fill
                style={{ objectFit: "cover" }}
                sizes="300px"
              />
            </button>
          ))}
        </div>

        <button
          onClick={() => scrollStrip("right")}
          aria-label="Selaa oikealle"
          style={{ ...arrowBtnStyle, right: 0 }}
        >
          ›
        </button>
      </div>

      {/* ── Modal ── */}
      {modalImage && (
        <div
          onClick={closeModal}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1000,
            backgroundColor: "rgba(0,0,0,0.92)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {/* Close */}
          <button
            onClick={closeModal}
            aria-label="Sulje"
            style={{
              position: "absolute",
              top: "1rem",
              right: "1rem",
              background: "none",
              border: "none",
              color: "#fff",
              fontSize: "2rem",
              cursor: "pointer",
              lineHeight: 1,
            }}
          >
            ×
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            aria-label="Edellinen kuva"
            style={{ ...modalArrowStyle, left: "1rem" }}
          >
            ‹
          </button>

          {/* Image */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              width: "min(90vw, 1200px)",
              height: "min(82vh, 800px)",
            }}
          >
            <Image
              src={modalImage.src}
              alt={modalImage.photographer ? `Kuva: ${modalImage.photographer}` : ""}
              fill
              style={{ objectFit: "contain" }}
              sizes="90vw"
              priority
            />
            {modalImage.photographer && (
              <span
                style={{
                  position: "absolute",
                  bottom: "0.4rem",
                  right: "0.5rem",
                  backgroundColor: "rgba(0,0,0,0.5)",
                  color: "#fff",
                  fontSize: "0.65rem",
                  padding: "0.15rem 0.4rem",
                  borderRadius: "2px",
                  pointerEvents: "none",
                }}
              >
                Kuva: {modalImage.photographer}
              </span>
            )}
          </div>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            aria-label="Seuraava kuva"
            style={{ ...modalArrowStyle, right: "1rem" }}
          >
            ›
          </button>

          {/* Counter */}
          {modalIndex !== null && (
            <p
              style={{
                position: "absolute",
                bottom: "1rem",
                left: "50%",
                transform: "translateX(-50%)",
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.8rem",
                pointerEvents: "none",
              }}
            >
              {modalIndex + 1} / {images.length}
            </p>
          )}
        </div>
      )}
    </>
  );
}
