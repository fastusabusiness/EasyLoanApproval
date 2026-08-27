// Loads the Tawk.to live-chat widget. Renders nothing unless both
// NEXT_PUBLIC_TAWK_PROPERTY_ID and NEXT_PUBLIC_TAWK_WIDGET_ID are set, so the
// site degrades gracefully when Tawk isn't configured. Uses next/script with
// the lazy strategy to avoid blocking first paint.

import Script from "next/script";

const PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID;
const WIDGET_ID = process.env.NEXT_PUBLIC_TAWK_WIDGET_ID;

// Allow only the alphanumeric IDs Tawk issues — guards against accidentally
// templating arbitrary characters into the embed URL.
const SAFE_ID = /^[A-Za-z0-9]+$/;

export default function TawkChat() {
  if (!PROPERTY_ID || !WIDGET_ID) return null;
  if (!SAFE_ID.test(PROPERTY_ID) || !SAFE_ID.test(WIDGET_ID)) return null;

  return (
    <Script
      id="tawk-chat"
      strategy="lazyOnload"
      // The exact snippet Tawk gives you in their dashboard, with the IDs
      // interpolated at build time.
      dangerouslySetInnerHTML={{
        __html: `
          var Tawk_API=Tawk_API||{};
          var Tawk_LoadStart=new Date();
          (function(){
            var s1=document.createElement("script");
            var s0=document.getElementsByTagName("script")[0];
            s1.async=true;
            s1.src='https://embed.tawk.to/${PROPERTY_ID}/${WIDGET_ID}';
            s1.charset='UTF-8';
            s1.setAttribute('crossorigin','*');
            s0.parentNode.insertBefore(s1,s0);
          })();
        `,
      }}
    />
  );
}
