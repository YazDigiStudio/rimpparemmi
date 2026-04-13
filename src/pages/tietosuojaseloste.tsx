// Tietosuojaseloste — Privacy policy page

import Navigation from "@/components/Navigation";
import Seo from "@/components/Seo";
import { colors } from "@/styles/colors";

type Section = {
  heading?: string;
  paragraphs?: string[];
  items?: string[];
};

const sections: Section[] = [
  {
    paragraphs: [
      "Rimpparemmi ry. / Tanssiteatteri Rimpparemmi ylläpitää seuraavia rekisterejä sidosryhmistään: jäsenrekisteri, asiakasrekisteri, myyntirekisteri ja työntekijärekisteri. Asiakasrekisteriä pidetään yhdessä Oy NetTicket Finland Ab:n kanssa. Rekisterit on suojattu asianmukaisin keinoin eikä asiattomilla henkilöillä ole pääsyä rekistereiden tietoihin. Rekisteröidyllä on oikeus tarkastaa mitä häntä koskevia tietoja rekisterissä on. Tarkastuspyynnöt lähetetään rekisteri-/tietosuojaselosteessa mainitulle rekisteristä vastaavalle henkilölle kirjallisena.",
    ],
  },
  {
    heading: "Tietosuojalauseke",
    paragraphs: [
      "Tanssiteatteri Rimpparemmi on sitoutunut suojaamaan asiakkaidensa yksityisyyttä. Antamalla yhteystietonsa asiakas hyväksyy tämän tietosuojalausekkeen ehdot. Asiakkaan tulee olla antamatta yhteystietoja, jos hän ei hyväksy tietosuojalausekkeen ehtoja. Tässä tietosuojalausekkeessa kerrotaan, minkälaisia tietoja asiakkaista kerätään, mihin niitä käytetään ja minkälaisia vaikutusmahdollisuuksia asiakkaalla on.",
    ],
  },
  {
    heading: "1. Millaisia tietoja asiakkaasta voidaan kerätä?",
    paragraphs: ["Asiakkaan itse antamat tiedot"],
    items: [
      "yhteystiedot kuten nimi, osoite, puhelinnumero ja sähköpostiosoite",
      "demografiatiedot kuten ikä, sukupuoli, arvo tai ammatti ja äidinkieli",
      "käyttäjän antamat profilointi- ja kiinnostustiedot",
      "kyselyihin ja tutkimuksiin annetut tiedot",
      "luvat ja suostumukset",
    ],
  },
  {
    paragraphs: ["Asiakkuuteen ja palvelun käyttöön liittyvät tiedot"],
    items: [
      "asiointi- ja käyttötiedot",
      "muut käyttäjän suostumuksella kerätyt tiedot",
      "palvelun käytöstä ja/tai asiakkaan antamista tiedoista päätellyt tiedot, esimerkiksi kiinnostuksen kohteet",
    ],
  },
  {
    heading: "2. Mihin tarkoitukseen kerättyjä tietoja voidaan käyttää?",
    paragraphs: [
      "Palveluiden tuottamisen ja kehittämiseen — Kerättyjen tietojen avulla voimme toteuttaa palveluita sekä personoida ja kehittää niitä ja niiden käyttökokemusta.",
      "Myynnin kohdentamiseen — Kerättyjen tietojen avulla voimme kohdentaa asiakkaalle häntä mahdollisesti kiinnostavia tuotteita ja palveluita sekä erilaisia tarjouksia eri viestintäkanavia hyödyntäen.",
      "Kohdennettuun digitaaliseen mainontaan — Esitämme asiakkaalle mainontaa, joka todennäköisesti kiinnostaa häntä. Asiakkaalle voidaan esimerkiksi kohdistaa tarjouksia tämän asiakkuushistoriaan perustuen.",
    ],
  },
  {
    heading: "3. Miten kerättyjä tietoja säilytetään ja kuinka kauan?",
    paragraphs: [
      "Kerättyjä tietoja säilytetään tietokannassa, jotka on suojattu mm. palomuurein, salaustekniikoin sekä rajoitetun kulunvalvonnan ja käyttöoikeuksien avulla. Kerättyjä tietoja säilytetään niin kauan kuin on tarpeen voimassaolevan lainsäädännön mukaisesti.",
    ],
  },
  {
    heading: "4. Millaisia vaikutusmahdollisuuksia käyttäjällä on?",
    paragraphs: [
      "Olemme sitoutuneita tarjoamaan asiakkaillemme valintoja ja hallintamahdollisuuksia tietosuojaan liittyen. Alla listatuilla tavoilla asiakkaat voivat vaikuttaa tietojen keräämiseen ja käsittelyyn.",
      "Tietojen tarkastaminen — Asiakkaalla on oikeus tarkastaa hänestä talletetut henkilötiedot. Hän voi myös pyytää virheellisten tietojen muokkaamista tai poistamista.",
      "Sähköisen suoramarkkinoinnin kieltäminen — Asiakas voi kieltää sähköisen suoramarkkinoinnin ottamalla yhteyttä henkilökuntaamme tai perumalla viestiensä tilauksen.",
    ],
  },
  {
    heading: "5. Evästeet",
    paragraphs: [
      "Tämä verkkosivusto ei itse aseta seurantaevästeitä. Käytämme lipunmyynnissä Netticket.fi-palvelua, jonka widget ladataan sivustolle ainoastaan käyttäjän hyväksyttyä evästeet.",
      "Kun evästeet hyväksytään, Netticket.fi-widget asettaa seuraavat kolmannen osapuolen evästeet:",
    ],
    items: [
      "_ga, _ga_* — Google Analytics (kävijäseuranta, voimassa 2 vuotta)",
      "_fbp — Facebook Pixel (mainonnan kohdentaminen, voimassa 3 kuukautta)",
      "_gcl_au — Google Ads (konversioseuranta, voimassa 3 kuukautta)",
      "_lfa — Leadfeeder (kävijäseuranta, voimassa 1 vuosi)",
      "__Secure-osCsid — Netticket.fi istuntoeväste (istunnon ajan)",
      "TawkConnectionTime, twk_idm_key — Tawk.to chat-widget (istunnon ajan)",
      "cookie-consent — Netticket.fi:n oma evästehyväksyntä (1 vuosi)",
    ],
  },
  {
    paragraphs: [
      "Käyttäjä voi milloin tahansa peruuttaa evästesuostumuksensa tyhjentämällä selaimensa evästeet tai ottamalla yhteyttä meihin.",
    ],
  },
  {
    heading: "6. Tietosuojalausekkeen päivittyminen",
    paragraphs: [
      "Kehittäessämme palveluitamme ja lainsäädännön muuttuessa myös tämä tietosuojalauseke saattaa joiltain osin muuttua. Suosittelemme tutustumaan tietosuojalausekkeeseen säännöllisin väliajoin.",
    ],
  },
  {
    heading: "7. Yhteys",
    paragraphs: [
      "Asiakas voi ottaa yhteyttä sähköpostitse: Tanssiteatteri Rimpparemmi, rimpparemmi@rimpparemmi.fi",
    ],
  },
];

