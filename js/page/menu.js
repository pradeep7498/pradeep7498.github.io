/**
 * Full-screen menu opened by the button in the header.
 * Uses: gsap, smoothScroller from smooth-scroll.js
 */

let menu = null;
let menuButton = null;

function initMenu() {
  menu = $("#menu");
  menuButton = $(".hdr__menu");

  menuButton.addEventListener("click", () => (menu.hidden ? openMenu() : closeMenu()));
  addEventListener("keydown", (event) => event.key === "Escape" && closeMenu());

  // Links marked data-todo (LinkedIn, GitHub) have no address yet, so clicks do nothing.
  $$("[data-todo]").forEach((link) =>
    link.addEventListener("click", (event) => event.preventDefault()),
  );
}

function openMenu() {
  menu.hidden = false;
  menuButton.setAttribute("aria-expanded", "true");
  document.body.classList.add("is-locked");
  smoothScroller?.stop();
  gsap.fromTo(
    menu,
    { clipPath: "inset(0 0 100% 0)" },
    { clipPath: "inset(0 0 0% 0)", duration: 0.7, ease: "expo.inOut" },
  );
  gsap.fromTo(
    $$(".menu__list a"),
    { yPercent: 110 },
    { yPercent: 0, duration: 0.8, stagger: 0.05, ease: "expo.out", delay: 0.25 },
  );
  $(".menu__list a").focus({ preventScroll: true });
}

function closeMenu() {
  if (menu.hidden) return;
  menuButton.setAttribute("aria-expanded", "false");
  document.body.classList.remove("is-locked");
  smoothScroller?.start();
  gsap.to(menu, {
    clipPath: "inset(0 0 100% 0)",
    duration: 0.5,
    ease: "expo.in",
    onComplete: () => (menu.hidden = true),
  });
}
