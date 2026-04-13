// Saavutettavuus page — placeholder
import Navigation from "@/components/Navigation";
import Seo from "@/components/Seo";
import { colors } from "@/styles/colors";

export default function Saavutettavuus() {
  return (
    <>
      <Seo
        title="Saavutettavuus – Tanssiteatteri Rimpparemmi"
        description="Tanssiteatteri Rimpparemmin verkkosivuston saavutettavuusseloste."
        path="/saavutettavuus"
        breadcrumbs={[
          { name: "Etusivu", path: "/" },
          { name: "Saavutettavuus", path: "/saavutettavuus" },
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
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <h1
            style={{
              color: colors.nearBlack,
              fontSize: "clamp(1.75rem, 4vw, 3rem)",
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            Saavutettavuus
          </h1>
        </div>
      </main>
    </>
  );
}
