// Home page — Tanssiteatteri Rimpparemmi
// Hero image + two-column section: intro text (left) and ticket calendar (right).
// showCalendar is controlled via Decap CMS toggle (home.yaml) — hardcoded true for now.

import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import Navigation from "@/components/Navigation";
import CalendarWidget, { type CalendarEvent } from "@/components/CalendarWidget";
import ShowModal, { type ShowInfo } from "@/components/ShowModal";
import { colors } from "@/styles/colors";

type Locale = "fi" | "en";

// TODO: Replace with getStaticProps reading content/home.yaml
const showCalendar = true;

// Hero slides — each slide has an image and an optional overlay box
type HeroOverlay = {
  title: string;
  subtitle: string;
  buttonLabel: string;
  buttonUrl: string;
};

type HeroSlide = {
  src: string;
  overlay?: HeroOverlay;
  // TODO: Replace with CMS dropdown — "both" | "mobile" | "desktop"
  showOn: "both" | "mobile" | "desktop";
};

const heroSlides: HeroSlide[] = [
  {
    src: "/images/Kielletyt liikkeet kuva Antti Kurola (9).jpg",
    showOn: "both",
  },
  {
    src: "/images/Uroslive, kuva Atti Kurola.jpg",
    showOn: "desktop",
  },
  {
    src: "/images/Uroslive, kuva Atti Kurola (13).jpg",
    showOn: "mobile",
  },
  {
    src: "/images/Siorskuadam-HiddenSteps_still_1-scaled.jpg",
    showOn: "both",
    overlay: {
      title: "MOVING NORTH -tanssielokuvakiertue",
      subtitle: "REMMI KLUBILLA 20.3.2026",
      buttonLabel: "Osta liput",
      buttonUrl: "https://www.netticket.fi/remmi-liveklubi-moving-north",
    },
  },
  {
    src: "/images/Kielletyt liikkeet kuva Antti Kurola (7).jpg",
    showOn: "both",
  },
];

// TODO: Replace with CMS data from content/events/
const placeholderEvents: CalendarEvent[] = [
  {
    date: "20.3.2026",
    time: "19:00",
    title: "Remmi Liveklubi: Moving North – Tanssielokuvia Pohjolasta",
    venue: "Kulttuuritalo Wiljami",
    ticketUrl: "https://www.netticket.fi/remmi-liveklubi-moving-north",
  },
  {
    date: "14.4.2026",
    time: "09:30",
    title: "Hamelnin Pillipiipari",
    venue: "Kulttuuritalo Wiljami",
    ticketUrl: "https://www.netticket.fi/product_info.php?products_id=546684",
  },
  {
    date: "14.4.2026",
    time: "18:00",
    title: "Hamelnin Pillipiipari",
    venue: "Kulttuuritalo Wiljami",
    ticketUrl: "https://www.netticket.fi/product_info.php?products_id=546685",
  },
  {
    date: "15.4.2026",
    time: "09:30",
    title: "Hamelnin Pillipiipari",
    venue: "Kulttuuritalo Wiljami",
    ticketUrl: "https://www.netticket.fi/product_info.php?products_id=546686",
  },
  {
    date: "16.4.2026",
    time: "09:30",
    title: "Hamelnin Pillipiipari",
    venue: "Kulttuuritalo Wiljami",
    ticketUrl: "https://www.netticket.fi/product_info.php?products_id=546687",
  },
  {
    date: "17.4.2026",
    time: "09:30",
    title: "Hamelnin Pillipiipari",
    venue: "Kulttuuritalo Wiljami",
    ticketUrl: "https://www.netticket.fi/product_info.php?products_id=546688",
  },
  {
    date: "18.4.2026",
    time: "13:00",
    title: "Hamelnin Pillipiipari",
    venue: "Kulttuuritalo Wiljami",
    ticketUrl: "https://www.netticket.fi/product_info.php?products_id=546689",
  },
  {
    date: "9.5.2026",
    time: "18:30",
    title: "Remmi Liveklubi: We Will Funk For Food: A Fistful of Funk",
    venue: "Kulttuuritalo Wiljami",
    ticketUrl: "https://www.netticket.fi/we-will-funk-for-food-a-fistful-of-funk-rovaniemi",
  },
];

