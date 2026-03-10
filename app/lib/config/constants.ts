export const LOCATIONS = {
  PRAGUE: "Prague",
  ZLIN: "Zlin",
} as const;

export type LocationValue = (typeof LOCATIONS)[keyof typeof LOCATIONS];

export const WEBSITE_URLS = {
  BASE: "https://www.bnf.events",
  CDN: "https://cdn-img.bnf.events",
  SERVICES: {
    RESEND_EMAILS_API: "https://api.resend.com/emails",
    TURNSTILE_SCRIPT: "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit",
    TURNSTILE_VERIFY: "https://challenges.cloudflare.com/turnstile/v0/siteverify",
  },
  GOOGLE: {
    CALENDAR_RENDER: "https://www.google.com/calendar/render",
    MAPS_SEARCH: "https://www.google.com/maps/search/",
  },
  SHARE: {
    FACEBOOK: "https://www.facebook.com/sharer/sharer.php",
    LINKEDIN: "https://www.linkedin.com/sharing/share-offsite/",
    X: "https://x.com/intent/tweet",
  },
  EMBED: {
    YOUTUBE_NOCOOKIE: "https://www.youtube-nocookie.com/embed",
  },
  MEDIA: {
    NEWSLETTER_HERO_PLACEHOLDER:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
  },
  SOCIAL: {
    DISCORD: "https://discord.com/invite/8Tqm7vAd4h",
    FACEBOOK: "https://www.facebook.com/bonfire.meetup",
    GITHUB: "https://github.com/Bonfire-Meetup",
    YOUTUBE_PLAYLIST: "https://www.youtube.com/playlist?list=PL5JjhpXFzfZp51YDuRgc9w6JVJUM9EQaN",
  },
  PARTNERS: {
    FLYING_RAT: "https://flying-rat.studio",
    POLYPERFECT: "https://www.polyperfect.com/",
    SPACE_BREAK: "https://www.instagram.com/spacebreakcoffee/",
    UPPER_UTB: "https://upper.utb.cz/",
    UTB: "https://www.utb.cz/",
    VISIONGAME: "http://visiongame.cz/",
  },
  ATTRIBUTIONS: {
    GIANTS: {
      BLACKSMITH: "https://www.blacksmith.sh",
      CLOUDFLARE_R2: "https://www.cloudflare.com/products/r2/",
      CLOUDFLARE_TURNSTILE: "https://www.cloudflare.com/products/turnstile/",
      GITHUB: "https://github.com",
      NEON: "https://neon.tech",
      RESEND: "https://resend.com",
      ROLLBAR: "https://rollbar.com",
      VERCEL: "https://vercel.com",
    },
    TECH: {
      BABEL_REACT_COMPILER: "https://react.dev/learn/react-compiler",
      BOTID: "https://botid.io",
      BUN: "https://bun.sh",
      CSSNANO: "https://cssnano.co",
      DEFINITELY_TYPED: "https://github.com/DefinitelyTyped/DefinitelyTyped",
      DRIZZLE_ORM: "https://orm.drizzle.team",
      ESLINT: "https://eslint.org",
      ESLINT_STYLE: "https://eslint.style",
      GEIST_FONT: "https://vercel.com/font",
      JOSE: "https://github.com/panva/jose",
      NEON: "https://neon.tech",
      NEON_SERVERLESS: "https://neon.tech/docs/serverless",
      NEXT_INTL: "https://next-intl-docs.vercel.app",
      NEXT_THEMES: "https://github.com/pacocoursey/next-themes",
      NEXTJS: "https://nextjs.org",
      NUQS: "https://nuqs.dev",
      OXC: "https://oxc-project.github.io",
      POSTCSS: "https://postcss.org",
      QR_SCANNER: "https://github.com/yudielcurbelo/react-qr-scanner",
      QRCODE: "https://github.com/soldair/node-qrcode",
      REACT: "https://react.dev",
      REACT_DOM: "https://react.dev",
      REACT_EMAIL: "https://react.email",
      REACT_EMAIL_CLI: "https://react.email/docs/cli",
      REACT_EMAIL_COMPONENTS: "https://react.email/docs/components",
      REACT_REDUX: "https://react-redux.js.org",
      REDUX_TOOLKIT: "https://redux-toolkit.js.org",
      ROLLBAR: "https://rollbar.com",
      ROLLBAR_REACT: "https://github.com/rollbar/rollbar-react",
      SHARP: "https://sharp.pixelplumbing.com",
      SIMPLE_WEBAUTHN: "https://simplewebauthn.dev",
      TAILWINDCSS: "https://tailwindcss.com",
      TANSTACK_QUERY: "https://tanstack.com/query",
      TYPESCRIPT: "https://www.typescriptlang.org",
      TYPESCRIPT_ESLINT: "https://typescript-eslint.io",
      UA_PARSER: "https://github.com/faisalman/ua-parser-js",
      VERCEL_ANALYTICS: "https://vercel.com/analytics",
      VERCEL_SPEED_INSIGHTS: "https://vercel.com/speed-insights",
      ZOD: "https://zod.dev",
    },
  },
  CONTACT_EMAIL: "hello@bnf.events",
  CONTACT_EMAIL_COC: "hello+coc@bnf.events",
  CONTACT_EMAIL_CREW: "hello+crew@bnf.events",
  CONTACT_EMAIL_PRESS: "hello+press@bnf.events",
  CONTACT_EMAIL_PROPOSAL: "hello+proposal@bnf.events",
} as const;

export const BOOST_CONFIG = {
  BOOSTS_PER_MONTH: 2,
  MAX_BOOSTS: 8,
} as const;

export const DEFAULT_TIMEZONE = "Europe/Prague";
