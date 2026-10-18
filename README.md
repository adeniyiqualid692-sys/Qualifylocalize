# Qualifylocalize

Original responsive corporate website for Qualifylocalize. Buildless HTML, CSS, and JavaScript in `public/`.

## Run locally

Run `python3 -m http.server 8000 --directory public`, then visit http://localhost:8000.

## Deployment

Serve `public/` as the website root on any static host (Cloudflare Pages, Netlify, Vercel, or GitHub Pages). No build command or dependencies are required. For GitHub Pages, use a Pages deployment workflow that uploads `public/` or select an equivalent static host. No production hosting has been configured by this commit.

## Features

- Responsive sticky navigation, custom animated SVG globe, and reduced-motion support.
- Six services, keyboard-accessible industry tabs, and a filterable illustrative linguist directory with empty states and reset.
- Quote calculator with word count, service, and timeline inputs; same-language validation; indicative GBP ranges; custom quotes for multimedia and DTP.
- Email and WhatsApp handoffs with a prepared project brief. The visitor reviews and sends the message in their own app. No server submissions, attachments, or automatic delivery.
- Newsletter subscription requests open an email draft; there is no mailing-list backend or automatic subscription.

## Content to verify before marketing launch

Replace illustrative linguist profiles with approved real profiles and verified credentials. Set actual approved prices, language availability, and any performance figures before publishing such claims. Current sample estimates are explicitly labeled and do not promise rates. No invented testimonials, client logos, ratings, accreditation, or company performance metrics are used.

The contact email is support@qualifylocalize.com and WhatsApp is +447770012186. Confirm both channels are monitored. Confirm requirements individually for certified translations; no accreditation is claimed.

Typography uses Google Fonts with local system fallbacks. All graphic elements are original CSS/SVG. The reference screenshot informed the business category only; its assets and text were not reused.

## Verification

`node --check public/app.js` and the included `python3 checks.py` validate JavaScript syntax, HTML local asset paths, fragment destinations, required service/contact content, and excluded wording. Browser rendering could not be verified in the supplied container because the managed preview could not mount its process filesystem.