// Detailed show info for modals — keyed by event title
const showInfos: Record<string, ShowInfo> = {
  "Hamelnin Pillipiipari": {
    title: "Hamelnin Pillipiipari",
    image: "/images/www-2_PilliPiip_1920x1080.jpg",
    performances: [
      { date: "14.4.2026", time: "09:30", ticketUrl: "https://www.netticket.fi/product_info.php?products_id=546684" },
      { date: "14.4.2026", time: "18:00", ticketUrl: "https://www.netticket.fi/product_info.php?products_id=546685" },
      { date: "15.4.2026", time: "09:30", ticketUrl: "https://www.netticket.fi/product_info.php?products_id=546686" },
      { date: "16.4.2026", time: "09:30", ticketUrl: "https://www.netticket.fi/product_info.php?products_id=546687" },
      { date: "17.4.2026", time: "09:30", ticketUrl: "https://www.netticket.fi/product_info.php?products_id=546688" },
      { date: "18.4.2026", time: "13:00", ticketUrl: "https://www.netticket.fi/product_info.php?products_id=546689" },
    ],
    description: [
      "Uusi, hulvaton tulkinta laittaa klassikkosadun ranttaliksi!",
      "Hamelnin kaupunkia vaivaa rottaongelma, varsinainen rottastrofi. Paikalle saapuu salaperäinen pilliä soittava muukalainen, joka lupaa karkottaa kiusanhenget kaupungista. Mutta jos tämä pillipiipari pystyy lumoamaan rotat soitollaan, mitä muuta hän voi saada aikaan?",
      "Syksyn 2024 koko perheen ensi-iltateos on kollaasi huvittavista tyypeistä ja vauhdikkaista tilanteista. Hamelnin Pillipiipari on klassikkosadun uusi tulkinta, jossa ei arkailla panna ranttaliksi. Tanssia, teatteria ja sirkusta yhdistävä esitys live-musiikin tahdittamana yllättää ja hauskuttaa. Tätä ette takuulla odottaneet!",
    ],
    credits: [
      "Ohjaus ja koreografia: Sanna Silvennoinen ja Jaakko Toivonen",
      "Äänisuunnittelu ja sävellys: Iiro Ollila",
      "Lavastus ja pukusuunnittelu: Mirkka Nyrhinen",
      "Valosuunnittelu: Vilma Vantola",
      "Tekstit: Hannes Mikkelsson",
      "Esiintyjät: Laura Kallas, Joni Kuokkanen, Liina Leppänen, Jukka Nurmela",
    ],
    extra: [
      "Teos on yhteistuotanto Tanssiteatteri Raatikon kanssa.",
      "Ensi-ilta Rovaniemellä Kulttuuritalo Wiljamissa: 25.9.2024",
      "Kesto: n. 45 min",
      "Suositusikä: 3–12 vuotta",
    ],
  },
  "Remmi Liveklubi: We Will Funk For Food: A Fistful of Funk": {
    title: "We Will Funk For Food: A Fistful of Funk",
    subtitle: "Remmi Liveklubi",
    image: "/images/Print-Size_Fistful-of-funk-35-scaled.jpg",
    performances: [
      { date: "9.5.2026", time: "18:30", ticketUrl: "https://www.netticket.fi/we-will-funk-for-food-a-fistful-of-funk-rovaniemi" },
    ],
    description: [
      "A Fistful of Funk on katutanssia, absurdia teatteri ja livemusiikkia yhdistelevä esitys, joka käsittelee ystävyyttä, sukupuoliroolien ja maskuliinisuuden teemoja leikin, huumorin ja virtuoosimaisen katutanssin avulla.",
      "Teoksessa kolme yksinäistä cowboyta lähtee yhdessä eeppiselle matkalle halki aavikon. Matkalla 1970-luvun funk-tanssi yhdistyy näytelmäkirjailija Juho Keräsen tekstiin, jonka inspiraationa on Sergio Leonen lännenelokuvien toksinen machismo ja hypermaskuliinisuus.",
      "Locking on 1970-luvulla Yhdysvaltain länsirannikolla afrikkalaisamerikkalaisten keskuudessa syntynyt tanssityyli, jolle ovat ominaisia terävät pysähdykset, groovaavat askeleet ja akrobaattiset temput. Esityksessä syvennytään yhteen Lockingin keskeisistä elementeistä: characteriin eli tanssijan ominaislaatuun. Hahmojen ja leikin kautta esitys tutkii vaihtoehtoisia maskuliinisia ilmaisuja ja esittelee samalla kunkin esiintyjän ainutlaatuista tyyliä ja persoonaa.",
      "Will Funk For Food on vuonna 2008 perustettu, yksi Suomen kansainvälisesti menestyneimmistä katutanssiryhmistä, joka on erikoistunut Locking-tanssityyliin. WFFF tekee tanssilajiaan tunnetuksi Suomessa, ja pyrkii toiminnallaan vakiinnuttamaan katutanssia osaksi suomalaista kulttuuritarjontaa sekä tuomaan iloa ja riemua kaikenikäisille. Tanssiryhmän suurimpia meriittejä ovat kolminkertainen peräkkäinen SM-kulta, sekä esityksiä niin Japanissa, Ranskassa kuin Itämeren takana Ruotsissa.",
    ],
    credits: [
      "Koreografia: Will Funk For Food",
      "Esiintyjät: Akim Bakhtaoui, Wilhelm Blomberg, Jeffrey Kam",
      "Äänisuunnittelu, muusikko: Sebastian Kurtén",
      "Rumpali: Elias Ojutkangas",
      "Dramaturgi, tekstit, voice over ja puhekohtausten ohjaus: Juho Keränen",
      "Pukusuunnittelu: Antrea Kantakoski",
      "Valosuunnittelu: Jaakko Sirainen",
      "Lavastussuunnittelu: Oscar Dempsey",
      "Tuotanto: Zodiak – Uuden tanssin keskus, Wilhelm Blomberg, Akim Bakhtaoui, Nordic Soul ry",
    ],
  },
  "Remmi Liveklubi: Moving North \u2013 Tanssielokuvia Pohjolasta": {
    title: "Moving North \u2013 Tanssielokuvia Pohjolasta",
    subtitle: "Remmi Liveklubi",
    image: "/images/Siorskuadam-HiddenSteps_still_1-scaled.jpg",
    performances: [
      { date: "20.3.2026", time: "19:00", ticketUrl: "https://www.netticket.fi/remmi-liveklubi-moving-north" },
    ],
    description: [
      "Remmi klubilla pöhistään maaliskuussa tanssielokuvasta kun Kati Kallio tuo Moving North -tanssielokuvakiertueen Rovaniemelle. Moving North -kiertue esittää palkittuja kotimaisia ja pohjoismaisia tanssielokuvia yhdessä lappilaistaiteilijoiden teosten kanssa, nostaen moninaisen liikkeen keskeiseen osaan elokuvan kerronnassa. Näytöksen jälkeen on yleisö tuttuun tapaan tervetullut osallistumaan keskusteluun panelistien kanssa.",
      "Tanssielokuva on kahden vahvan taidelajin täydellinen ja monimuotoinen liitto. Se on taidemuoto, joka ylittää kielimuurit ja genrerajat – se on demokraattinen, saavutettava ja aina yhtä kiehtova.",
    ],
    credits: [],
    extra: [
      "Kuva: Elokuvasta Siõrškuäđam – Vaietut askeleet (2025) / Kati Kallio ja Laura Fedoroff, Sons of Lumière. Valokuvaaja: Arttu Salo.",
    ],
  },
};

