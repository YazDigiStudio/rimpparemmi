// Media page — /media
// Two sections: Pressikuvat (press photos per production) and Videot (YouTube videos from CMS).

import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/router";
import { type GetStaticProps } from "next";
import Navigation from "@/components/Navigation";
import Seo from "@/components/Seo";
import { colors } from "@/styles/colors";
import { toNoCookiesEmbed } from "@/lib/mediaUtils";
import {
  getProductions,
  getMediaData,
  type Production,
  type MediaData,
  type MediaItem,
} from "@/lib/content";

type Locale = "fi" | "en";

const copy = {
  fi: {
    meta: "Media – Tanssiteatteri Rimpparemmi",
    pageTitle: "Media",
    pressImages: "Pressikuvat",
    videos: "Videot",
    photo: "Kuva",
    downloadImage: "Lataa kuva",
    downloadZip: "Lataa kuvat (ZIP)",
    close: "Sulje",
    noVideos: "Ei videoita.",
  },
  en: {
    meta: "Media – Dance Theatre Rimpparemmi",
    pageTitle: "Media",
    pressImages: "Press images",
    videos: "Videos",
    photo: "Photo",
    downloadImage: "Download image",
    downloadZip: "Download photos (ZIP)",
    close: "Close",
    noVideos: "No videos.",
  },
} as const;

type Section = "press" | "videos";

type Props = {
  productions: Production[];
  mediaData: MediaData;
};

type ModalImage = {
  src: string;
  photographer?: string;
  alt?: string;
};

function toOriginalUrl(url: string): string {
  return url
    .replace(/%2Fweb%2F/i, "%2Foriginals%2F")
    .replace(/\.webp(\?|$)/, ".jpg$1");
}

const sectionBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: "0.6rem 1.5rem",
  borderRadius: "2px",
  fontSize: "0.85rem",
  fontWeight: 700,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
  cursor: "pointer",
  border: `2px solid ${colors.nearBlack}`,
  backgroundColor: active ? colors.nearBlack : "transparent",
  color: active ? colors.white : colors.nearBlack,
  transition: "background-color 0.15s, color 0.15s",
  whiteSpace: "nowrap" as const,
});

const tabBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: "0.5rem 1.25rem",
  borderRadius: "2px",
  fontSize: "0.8rem",
  fontWeight: 600,
  letterSpacing: "0.05em",
  cursor: "pointer",
  border: `2px solid ${colors.brandFuchsia}`,
  backgroundColor: active ? colors.brandFuchsia : "transparent",
  color: active ? colors.white : colors.brandFuchsia,
  transition: "background-color 0.15s, color 0.15s",
  whiteSpace: "nowrap" as const,
});

function ImageModal({ image, locale, onClose }: {
  image: ModalImage;
  locale: Locale;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const t = copy[locale];

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 1000,
        backgroundColor: "rgba(0,0,0,0.88)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "relative",
          maxWidth: "90vw",
          display: "flex",
          flexDirection: "column",
          gap: "0.75rem",
        }}
      >
        <button
          onClick={onClose}
          aria-label={t.close}
          style={{
            position: "absolute", top: "-2.5rem", right: 0,
            background: "none", border: "none",
            color: "#fff", fontSize: "1.5rem", cursor: "pointer",
            lineHeight: 1, padding: "0.25rem",
          }}
        >
          ✕
        </button>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.src}
          alt={image.alt ?? ""}
          style={{
            maxWidth: "90vw",
            maxHeight: "75vh",
            objectFit: "contain",
            borderRadius: "4px",
            display: "block",
          }}
        />

        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: "1rem",
        }}>
          {image.photographer ? (
            <span style={{ color: colors.muted, fontSize: "0.75rem" }}>
              {t.photo}: {image.photographer}
            </span>
          ) : <span />}
          <button
            onClick={() => {
              const a = document.createElement("a");
              a.href = "/api/download?url=" + encodeURIComponent(toOriginalUrl(image.src));
              a.download = "";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
            }}
            style={{
              display: "inline-block",
              padding: "0.4rem 1rem",
              backgroundColor: colors.brandFuchsia,
              color: colors.white,
              borderRadius: "2px",
              fontSize: "0.8rem",
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              letterSpacing: "0.04em",
              whiteSpace: "nowrap",
            }}
          >
            {t.downloadImage} ↓
          </button>
        </div>
      </div>
    </div>
  );
}

function PhotoGrid({ production, locale, onImageClick }: {
  production: Production;
  locale: Locale;
  onImageClick: (img: ModalImage) => void;
}) {
  const images = production.production_images ?? [];
  const t = copy[locale];

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
          gap: "1rem",
        }}
      >
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => onImageClick({
              src: img.src,
              photographer: img.photographer,
            })}
            style={{
              display: "block", background: "none", border: "none",
              padding: 0, cursor: "pointer", textAlign: "left",
            }}
          >
            <div
              style={{
                position: "relative",
                aspectRatio: "3/2",
                overflow: "hidden",
                borderRadius: "4px",
              }}
            >
              <Image
                src={img.src}
                alt=""
                fill
                style={{ objectFit: "cover" }}
                sizes="(max-width: 768px) 100vw, 33vw"
              />
              {img.photographer && (
                <span
                  style={{
                    position: "absolute", bottom: "0.4rem", right: "0.5rem",
                    backgroundColor: "rgba(0,0,0,0.45)", color: "#fff",
                    fontSize: "0.65rem", padding: "0.15rem 0.4rem", borderRadius: "2px",
                    pointerEvents: "none",
                  }}
                >
                  {t.photo}: {img.photographer}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {production.press_zip_url && (
        <div style={{ marginTop: "1.5rem" }}>
          <a
            href={production.press_zip_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block",
              padding: "0.5rem 1.25rem",
              border: `2px solid ${colors.brandFuchsia}`,
              color: colors.brandFuchsia,
              borderRadius: "2px",
              fontSize: "0.8rem",
              fontWeight: 600,
              textDecoration: "none",
              letterSpacing: "0.05em",
            }}
          >
            {t.downloadZip} ↓
          </a>
        </div>
      )}
    </div>
  );
}

