// Media page — /media
// Tab buttons: one per active production with production_images, plus optional
// "Yleinen media" tab if media.yaml has items.
// Production tabs show a photo gallery. General media tab shows videos, images, links.

import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import { useRouter } from "next/router";
import { type GetStaticProps } from "next";
import Navigation from "@/components/Navigation";
import { colors } from "@/styles/colors";
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
    generalTab: "Yleinen media",
    photo: "Kuva",
    downloadImage: "Lataa kuva",
    downloadZip: "Lataa kuvat (ZIP)",
    close: "Sulje",
  },
  en: {
    meta: "Media – Dance Theatre Rimpparemmi",
    pageTitle: "Media",
    generalTab: "General media",
    photo: "Photo",
    downloadImage: "Download image",
    downloadZip: "Download photos (ZIP)",
    close: "Close",
  },
} as const;

type Tab = { kind: "production"; production: Production } | { kind: "general" };

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

function toNoCookiesEmbed(url: string): string {
  try {
    const u = new URL(url);
    let videoId: string | null = null;
    if (u.hostname === "youtu.be") {
      videoId = u.pathname.slice(1);
    } else if (
      u.hostname === "www.youtube.com" ||
      u.hostname === "youtube.com" ||
      u.hostname === "www.youtube-nocookie.com"
    ) {
      videoId = u.searchParams.get("v") ?? u.pathname.replace("/embed/", "");
    }
    if (videoId) return `https://www.youtube-nocookie.com/embed/${videoId}`;
  } catch {}
  return url;
}

function GeneralMedia({ items, locale, onImageClick }: {
  items: MediaItem[];
  locale: Locale;
  onImageClick: (img: ModalImage) => void;
}) {
  const t = copy[locale];

  // Group consecutive images together for a grid layout
  type Chunk = { kind: "image"; items: Extract<MediaItem, { type: "image" }>[] }
    | { kind: "single"; item: Exclude<MediaItem, { type: "image" }> };

  const chunks: Chunk[] = [];
  for (const item of items) {
    if (item.type === "image") {
      const last = chunks[chunks.length - 1];
      if (last?.kind === "image") {
        last.items.push(item);
      } else {
        chunks.push({ kind: "image", items: [item] });
      }
    } else {
      chunks.push({ kind: "single", item });
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>
      {chunks.map((chunk, ci) => {
        if (chunk.kind === "image") {
          return (
            <div
              key={ci}
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: "1rem",
              }}
            >
              {chunk.items.map((img, ii) => {
                const alt = locale === "fi" ? (img.alt_fi ?? "") : (img.alt_en ?? img.alt_fi ?? "");
                return (
                  <button
                    key={ii}
                    onClick={() => onImageClick({
                      src: img.src,
                      photographer: img.photographer,
                      alt,
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
                        alt={alt}
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
                );
              })}
            </div>
          );
        }

        const { item } = chunk;

        if (item.type === "video") {
          const title = locale === "fi" ? item.title_fi : (item.title_en ?? item.title_fi);
          return (
            <div key={ci}>
              {title && (
                <p
                  style={{
                    color: colors.nearBlack,
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    marginBottom: "0.75rem",
                    opacity: 0.85,
                  }}
                >
                  {title}
                </p>
              )}
              <div
                style={{
                  position: "relative",
                  aspectRatio: "16/9",
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
          );
        }

        if (item.type === "link") {
          const label = locale === "fi" ? item.label_fi : (item.label_en ?? item.label_fi);
          const desc = locale === "fi" ? item.description_fi : (item.description_en ?? item.description_fi);
          return (
            <a
              key={ci}
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex",
                flexDirection: "column",
                gap: "0.25rem",
                borderLeft: `3px solid ${colors.brandFuchsia}`,
                paddingLeft: "1rem",
                textDecoration: "none",
                maxWidth: "600px",
              }}
            >
              <span
                style={{
                  color: colors.brandFuchsia,
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  letterSpacing: "0.03em",
                }}
              >
                {label} →
              </span>
              {desc && (
                <span style={{ color: colors.muted, fontSize: "0.8rem" }}>{desc}</span>
              )}
            </a>
          );
        }

        return null;
      })}
    </div>
  );
}

export default function MediaPage({ productions, mediaData }: Props) {
  const { locale: routerLocale } = useRouter();
  const locale: Locale = routerLocale === "en" ? "en" : "fi";
  const t = copy[locale];

  // Only active productions with at least one production image
  const mediaProductions = productions.filter(
    (p) => p.status === "active" && (p.production_images ?? []).length > 0
  );

  const hasGeneralMedia = mediaData.items.length > 0;

  const tabs: Tab[] = [
    ...mediaProductions.map((p): Tab => ({ kind: "production", production: p })),
    ...(hasGeneralMedia ? [{ kind: "general" } as Tab] : []),
  ];

  const [activeIndex, setActiveIndex] = useState(0);
  const activeTab = tabs[activeIndex];
  const [modalImage, setModalImage] = useState<ModalImage | null>(null);

  return (
    <>
      <Head>
        <title>{t.meta}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
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

          {tabs.length === 0 ? null : (
            <>
              {/* Tab buttons */}
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "0.5rem",
                  marginBottom: "2.5rem",
                }}
              >
                {tabs.map((tab, i) => {
                  const label = tab.kind === "general"
                    ? t.generalTab
                    : (locale === "fi"
                        ? tab.production.title_fi
                        : (tab.production.title_en ?? tab.production.title_fi));
                  return (
                    <button
                      key={i}
                      style={tabBtnStyle(i === activeIndex)}
                      onClick={() => setActiveIndex(i)}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Tab content */}
              {activeTab?.kind === "production" && (
                <PhotoGrid
                  production={activeTab.production}
                  locale={locale}
                  onImageClick={setModalImage}
                />
              )}
              {activeTab?.kind === "general" && (
                <GeneralMedia
                  items={mediaData.items}
                  locale={locale}
                  onImageClick={setModalImage}
                />
              )}
            </>
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