// News items — card title (short) separate from full modal title
type NewsCardItem = {
  cardTitle: string;
  info: ShowInfo;
};

const newsItems: NewsCardItem[] = [
  {
    cardTitle: "Kulttuurikummit palaavat. Lähde mukaan!",
    info: {
      title: "Kulttuurikummit palaavat \u2013 Hyppynarutus haastaa mukaan tukemaan lasten kulttuuria",
      subtitle: "Ajankohtaista",
      image: "/images/kulttuurikummiksi-nettisivuille-720x900.png",
      imageHeight: 480,
      description: [
        "Viime vuonna ensimmäistä kertaa lanseerattu kulttuurikummikampanja sai hienon vastaanoton: yli 800 katsojaa pääsi kokemaan taidetta Rimpparemmin esityksissä kummituen ansiosta. Nyt tämä sydämellinen haaste palaa – ja kutsuu uusia yrityksiä ja yhteisöjä mukaan luomaan unohtumattomia hetkiä rovaniemeläisille lapsille.",
        "Vuoden 2025 kulttuurikummiesityksenä nähdään osallistava ja vauhdikas lastentanssiteatteriesitys Hyppynarutus. Se kutsuu yleisön mukaansa pomppimaan, leikkimään ja kuvittelemaan – ja kulttuurikummit mahdollistavat sen, että esityksiin pääsee mukaan myös sellaisia lapsia, joille kulttuurielämykset eivät muuten olisi itsestäänselvyys.",
        "Miksi lähteä mukaan?",
        "Kulttuurikummius on tapa osoittaa yhteisöllisyyttä ja sosiaalista vastuuta – ja samalla saada hyvää näkyvyyttä. Yrityksen tai yhteisön nimi voidaan halutessanne nostaa esiin esityksen käsiohjelmissa, markkinointimateriaaleissa ja somessa. Mutta ennen kaikkea: mukanaolonne tuo iloa.",
        "Tukipaketit alkavat 100 eurosta",
        "Kynnys on matala. Tukipaketteja on tarjolla eri tasoisina, ja jokainen kummi saa näkyvyyttä – sekä hyvän mielen.",
      ],
      credits: [],
      extra: [
        "Katso kaikki tukipaketit ja lähde mukaan: rimpparemmi.fi/kulttuurikummiksi",
        "Yhdessä rakennamme tulevaisuuden, jossa taide kuuluu kaikille.",
        "Kiitos kun olet mukana. \uD83D\uDC9B",
      ],
    },
  },
];

