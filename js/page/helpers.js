/**
 * Tiny helpers shared by the page scripts.
 */

/** True when the visitor asked their system for less motion. */
const prefersReducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

/** First element matching `selector` (inside `root`, default the whole page). */
const $ = (selector, root = document) => root.querySelector(selector);

/** All elements matching `selector`, as a normal array. */
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
