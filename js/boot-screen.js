/**
 * The retro terminal "boot" intro shown before the hero.
 * Edit BOOT_TASKS / BOOT_PROJECTS to change the lines it prints.
 * runBootScreen(bootEl) resolves when the animation ends or the visitor skips it.
 */

const BOOT_TASKS = [
  ["resolving maven dependencies", 142, (progress) => `${(progress * 38.4).toFixed(1)} MB`],
  ["starting spring boot services", 9, (progress) => `${Math.round(progress * 1840)} ms`],
  ["connecting kafka brokers", 3, (progress) => `${Math.round(progress * 212)} ms`],
  ["submitting flink jobs", 4, (progress) => `${Math.round(progress * 640)} ms`],
  ["migrating postgres schema", 37, (progress) => `v${Math.round(progress * 37)}`],
  ["loading yolo weights", 6, (progress) => `${(progress * 64.2).toFixed(1)} MB`],
  ["indexing lucene documents", 2048, (progress) => `${(progress * 12.7).toFixed(1)} MB`],
  ["compiling webgl shaders", 2, (progress) => `${Math.round(progress * 96)} ms`],
];
const BOOT_PROJECTS = ["AWARE", "KAVACH", "WISE-FLOW", "STANLEY", "MOOVE"];
const BOOT_BAR_WIDTH = 10;
const dotLeader = (label, width) => `${label} ${".".repeat(Math.max(3, width - label.length - 1))}`;
const padLeft = (value, width) => String(value).padStart(width, " ");
function supportsWebGL() {
  try {
    const canvas = document.createElement("canvas");
    return !!(canvas.getContext("webgl2") || canvas.getContext("webgl"));
  } catch {
    return false;
  }
}
function runBootScreen(bootEl) {
  return new Promise((resolve) => {
    const screen = bootEl.querySelector(".boot__screen");
    if (matchMedia("(pointer: coarse)").matches) {
      bootEl.querySelector(".boot__skip").textContent = "tap to skip";
    }
    const columns = matchMedia("(max-width: 640px)").matches ? 31 : 34;
    screen.style.setProperty("--w", `${columns}ch`);
    const memory = navigator.deviceMemory ? `${navigator.deviceMemory * 1024}M` : "8192M";
    const cpus = navigator.hardwareConcurrency || 8;
    const addLine = (html, className = "") => {
      const line = document.createElement("div");
      line.className = `boot__l ${className}`;
      line.innerHTML = html;
      screen.appendChild(line);
      return line;
    };
    addLine(
      "PRADEEP OS 6.2 &nbsp;·&nbsp; TTY1 &nbsp;·&nbsp; (C) 2020&ndash;2026 M. SAI PRADEEP REDDY",
      "is-dim",
    );
    addLine(
      `JVM 21 OK &nbsp;·&nbsp; PY 3.12 OK &nbsp;·&nbsp; GPU WEBGL ${supportsWebGL() ? "OK" : "N/A"} &nbsp;·&nbsp; CPU ${cpus} &nbsp;·&nbsp; MEM ${memory} OK`,
      "is-dim",
    );
    const taskRows = BOOT_TASKS.map(([label, total, extra]) => {
      const line = addLine(
        `<span class="c-label">${dotLeader(label, columns)}</span><span class="c-n"></span><span class="c-bar"></span><span class="c-x"></span>`,
        "is-row",
      );
      line.style.visibility = "hidden";
      return {
        el: line,
        label,
        total,
        extra,
        n: line.querySelector(".c-n"),
        bar: line.querySelector(".c-bar"),
        x: line.querySelector(".c-x"),
      };
    });
    const projectRows = BOOT_PROJECTS.map((name) => {
      const line = addLine(
        `<span class="c-label">${dotLeader(`warming ${name}`, columns)}</span><span class="c-ok"></span>`,
        "is-row",
      );
      line.style.visibility = "hidden";
      return line;
    });
    const promptLine = addLine(
      '<span class="c-user">pradeep@hyd</span>:<span class="c-path">~/portfolio</span>$ <span class="c-cmd"></span><i class="boot__caret"></i>',
      "is-prompt",
    );
    promptLine.style.visibility = "hidden";
    const timeline = gsap.timeline({ onComplete: () => finish() });
    const renderTask = (task, progress) => {
      const done = Math.round(progress * task.total);
      const filled = Math.round(progress * BOOT_BAR_WIDTH);
      task.n.textContent = `${padLeft(done, String(task.total).length)}/${task.total}`;
      task.bar.textContent = `[${"#".repeat(filled)}${" ".repeat(BOOT_BAR_WIDTH - filled)}]`;
      task.x.textContent = task.extra(progress);
      if (progress >= 1) {
        task.el.classList.add("is-done");
      }
    };
    taskRows.forEach((task, index) => {
      const state = { p: 0 };
      const start = 0.3 + index * 0.24;
      timeline
        .set(task.el, { visibility: "visible" }, start)
        .call(() => renderTask(task, 0), null, start)
        .to(
          state,
          {
            p: 1,
            duration: 0.7 + (index % 3) * 0.3,
            ease: "power1.inOut",
            onUpdate: () => renderTask(task, state.p),
          },
          start,
        );
    });
    const projectsStart = timeline.duration() - 0.3;
    projectRows.forEach((line, index) => {
      timeline
        .set(line, { visibility: "visible" }, projectsStart + index * 0.16)
        .call(
          () => (line.querySelector(".c-ok").textContent = "OK"),
          null,
          projectsStart + index * 0.16 + 0.34,
        );
    });
    const typing = { n: 0 };
    timeline
      .set(promptLine, { visibility: "visible" }, "+=0.25")
      .to(typing, {
        n: 20,
        duration: 0.7,
        ease: "none",
        onUpdate: () =>
          (promptLine.querySelector(".c-cmd").textContent = "./launch --portfolio".slice(
            0,
            Math.round(typing.n),
          )),
      })
      .to({}, { duration: 0.35 });
    let skipped = false;
    const skip = () => {
      if (!skipped) {
        skipped = true;
        timeline.progress(1);
      }
    };
    addEventListener("keydown", skip, { once: true });
    bootEl.addEventListener("pointerdown", skip, { once: true });
    addEventListener("wheel", skip, { once: true, passive: true });
    function finish() {
      removeEventListener("keydown", skip);
      removeEventListener("wheel", skip);
      gsap
        .timeline({
          onComplete: () => {
            bootEl.remove();
            resolve();
          },
        })
        .to(bootEl, { "--flash": 1, duration: 0.08 })
        .to(
          screen,
          { scaleY: 0.004, scaleX: 1, filter: "brightness(3)", duration: 0.28, ease: "power2.in" },
          "<",
        )
        .to(screen, { scaleX: 0, duration: 0.22, ease: "power3.in" })
        .to(bootEl, { opacity: 0, duration: 0.35 }, "-=0.05");
    }
  });
}