const copy = {
  fi: {
    meta: "Tanssiteatteri Rimpparemmi – Rovaniemen ammattitanssiteatteri",
    description:
      "Tanssiteatteri Rimpparemmi on rovaniemeläinen ammattitanssiteatteri, joka tuottaa laadukasta tanssiteatteritaidetta.",
    title: "Tanssiteatteri Rimpparemmi",
    tagline: "Rovaniemen ammattitanssiteatteri",
    heroAlt: "Tanssiteatteri Rimpparemmi esitys",
    introTitle: "Tanssiteatteri Rimpparemmi",
    introParagraphs: [
      "Tanssiteatteri Rimpparemmi kertoo tarinoita: kauniita ja rumia. Tarinoita, jotka ovat joskus röyhkeitä ja toisinaan vakavia, useimmiten kuitenkin todella hauskoja. Välittyköön Rimpparemmin tekemisestä riemu ja rakkaus taiteeseen sekä esiintymiseen. Rimpparemmi toivoo, että juuri sinä, voit vahvistaa pohjoista identiteettiä osallistumalla tanssitaiteen kokemiseen ja jakaa pohjoisen tunteen palon kanssamme, sen joka meitä kaikkia lopulta yhdistää.",
      "Tanssiteatteri Rimpparemmi on Suomen pohjoisin ammattitanssiteatteri. Rimpparemmin juuret ulottuvat 1970-luvulle, jolloin toiminta alkoi Tervolassa kansantanssiyhtyeenä. Kansantanssin karhea ilmaisuvoima yhdistyy tänä päivänä nykytanssin virtaavuuteen Rimpparemmin esityksissä. Musiikki on vahvasti läsnä kaikessa toiminnassa.",
      "Tanssiteatteri Rimpparemmi tuottaa Rovaniemellä tanssi- ja teatteriesityksiä Tanssin näyttämöllä Kulttuuritalo Wiljamissa. Tanssin näyttämön ohjelmisto koostuu Rimpparemmin omista tuotannoista, yhteistuotannoista sekä vierailevista esityksistä. Rimpparemmi kiertää aktiivisesti ympäri Suomea esittämässä maailman parasta lappilaista tanssiteatteria.",
    ],
    calendarTitle: "Tulevat esitykset",
    buyTickets: "Osta liput",
    newsTitle: "Ajankohtaista",
    readMore: "Lue lisää",
  },
  en: {
    meta: "Dance Theatre Rimpparemmi – Professional dance theatre in Rovaniemi",
    description:
      "Dance Theatre Rimpparemmi is a professional dance theatre from Rovaniemi, producing high-quality dance theatre art.",
    title: "Dance Theatre Rimpparemmi",
    tagline: "Professional dance theatre in Rovaniemi",
    heroAlt: "Dance Theatre Rimpparemmi performance",
    introTitle: "Dance Theatre Rimpparemmi",
    introParagraphs: [
      "Dance Theater Rimpparemmi tells stories: both beautiful and ugly. Stories that are sometimes bold and occasionally serious, but most often truly funny. Let the joy and love for art and performance be conveyed through Rimpparemmi\u2019s creations. Rimpparemmi hopes that you, specifically, can strengthen the northern identity by participating in the experience of dance art and by sharing the passion for the northern sentiment with us \u2013 that which ultimately unites all of us.",
      "Rimpparemmi Dance Theatre is the northernmost professional dance theatre in Finland. The roots of Rimpparemmi stretch back to the 1970s when its operations began in Tervola as a folk dance ensemble. The raw expressive power of folk dance blends with the fluidity of contemporary dance in Rimpparemmi\u2019s performances. Music is strongly present in all activities.",
      "Dance Theater Rimpparemmi produces dance and theatre performances in Rovaniemi at their home stage in Kulttuuritalo Wiljami. The program consists of Rimpparemmi\u2019s own productions, collaborations, and guest performances. Rimpparemmi actively tours around Finland, presenting the world\u2019s best Lappish dance theatre.",
    ],
    calendarTitle: "Upcoming performances",
    buyTickets: "Buy tickets",
    newsTitle: "News",
    readMore: "Read more",
  },
} as const;

