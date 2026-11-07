# LovePDFi Photo Studio — SEO-ready static package

Production target: `https://images.lovepdfi.com/`

## Files
- `index.html` — editor, original informational landing-page content, metadata and JSON-LD.
- `styles.css`, `app.js` — browser-side editor, responsive layout and multi-photo navigation.
- The editor displays one selected photo prominently on the main canvas. Other uploaded photos appear in a horizontal thumbnail gallery; select a thumbnail to switch photos.
- Multiple JPG, PNG and WEBP images can be added in one upload or through **Add photos**. Each photo retains its own effect, filter, frame, shape and adjustment settings while switching between thumbnails.
- Export is available for the currently selected photo in PNG, JPG or WEBP format.
- `about.html`, `privacy-policy.html`, `terms.html`, `contact.html` — trust and policy pages.
- `robots.txt`, `sitemap.xml`, `favicon.svg` — crawl and brand assets.

## SEO setup included
- Unique title, meta description, canonical URL, robots directive and Open Graph metadata.
- Visible explanatory content for effects, frames, shapes, filters, how-to instructions, formats, privacy and FAQs.
- JSON-LD: Organization, WebSite and WebPage; policy pages also include BreadcrumbList.
- No fabricated reviews, ratings, testimonials, business address, contact email or FAQ rich-result markup.
- XML sitemap includes only the pages shipped in this package.

## Important Google guidance
1. Titles should be descriptive and concise; Google may rewrite title links and snippets.
2. Structured data must describe visible page content. Google does not guarantee rich-result display.
3. FAQ content is visible to users, but FAQPage schema is intentionally omitted: Google limits FAQ rich results primarily to well-known authoritative government and health sites.
4. SoftwareApplication rich-result markup is intentionally omitted because Google requires a genuine review or aggregate rating in addition to app name and offer price. Do not invent ratings.
5. AdSense approval is never guaranteed by technical SEO. Keep the tool usable and the explanatory content original and useful. Do not place ads where users can mistake them for editor controls, navigation or download buttons; do not place ads on empty, error, loading or non-content screens. Review current AdSense policies before adding any ad code.

## Before public launch — owner actions
- Confirm `images.lovepdfi.com` points to this deployment and HTTPS works.
- The Contact page uses the support email currently published on the main LovePDFi website: `support@lovepdfi.com`. Confirm that mailbox remains monitored.
- Review Privacy Policy if you later add Analytics, AdSense, cookies, consent tools, external fonts or other third-party scripts. The current build removes the Google Fonts network import and includes no analytics or advertising tags.
- Verify all policy wording against the actual production setup and applicable local laws. This is a technical starter, not legal advice.
- Submit `https://images.lovepdfi.com/sitemap.xml` in Google Search Console after deployment.
- Test the homepage and policy pages with Google Rich Results Test / URL Inspection, and validate XML sitemap accessibility.
- Test editor functionality in current Chrome, Firefox, Safari and mobile browsers.

## Deploy
Connect this folder to a separate Cloudflare Pages project or deploy the static files from your own build pipeline. Set the custom domain to `images.lovepdfi.com`. No backend is required for the current editor.
