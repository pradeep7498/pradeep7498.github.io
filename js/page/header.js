/**
 * Header: background appears after scrolling, and the live Hyderabad clock.
 * Uses: ScrollTrigger
 */

function initHeaderBackground() {
  // --hdr-bg is 1 once the page is scrolled past 80px (see css/header.css).
  ScrollTrigger.create({
    start: 80,
    end: "max",
    onToggle: (self) =>
      document.querySelector(".hdr").style.setProperty("--hdr-bg", +!!self.isActive),
  });
}

function initClock() {
  const clockEl = $(".clock");
  const clockFormat = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  });
  const updateClock = () => (clockEl.textContent = clockFormat.format(new Date()));
  updateClock();
  setInterval(updateClock, 15000);
}
