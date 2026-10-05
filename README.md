# IHOP Church Dove Springs

A complete redesign for International House of Prayer Church Dove Springs in Austin, Texas. Eight fast, accessible, static pages built around real church photography, clear service information, and an editorial black, white, and red design.

## Pages

Home, About, Ministries, Plan Your Visit, Messages, Giving, Events, and Contact. The website includes responsive navigation, keyboard support, visitor FAQs, prayer-request links, a sitemap, and a custom church favicon. Events are linked in the main navigation and listed on the homepage. Thirteen authentic church photographs rotate every 12 seconds, with 1.8-second crossfades and previous, next, and pause controls. Automatic rotation pauses off screen, when the tab is hidden, on hover, and during keyboard interaction. Reduced-motion visitors get a still photograph until they choose to play the gallery.

## Edit and build

Requires Node.js 18 or later. No package installation or framework runtime is needed.

```sh
npm run build
```

Page content and shared layout live in `scripts/build.mjs`. Gallery content, descriptions, and source credits live in `src/photos.json`. Edit `src/styles.css` for visual styling and `src/main.js` for navigation and motion. Optimized photographs and locally hosted font files are in `dist/assets/`. Build output is in `dist/` and is committed for static hosting.

To use a different deployment address, build with `SITE_ORIGIN` set to its full HTTPS origin. This updates canonical links, Open Graph URLs, and the sitemap.

```sh
SITE_ORIGIN=https://www.example.org npm run build
```

Any static host can serve `dist/`. The server must serve directory `index.html` files and should serve `404.html` for missing paths. The connected Sites deployment uses `.openai/hosting.json`.

## Content and external services

Content was reviewed against the original church website on October 5, 2026. The consistent published Sunday worship time is noon–2 pm; the Facebook livestream is listed at 12:30 pm. Events lists the church’s published recovery (Sunday, 5:30–7:30 pm) and Bible study/potluck (Friday, 6:30–8 pm) gatherings, with a reminder to check announcements for changes. Conflicting prayer schedules and expired special-event dates are not presented as current. Visitors can follow the church’s original announcements page for updates.

Giving, contact, prayer requests, and newsletter subscriptions link to the church’s existing Squarespace pages and forms. The redesign does not process donations or collect visitor information independently. Facebook, YouTube, and Google Maps links use the church’s published channel and location.

## Asset sources

- `fellowship.webp` and `gallery-courtyard.webp`: the congregation photograph on [the church About page](https://www.ihopdovesprings.org/about).
- `prayer.webp`, `worship.webp`, and `gallery-harvest-*.webp`: photographs of the June 2026 and November 2024 IHOP Dove Springs revivals, published in [Harvest For Christ’s outreach gallery](https://www.harvestforchrist.org/outreach-media.html).
- `favicon.png`: the mark published on the original church website.
- DM Sans and DM Serif Display: Google Fonts, under the SIL Open Font License. License files are included in `dist/assets/`.

Church photographs and branding retain their respective owners’ rights. No license is granted for unrelated reuse.

## Validation

The build and JavaScript syntax checks pass. Slideshow behavior was checked for timing, pause controls, reduced motion, manual navigation, error fallback, pausing while an image loads, hover, and hidden-tab behavior. Local links, cross-page anchors, image alternative text, asset references, page titles, and document landmarks were checked across all pages. Responsive styles cover desktop, tablet, and mobile layouts; reduced-motion preferences are respected. No browser visual QA was run in this environment.
