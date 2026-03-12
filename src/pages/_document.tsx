import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Kumbh+Sans:wght@700&family=Lexend:wght@400;700&display=swap"
          rel="stylesheet"
        />
        {/* Netticket floating sidebar embed */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script id="nt-embed-script" src="https://www.netticket.fi/production/embedjs/" async />
      </Head>
      <body>
        <Main />
        <NextScript />
        {/* Redirect Netlify Identity tokens (invite/recovery) to /admin/ where the widget lives */}
        <script dangerouslySetInnerHTML={{ __html: `
          (function() {
            var hash = window.location.hash;
            if (hash.indexOf('invite_token') !== -1 || hash.indexOf('recovery_token') !== -1 || hash.indexOf('confirmation_token') !== -1) {
              window.location.replace('/admin/' + hash);
            }
          })();
        `}} />
      </body>
    </Html>
  );
}
