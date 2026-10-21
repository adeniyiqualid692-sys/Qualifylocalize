# Qualifylocalize

A 14-page responsive translation and localization website using buildless HTML, CSS, and Vanilla JavaScript. Serve `public/` from GitHub, or `dist/` in the Sites source checkout, as the website root. No framework or build command is required.

## Forms

Quote requests, contact enquiries, and newsletter subscription requests POST to `https://formspree.io/f/xwlvgeae`. This is a public form endpoint, not a secret API key. No secret belongs in the frontend.

`forms.js` uses native Vanilla JS AJAX (`fetch` and `FormData`) with `Accept: application/json`, tailored to the existing calculator and forms. Each form also has an HTML POST action as a fallback. There is no external SDK dependency.

Submissions include `request_type`, `_subject`, the visitor's email, and an empty `_gotcha` spam honeypot. Quotes include service, source and target languages, words, timeline, notes, and a clearly labeled illustrative budget. Contact enquiries include name, subject, and message. Newsletter submissions request updates; they do not enrol a user in a mailing-list platform without a Formspree workflow.

The UI shows sending/success/error states, disables submit buttons while in flight, blocks duplicate in-flight requests, marks server-invalid fields, and preserves entries on errors. Connection failures/timeouts do not trigger automatic POST retries. WhatsApp still opens a separate prepared message.

Delivery depends on the Formspree account's activation, recipient settings, limits, spam rules, and any domain restrictions. Test one real submission from the deployed site and confirm it appears in the Formspree dashboard and intended inbox. Live delivery has not been tested by this implementation; automated tests use mocks and send no notifications.

If restricting allowed domains in Formspree, include the live preview origin and any custom production domain you use. Configure mailing-list automation in Formspree if desired.

## Checks

Run `node --check public/app.js`, `node --check public/forms.js`, and `node tests/formspree.test.cjs` from the GitHub checkout. In the Sites checkout, use `dist/` in place of `public/`; the tests detect either layout.

The submission tests cover success, structured payloads, server validation, rate limiting, malformed errors, network failures, timeouts, submit locking, and recovery. They do not replace a real inbox-delivery test or visual browser verification.

## Content

Linguist profiles and pricing are illustrative. Replace with verified, approved business data before representing them as real availability or rates. No invented customer testimonials, certifications, or performance metrics are included. Confirm certification requirements individually with each request.