export default function Tietosuojaseloste() {
  return (
    <>
      <Seo
        title="Tietosuojaseloste – Tanssiteatteri Rimpparemmi"
        description="Tanssiteatteri Rimpparemmin rekisteri- ja tietosuojaselosteet."
        path="/tietosuojaseloste"
        breadcrumbs={[
          { name: "Etusivu", path: "/" },
          { name: "Tietosuojaseloste", path: "/tietosuojaseloste" },
        ]}
      />
      <Navigation />
      <main
        style={{
          backgroundColor: colors.offWhite,
          minHeight: "100vh",
          padding: "calc(96px + 4rem) 2rem 5rem",
        }}
      >
        <div style={{ maxWidth: "760px", margin: "0 auto" }}>
          <h1
            style={{
              color: colors.nearBlack,
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              marginBottom: "3rem",
            }}
          >
            Rekisteri- ja tietosuojaselosteet
          </h1>

          {sections.map((section, i) => (
            <div key={i} style={{ marginBottom: "2rem" }}>
              {section.heading && (
                <h2
                  style={{
                    color: colors.nearBlack,
                    fontSize: "1rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    marginBottom: "0.75rem",
                    paddingBottom: "0.4rem",
                    borderBottom: `2px solid ${colors.brandFuchsia}`,
                  }}
                >
                  {section.heading}
                </h2>
              )}
              {section.paragraphs?.map((p, j) => (
                <p
                  key={j}
                  style={{
                    color: colors.nearBlack,
                    fontSize: "0.95rem",
                    lineHeight: 1.8,
                    opacity: 0.85,
                    marginBottom: "0.75rem",
                  }}
                >
                  {p}
                </p>
              ))}
              {section.items && (
                <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
                  {section.items.map((item, j) => (
                    <li
                      key={j}
                      style={{
                        color: colors.nearBlack,
                        fontSize: "0.95rem",
                        lineHeight: 1.8,
                        opacity: 0.85,
                        marginBottom: "0.25rem",
                      }}
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