export default function Home() {
  const router = useRouter();
  const locale = (router.locale ?? "fi") as Locale;
  const t = copy[locale];

  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalInfo, setModalInfo] = useState<ShowInfo | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // Filter slides by device type
  const visibleSlides = heroSlides.filter((slide) =>
    slide.showOn === "both" ||
    (slide.showOn === "mobile" && isMobile) ||
    (slide.showOn === "desktop" && !isMobile)
  );

  // Advance hero image every 6 seconds — reset when device type changes
  useEffect(() => {
    setCurrentImageIndex(0);
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % visibleSlides.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isMobile]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Head>
        <title>{t.meta}</title>
        <meta name="description" content={t.description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Navigation />

      {/* Full-bleed hero */}
      <section
        className="hero-section"
        style={{
          position: "relative",
          width: "100%",
          minHeight: "600px",
          overflow: "hidden",
        }}
      >
        {/* Hero images — stacked, crossfade via opacity */}
        {visibleSlides.map((slide, i) => (
          <Image
            key={slide.src}
            src={slide.src}
            alt={t.heroAlt}
            fill
            priority={i === 0}
            style={{
              objectFit: "cover",
              objectPosition: "center 30%",
              opacity: i === currentImageIndex ? 1 : 0,
              transition: "opacity 2s ease-in-out",
            }}
          />
        ))}

        {/* Slide overlays — each fades with its image */}
        {visibleSlides.map((slide, i) =>
          slide.overlay ? (
            <div
              key={`overlay-${i}`}
              className="hero-overlay"
              style={{
                position: "absolute",
                backgroundColor: "rgba(17,17,17,0.88)",
                borderLeft: `3px solid ${colors.brandFuchsia}`,
                opacity: i === currentImageIndex ? 1 : 0,
                transition: "opacity 2s ease-in-out",
                pointerEvents: i === currentImageIndex ? "auto" : "none",
                zIndex: 2,
              }}
            >
              <p
                style={{
                  color: colors.brandFuchsia,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                }}
              >
                {slide.overlay.subtitle}
              </p>
              <h2
                style={{
                  color: colors.white,
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  lineHeight: 1.3,
                }}
              >
                {slide.overlay.title}
              </h2>
              <a
                href={slide.overlay.buttonUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "inline-block",
                  backgroundColor: colors.brandFuchsia,
                  color: colors.white,
                  borderRadius: "2px",
                  fontWeight: 600,
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {slide.overlay.buttonLabel}
              </a>
            </div>
          ) : null
        )}

        {/* Dark gradient overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            background:
              "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.6) 100%)",
          }}
        />

        {/* Title block bottom-left */}
        <div
          className="hero-title"
          style={{
            position: "absolute",
            left: "2rem",
            right: "2rem",
            zIndex: 2,
          }}
        >
          <h1
            style={{
              color: colors.white,
              fontSize: "clamp(1.75rem, 5vw, 3.75rem)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}
          >
            {t.title}
          </h1>
          {/* tagline hidden — field kept in copy object if needed later */}
        </div>

        {/* Scroll indicator */}
        <div
          style={{
            position: "absolute",
            bottom: "2rem",
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 2,
            cursor: "pointer",
          }}
          onClick={() =>
            window.scrollTo({ top: window.innerHeight, behavior: "smooth" })
          }
          aria-label="Scroll down"
        >
          <div className="scroll-arrow-bounce">
            <svg
              width="36"
              height="36"
              viewBox="0 0 36 36"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9 13L18 22L27 13"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </section>

      {/* Two-column section: intro text + ticket calendar */}
      <section
        style={{
          backgroundColor: colors.offWhite,
          padding: "5rem 2rem",
        }}
      >
        <div
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            display: "flex",
            flexWrap: "wrap",
            gap: "4rem",
            alignItems: "flex-start",
          }}
        >
          {/* Left column: intro text */}
          <div style={{ flex: "1 1 400px" }}>
            {/* introTitle hidden — field kept in copy object if needed later */}
            {t.introParagraphs.map((paragraph, i) => (
              <p
                key={i}
                style={{
                  color: colors.nearBlack,
                  fontSize: "1rem",
                  lineHeight: 1.85,
                  opacity: 0.85,
                  marginBottom:
                    i < t.introParagraphs.length - 1 ? "1.5rem" : 0,
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Right column: ticket calendar — hidden when showCalendar is false */}
          {showCalendar && (
            <div style={{ flex: "0 1 340px", minWidth: "280px" }}>

              {/* Section title */}
              <h2
                style={{
                  color: colors.nearBlack,
                  fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                {t.calendarTitle}
              </h2>

              {/* Vaihtoehto 1 label */}
              <p
                style={{
                  color: colors.muted,
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "1rem",
                }}
              >
                Vaihtoehto 1
              </p>

              {/* Monthly calendar widget — title rendered above */}
              <CalendarWidget
                events={placeholderEvents}
                locale={locale}
                calendarTitle={t.calendarTitle}
                buyTickets={t.buyTickets}
                onShowInfo={(title) => setModalInfo(showInfos[title] ?? null)}
                hideTitle
              />

              {/* Divider + Vaihtoehto 2 label */}
              <hr
                style={{
                  border: "none",
                  borderTop: `1px solid ${colors.borderLight}`,
                  margin: "2rem 0 1rem",
                }}
              />
              <p
                style={{
                  color: colors.muted,
                  fontSize: "0.65rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  marginBottom: "0.75rem",
                }}
              >
                Vaihtoehto 2
              </p>

              {/* Event list — all upcoming shows, scrollable after 3 */}
              <div
                style={{
                  marginTop: 0,
                  maxHeight: "198px",
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {placeholderEvents.map((event, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: colors.white,
                      borderLeft: `3px solid ${colors.brandFuchsia}`,
                      padding: "0.6rem 1rem",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: "0.75rem",
                      flexShrink: 0,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          color: colors.muted,
                          fontSize: "0.7rem",
                          letterSpacing: "0.08em",
                          marginBottom: "0.2rem",
                        }}
                      >
                        {event.date}{event.time ? ` · ${event.time}` : ""}
                      </p>
                      <p
                        style={{
                          color: colors.nearBlack,
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          marginBottom: "0.15rem",
                        }}
                      >
                        {event.title}
                      </p>
                      <p style={{ color: colors.muted, fontSize: "0.7rem" }}>
                        {event.venue}
                      </p>
                      {showInfos[event.title] && (
                        <button
                          onClick={() =>
                            setModalInfo(showInfos[event.title] ?? null)
                          }
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            color: colors.brandFuchsia,
                            fontSize: "0.65rem",
                            letterSpacing: "0.05em",
                            padding: 0,
                            marginTop: "0.25rem",
                          }}
                        >
                          Lue lisää →
                        </button>
                      )}
                    </div>
                    <Link
                      href={event.ticketUrl}
                      style={{
                        backgroundColor: colors.brandFuchsia,
                        color: colors.white,
                        padding: "0.35rem 0.65rem",
                        borderRadius: "2px",
                        fontSize: "0.7rem",
                        fontWeight: 600,
                        letterSpacing: "0.05em",
                        whiteSpace: "nowrap",
                        flexShrink: 0,
                      }}
                    >
                      {t.buyTickets}
                    </Link>
                  </div>
                ))}
              </div>

            </div>
          )}
        </div>
      </section>

      {/* Ajankohtaista / News */}
      <section
        style={{
          backgroundColor: colors.white,
          padding: "5rem 2rem",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h2
            style={{
              color: colors.nearBlack,
              fontSize: "clamp(1.25rem, 2.5vw, 1.75rem)",
              fontWeight: 700,
              letterSpacing: "0.05em",
              textTransform: "uppercase",
              marginBottom: "2.5rem",
            }}
          >
            {t.newsTitle}
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 360px))",
              gap: "1.5rem",
            }}
          >
            {newsItems.map((item, i) => (
              <div
                key={i}
                onClick={() => setModalInfo(item.info)}
                style={{
                  backgroundColor: colors.offWhite,
                  borderRadius: "8px",
                  overflow: "hidden",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.07)",
                }}
              >
                {item.info.image && (
                  <Image
                    src={item.info.image}
                    alt={item.cardTitle}
                    width={720}
                    height={900}
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                )}
                <div
                  style={{
                    padding: "1.25rem 1.5rem 1.5rem",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  {item.info.subtitle && (
                    <p
                      style={{
                        color: colors.brandFuchsia,
                        fontSize: "0.65rem",
                        letterSpacing: "0.1em",
                        textTransform: "uppercase",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {item.info.subtitle}
                    </p>
                  )}
                  <h3
                    style={{
                      color: colors.nearBlack,
                      fontSize: "1rem",
                      fontWeight: 700,
                      lineHeight: 1.35,
                      letterSpacing: "0.02em",
                      marginBottom: "1rem",
                      flex: 1,
                    }}
                  >
                    {item.cardTitle}
                  </h3>
                  <span
                    style={{
                      color: colors.brandFuchsia,
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {t.readMore} →
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ShowModal info={modalInfo} onClose={() => setModalInfo(null)} />
    </>
  );
}
