# Pradeep Reddy – portfolio site

Open `index.html` in a browser, or upload the whole folder to any static host
(GitHub Pages, Netlify, Vercel). There is no build step.

## Folder layout

```
index.html                 All page content (text, sections, links, form)
css/                       Styles, one file per part of the page
  fonts.css                Web fonts (files live in fonts/)
  base.css                 Colours, font and spacing tokens, page basics
  boot-screen.css          Terminal intro
  header.css               Top bar and full-screen menu
  hero.css                 First screen
  tech-band.css            Scrolling technology names
  sections.css             Section headings ([01] Profile …)
  profile.css              Profile section
  work.css                 Selected work (projects)
  diagrams.css             Line styles used inside the project diagrams
  stack.css                Stack table
  path.css                 Path timeline
  contact.css              Contact section, form, button
  footer.css               Footer
  responsive.css           Tablet/mobile and reduced-motion overrides
  aware-figure.css         The isometric AWARE drawing
fonts/                     .woff2 font files
js/
  vendor/                  Third-party libraries (minified, don't edit)
                           gsap, ScrollTrigger, SplitText, Lenis, three.js
  particle-field/          The animated particle background
  diagrams/                One file per project diagram + index.js (which diagram goes where)
  boot-screen.js           Terminal intro text and animation
  aware-figure/            Isometric AWARE drawing: geometry, rendering, markup, animation
  page/                    Page behaviour
    helpers.js             $, $$ and prefersReducedMotion
    smooth-scroll.js       Smooth scrolling and #links
    field-sections.js      Particle shape/brightness per section
    header.js              Header background and the IST clock
    menu.js                Full-screen menu
    contact-form.js        Contact form (sends via FormSubmit)
    projects.js            Mounts the project diagrams
    intro.js               Page-load animation
    scroll-animations.js   Scroll-driven animations
    main.js                Starts everything (keep it last)
```

The order of the `<link>` and `<script>` tags in `index.html` matters:
later CSS files override earlier ones, and each script can only use what
was loaded before it ran. `main.js` must stay last.

## Common edits

| To change… | Edit |
| --- | --- |
| Any text, project, skill or timeline entry | `index.html` |
| Where form messages are sent | `CONTACT_EMAIL` at the top of `js/page/contact-form.js` |
| Email shown on the page | the `mailto:` links in `index.html` |
| LinkedIn / GitHub links | replace `href="#"` and remove `data-todo` on those links in `index.html` |
| Colours or fonts | the `:root` block at the top of `css/base.css` |
| Boot-screen lines | `BOOT_TASKS` / `BOOT_PROJECTS` in `js/boot-screen.js` |
| A project's diagram | its file in `js/diagrams/` |

## Contact form

The form posts to FormSubmit, so messages go straight to `CONTACT_EMAIL`.
After the site is online, submit it once and click the activation link that
FormSubmit emails to you. Messages arrive after that.
