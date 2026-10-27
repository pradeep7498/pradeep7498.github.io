/**
 * Scroll-driven animations: hero parallax, the scroll ruler, the tech band,
 * section headings, the profile text reveal, project entrances and the path line.
 * Skipped entirely when the visitor prefers reduced motion.
 * Uses: gsap, ScrollTrigger, SplitText
 */

function setupScrollAnimations() {
  if (prefersReducedMotion) {
    return;
  }
  gsap.to(".hero__l", {
    xPercent: -18,
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__r", {
    xPercent: 18,
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".hero__frame", {
    scale: 1.5,
    opacity: 0,
    ease: "none",
    scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
  });
  gsap.to(".ruler__cursor", {
    left: "100%",
    ease: "none",
    scrollTrigger: { trigger: document.body, start: "top top", end: "bottom bottom", scrub: true },
  });
  const bandTweens = $$(".band__line").map((line, index) => {
    const direction = index === 0 ? -1 : 1;
    return gsap.fromTo(
      line,
      { xPercent: direction < 0 ? 0 : -50 },
      { xPercent: direction < 0 ? -50 : 0, duration: 46, ease: "none", repeat: -1 },
    );
  });
  ScrollTrigger.create({
    trigger: ".band",
    start: "top bottom",
    end: "bottom top",
    onToggle: (self) =>
      bandTweens.forEach((tween) => (self.isActive ? tween.play() : tween.pause())),
    onUpdate: (self) => {
      const speed = 1 + Math.min(Math.abs(self.getVelocity()) / 400, 6);
      bandTweens.forEach((tween) =>
        gsap.to(tween, {
          timeScale: speed,
          duration: 0.2,
          overwrite: true,
          onComplete: () => gsap.to(tween, { timeScale: 1, duration: 1.2 }),
        }),
      );
    },
  });
  $$(".ch-title").forEach((title) => {
    const split = SplitText.create(title, { type: "chars", charsClass: "ch" });
    gsap.from(split.chars, {
      yPercent: 100,
      opacity: 0,
      rotateX: -70,
      transformOrigin: "50% 100%",
      stagger: 0.025,
      duration: 0.9,
      ease: "expo.out",
      scrollTrigger: { trigger: title, start: "top 85%" },
    });
  });
  $$(".chapter").forEach((chapter) => {
    const head = $(".ch-head", chapter);
    const isMobile = innerWidth < 900;
    gsap
      .timeline({
        scrollTrigger: {
          trigger: chapter,
          start: "top top+=" + (head.offsetTop + 1),
          end: "+=260",
          scrub: 0.4,
        },
      })
      .to($(".ch-title", head), { fontSize: isMobile ? 30 : 44, ease: "none" }, 0)
      .to($(".ch-num", head), { fontSize: isMobile ? 22 : 30, ease: "none" }, 0)
      .to(head, { paddingTop: 10, paddingBottom: 10, ease: "none" }, 0);
  });
  $$(".ch-num").forEach((num) =>
    gsap.from(num, {
      opacity: 0,
      x: -30,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: { trigger: num, start: "top 85%" },
    }),
  );
  const lede = $(".about__lede");
  const ledeWords = SplitText.create(lede, { type: "words", wordsClass: "w" }).words;
  gsap.to(ledeWords, {
    opacity: 1,
    stagger: 0.1,
    ease: "none",
    scrollTrigger: { trigger: lede, start: "top 75%", end: "bottom 45%", scrub: true },
  });
  $$(".proj").forEach((project) => {
    gsap.from($(".proj__head h3", project), {
      yPercent: 40,
      opacity: 0,
      duration: 1,
      ease: "expo.out",
      scrollTrigger: { trigger: project, start: "top 80%" },
    });
    gsap.from($(".proj__viz", project), {
      clipPath: "inset(0 100% 0 0)",
      duration: 1.3,
      ease: "expo.inOut",
      scrollTrigger: { trigger: project, start: "top 70%" },
    });
  });
  gsap.from(".bom__row", {
    opacity: 0,
    x: -24,
    stagger: 0.04,
    duration: 0.7,
    ease: "power3.out",
    scrollTrigger: { trigger: ".bom", start: "top 75%" },
  });
  gsap.to(".path", {
    "--p": 1,
    ease: "none",
    scrollTrigger: { trigger: ".path", start: "top 75%", end: "bottom 55%", scrub: true },
  });
  gsap.from(".contact__big", {
    y: 40,
    opacity: 0,
    duration: 1.1,
    ease: "expo.out",
    scrollTrigger: { trigger: ".contact", start: "top 75%" },
  });
}
