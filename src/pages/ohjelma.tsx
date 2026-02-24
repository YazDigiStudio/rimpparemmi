// Ohjelmisto page — placeholder
import Head from "next/head";
import Navigation from "@/components/Navigation";
import { colors } from "@/styles/colors";

export default function Ohjelma() {
  return (
    <>
      <Head>
        <title>Ohjelmisto – Tanssiteatteri Rimpparemmi</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
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
            Ohjelmisto
          </h1>
        </div>
      </main>
    </>
  );
}