function VideoList({ items, locale }: { items: MediaItem[]; locale: Locale }) {
  const t = copy[locale];

  if (items.length === 0) {
    return <p style={{ color: colors.muted, fontSize: "0.9rem" }}>{t.noVideos}</p>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {items.map((item, i) => {
        const title = locale === "fi" ? item.title_fi : (item.title_en ?? item.title_fi);
        const subtitle = locale === "fi" ? item.subtitle_fi : (item.subtitle_en ?? item.subtitle_fi);
        return (
          <div key={i}>
            {(title || subtitle) && (
              <div style={{ marginBottom: "0.75rem" }}>
                {title && (
                  <h2 style={{
                    color: colors.nearBlack,
                    fontSize: "clamp(1rem, 2vw, 1.3rem)",
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    textTransform: "uppercase",
                    lineHeight: 1.2,
                  }}>
                    {title}
                  </h2>
                )}
                {subtitle && (
                  <p style={{ color: colors.muted, fontSize: "0.85rem", marginTop: "0.25rem" }}>
                    {subtitle}
                  </p>
                )}
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "center" }}>
              <div
                style={{
                  position: "relative",
                  aspectRatio: "16/9",
                  width: "100%",
                  maxWidth: "800px",
                  borderRadius: "4px",
                  overflow: "hidden",
                  backgroundColor: "#000",
                }}
              >
                <iframe
                  src={toNoCookiesEmbed(item.url)}
                  style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: "none" }}
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function MediaPage({ productions, mediaData }: Props) {
  const { locale: routerLocale } = useRouter();
  const locale: Locale = routerLocale === "en" ? "en" : "fi";
  const t = copy[locale];

  const showActive = mediaData.show_active ?? true;
  const showArchived = mediaData.show_archived ?? false;
  const mediaProductions = productions
    .filter((p) => {
      if ((p.production_images ?? []).length === 0) return false;
      if (p.status === "active") return showActive;
      if (p.status === "archive") return showArchived;
      return false;
    })
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));

  const [activeSection, setActiveSection] = useState<Section>("press");
  const [activePressIndex, setActivePressIndex] = useState(0);
  const [modalImage, setModalImage] = useState<ModalImage | null>(null);

  return (
    <>
      <Seo
        title={t.meta}
        description={locale === "fi"
          ? "Tanssiteatteri Rimpparemmin mediasisältö: videot ja lehdistömateriaali."
          : "Dance Theatre Rimpparemmi media: videos and press material."}
        path="/media"
        locale={locale}
        breadcrumbs={[
          { name: "Etusivu", path: "/" },
          { name: "Media", path: "/media" },
        ]}
      />
      <Navigation />
      <main
        style={{
          backgroundColor: colors.offWhite,
          minHeight: "100vh",
          padding: "calc(96px + 3rem) 2rem 6rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>

          <h1
            style={{
              color: colors.nearBlack,
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "2rem",
            }}
          >
            {t.pageTitle}
          </h1>

          {/* Section buttons */}
          <div style={{ display: "flex", gap: "0.75rem", marginBottom: "2.5rem" }}>
            <button
              style={sectionBtnStyle(activeSection === "press")}
              onClick={() => setActiveSection("press")}
            >
              {t.pressImages}
            </button>
            <button
              style={sectionBtnStyle(activeSection === "videos")}
              onClick={() => setActiveSection("videos")}
            >
              {t.videos}
            </button>
          </div>

          {/* Pressikuvat */}
          {activeSection === "press" && (
            <>
              {mediaProductions.length === 0 ? null : (
                <>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "2rem" }}>
                    {mediaProductions.map((prod, i) => (
                      <button
                        key={i}
                        style={tabBtnStyle(i === activePressIndex)}
                        onClick={() => setActivePressIndex(i)}
                      >
                        {locale === "fi" ? prod.title_fi : (prod.title_en ?? prod.title_fi)}
                      </button>
                    ))}
                  </div>
                  {mediaProductions[activePressIndex] && (
                    <PhotoGrid
                      production={mediaProductions[activePressIndex]}
                      locale={locale}
                      onImageClick={setModalImage}
                    />
                  )}
                </>
              )}
            </>
          )}

          {/* Videot */}
          {activeSection === "videos" && (
            <VideoList items={mediaData.items} locale={locale} />
          )}

        </div>
      </main>

      {modalImage && (
        <ImageModal
          image={modalImage}
          locale={locale}
          onClose={() => setModalImage(null)}
        />
      )}
    </>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const productions = getProductions();
  const mediaData = getMediaData();
  return { props: { productions, mediaData } };
};
