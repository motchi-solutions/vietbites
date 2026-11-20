# Audit findings

Lasting findings and open items. Remove an item once it ships.

## Open (next release)

- **Contact form disclosure:** the form uses Cloudflare Turnstile but shows no notice. Add a short line under the form, like lai and kamanda: "This form uses Cloudflare Turnstile to block spam. See the Turnstile privacy policy" (link: https://www.cloudflare.com/turnstile-privacy-policy/).
- **Privacy policy:** the site has a contact form, analytics and email delivery but no privacy policy page. Add `/privacy-policy` covering Vercel (hosting, CDN, Web Analytics: cookie-free, path plus `utm_*` only), Cloudflare Turnstile, Brevo (email), Upstash Redis via Vercel (hashed rate-limit keys only) and Notion (content only). Link it from the footer and from the contact form, and add it to `src/app/sitemap.ts`.
