// src/lib/content.ts
// Server-side helpers for reading content from YAML files.
// Used in getStaticProps — runs at build time only, never in the browser.

import fs from "fs";
import path from "path";
import yaml from "js-yaml";

export type ProductionImage = {
  src: string;
  photographer?: string;
};

export type Production = {
  id: string;
  title_fi: string;
  title_en?: string;
  subtitle_fi?: string;
  subtitle_en?: string;
  status: "active" | "archive";
  category: "general" | "children";
  premiere_date?: string;
  primary_image: string;
  primary_image_photographer?: string;
  production_images?: ProductionImage[];
  short_text_fi: string;
  short_text_en?: string;
  long_text_fi?: string;
  long_text_en?: string;
  info_fi?: string;
  info_en?: string;
  additional_info_fi?: string;
  additional_info_en?: string;
  sort_order?: number;
  ticket_url_fallback?: string;
  trailer_url?: string;
  badge_fi?: string;
  badge_en?: string;
  is_touring?: boolean;
  duration_fi?: string;
  duration_en?: string;
  age_recommendation_fi?: string;
  age_recommendation_en?: string;
  press_zip_url?: string;
};

export type SalesEntry = {
  production_id: string;
  sort_order?: number;
  description?: string;  // overrides production long_text_fi if filled
  technical_requirements?: string;
  price_info?: string;
  trailer_url?: string;
  documentation_url?: string;
  rider_url?: string;
};

export type Performance = {
  production_id: string;
  date: string;   // "YYYY-MM-DD"
  time: string;   // "HH:MM"
  venue_fi: string;
  venue_en?: string;
  city: string;
  ticket_url?: string;
  additional_info_fi?: string;
  additional_info_en?: string;
};

const contentDir = path.join(process.cwd(), "content");

export function getProductions(): Production[] {
  const dir = path.join(contentDir, "productions");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".yaml") && !f.startsWith("_"));
  return files
    .map((file) => {
      const raw = yaml.load(
        fs.readFileSync(path.join(dir, file), "utf8"),
        { schema: yaml.JSON_SCHEMA }
      ) as Omit<Production, "id">;
      return { ...raw, id: path.basename(file, ".yaml") };
    })
    .sort((a, b) => {
      const ao = a.sort_order ?? 999;
      const bo = b.sort_order ?? 999;
      return ao - bo;
    });
}

export function getPerformances(): Performance[] {
  const dir = path.join(contentDir, "performances");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".yaml") && !f.startsWith("_"));
  return files
    .map((file) => yaml.load(
      fs.readFileSync(path.join(dir, file), "utf8"),
      { schema: yaml.JSON_SCHEMA }
    ) as Performance)
    .sort((a, b) => a.date.localeCompare(b.date) || a.time.localeCompare(b.time));
}

export function getSalesEntries(): SalesEntry[] {
  const dir = path.join(contentDir, "sales");
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".yaml") && !f.startsWith("_"));
  return files
    .map((file) => yaml.load(
      fs.readFileSync(path.join(dir, file), "utf8"),
      { schema: yaml.JSON_SCHEMA }
    ) as SalesEntry)
    .sort((a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999));
}

export type HeroSlide = {
  image: string;
  show_on: "both" | "mobile" | "desktop";
  overlay_active: boolean;
  overlay_title?: string;
  overlay_subtitle?: string;
  overlay_button_label?: string;
  overlay_button_url?: string;
};

export type HomeNewsItem = {
  card_title: string;
  title: string;
  subtitle?: string;
  image?: string;
  image_photographer?: string;
  body?: string;   // markdown — split by \n\n for paragraphs
};

export type HomeData = {
  show_calendar: boolean;
  show_events_list: boolean;
  hero_text_fi?: string;
  hero_text_en?: string;
  tagline_fi?: string;
  tagline_en?: string;
  intro_title_fi?: string;
  intro_title_en?: string;
  intro_text_fi?: string;
  intro_text_en?: string;
  hero_slides: HeroSlide[];
  news_items: HomeNewsItem[];
};

export type SectionPageSection = {
  title_fi?: string;
  title_en?: string;
  text_fi?: string;
  text_en?: string;
  image?: string;
  image_photographer?: string;
  image_alt_fi?: string;
  image_alt_en?: string;
  image_orientation?: "landscape" | "portrait" | "square"; // landscape=16/9, portrait=2/3, square=1/1
  image_position?: "left" | "right";                       // only used when image + text both present
};

export type SectionPageData = {
  page_title_fi?: string;
  page_title_en?: string;
  show_page_title?: boolean; // default true; set false to hide the title header
  sections: SectionPageSection[];
};

export function getLiputData(): SectionPageData {
  const raw = yaml.load(
    fs.readFileSync(path.join(contentDir, "liput.yaml"), "utf8")
  ) as SectionPageData;
  return raw;
}

export function getHomeData(): HomeData {
  const raw = yaml.load(
    fs.readFileSync(path.join(contentDir, "home.yaml"), "utf8")
  ) as HomeData;
  return raw;
}

export function getWiljamiData(): SectionPageData {
  const raw = yaml.load(
    fs.readFileSync(path.join(contentDir, "wiljami.yaml"), "utf8")
  ) as SectionPageData;
  return raw;
}

export function getTanssiteatteriData(): SectionPageData {
  const raw = yaml.load(
    fs.readFileSync(path.join(contentDir, "tanssiteatteri.yaml"), "utf8")
  ) as SectionPageData;
  return raw;
}

export type MediaVideoItem = {
  type: "video";
  url: string;
  title_fi?: string;
  title_en?: string;
};

export type MediaImageItem = {
  type: "image";
  src: string;
  photographer?: string;
  alt_fi?: string;
  alt_en?: string;
};

export type MediaLinkItem = {
  type: "link";
  url: string;
  label_fi: string;
  label_en?: string;
  description_fi?: string;
  description_en?: string;
};

export type MediaItem = MediaVideoItem | MediaImageItem | MediaLinkItem;

export type MediaData = {
  items: MediaItem[];
};

export function getMediaData(): MediaData {
  const raw = yaml.load(
    fs.readFileSync(path.join(contentDir, "media.yaml"), "utf8")
  ) as MediaData;
  return raw;
}

export type Person = {
  name: string;
  title_fi?: string;
  title_en?: string;
  image?: string;
  bio_fi?: string;
  bio_en?: string;
};

export type IhmisetSection = {
  title_fi: string;
  title_en?: string;
  people: Person[];
};

export type IhmisetData = {
  sections: IhmisetSection[];
};

export function getIhmisetData(): IhmisetData {
  const raw = yaml.load(
    fs.readFileSync(path.join(contentDir, "ihmiset.yaml"), "utf8")
  ) as IhmisetData;
  return raw ?? { sections: [] };
}
