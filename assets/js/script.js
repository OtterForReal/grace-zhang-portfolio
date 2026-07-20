const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const revealItems = [...document.querySelectorAll(".reveal")];
const filters = [...document.querySelectorAll(".filter")];
const projectRows = [...document.querySelectorAll(".case-card")];
const notes = [...document.querySelectorAll(".note")];
const cursor = document.querySelector(".cursor-dot");
const canvas = document.querySelector("[data-signal-canvas]");
const currentPage = document.body.dataset.page;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const setScrolledHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 12);
};

setScrolledHeader();
window.addEventListener("scroll", setScrolledHeader, { passive: true });

if (currentPage) {
  navLinks.forEach((link) => {
    link.classList.toggle("active", link.dataset.page === currentPage);
  });
}

navToggle.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close navigation" : "Open navigation");
});

navLinks.forEach((link) => {
  link.addEventListener("click", () => {
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.16 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const hashNavLinks = navLinks.filter((link) => link.getAttribute("href")?.startsWith("#"));

if (hashNavLinks.length) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        hashNavLinks.forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );

  document.querySelectorAll("main section[id]").forEach((section) => {
    sectionObserver.observe(section);
  });
}

filters.forEach((filter) => {
  filter.addEventListener("click", () => {
    const selected = filter.dataset.filter;

    filters.forEach((item) => item.classList.toggle("active", item === filter));
    projectRows.forEach((row) => {
      const categories = row.dataset.category.split(" ");
      row.classList.toggle("is-hidden", selected !== "all" && !categories.includes(selected));
    });
  });
});

notes.forEach((note) => {
  note.addEventListener("click", () => {
    notes.forEach((item) => item.classList.toggle("active", item === note));
  });
});

document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.transform = `perspective(900px) rotateX(${y * -4}deg) rotateY(${x * 4}deg)`;
  });

  card.addEventListener("pointerleave", () => {
    card.style.transform = "";
  });
});

document.querySelectorAll(".magnetic").forEach((item) => {
  item.addEventListener("pointermove", (event) => {
    const rect = item.getBoundingClientRect();
    const x = event.clientX - rect.left - rect.width / 2;
    const y = event.clientY - rect.top - rect.height / 2;
    item.style.transform = `translate(${x * 0.08}px, ${y * 0.12}px)`;
  });

  item.addEventListener("pointerleave", () => {
    item.style.transform = "";
  });
});

window.addEventListener(
  "pointermove",
  (event) => {
    if (!cursor) return;
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;
  },
  { passive: true }
);

if (!prefersReducedMotion) {
  let lastInkBloom = 0;

  const bloomInk = (event, force = false) => {
    const now = performance.now();
    if (!force && now - lastInkBloom < 260) return;
    lastInkBloom = now;

    const bloom = document.createElement("span");
    bloom.className = "ink-wash is-visible";
    bloom.style.setProperty("--ink-x", `${event.clientX}px`);
    bloom.style.setProperty("--ink-y", `${event.clientY}px`);
    bloom.style.setProperty("--ink-rotate", `${Math.round(Math.random() * 80 - 40)}deg`);
    bloom.style.setProperty("--ink-size", `${Math.round(150 + Math.random() * 90)}px`);
    document.body.appendChild(bloom);
    bloom.addEventListener("animationend", () => bloom.remove(), { once: true });
  };

  document.querySelectorAll(".case-card, .button, .note, .contact-link, .timeline-item").forEach((item) => {
    item.addEventListener("pointerenter", (event) => bloomInk(event, true));
  });

  window.addEventListener("click", (event) => bloomInk(event, true));
}

if (canvas && !prefersReducedMotion) {
  const ctx = canvas.getContext("2d");
  const colors = ["#d4e5ef", "#8ba3c7", "#003d6f", "#19325f", "#45475e"];
  const points = Array.from({ length: 22 }, (_, index) => ({
    angle: (Math.PI * 2 * index) / 18,
    color: colors[index % colors.length],
    drift: 0.42 + (index % 5) * 0.06,
    radius: 58 + (index % 7) * 18,
  }));

  const draw = (time = 0) => {
    const rect = canvas.getBoundingClientRect();
    const scale = window.devicePixelRatio || 1;

    if (canvas.width !== Math.floor(rect.width * scale)) {
      canvas.width = Math.floor(rect.width * scale);
      canvas.height = Math.floor(rect.height * scale);
    }

    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.clearRect(0, 0, rect.width, rect.height);

    const centerX = rect.width * 0.52;
    const centerY = rect.height * 0.38;
    const activeIndex = Math.max(0, notes.findIndex((note) => note.classList.contains("active")));

    const wash = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, rect.width * 0.58);
    wash.addColorStop(0, "rgba(212, 229, 239, 0.58)");
    wash.addColorStop(0.48, "rgba(139, 163, 199, 0.22)");
    wash.addColorStop(1, "rgba(25, 50, 95, 0)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, 0, rect.width, rect.height);

    points.forEach((point, index) => {
      const orbit = point.radius + activeIndex * 18;
      const x = centerX + Math.cos(point.angle + time * 0.00028 * point.drift) * orbit;
      const y = centerY + Math.sin(point.angle + time * 0.00032 * point.drift) * orbit * 0.68;
      const next = points[(index + activeIndex + 3) % points.length];
      const nextX = centerX + Math.cos(next.angle + time * 0.00028 * next.drift) * next.radius;
      const nextY = centerY + Math.sin(next.angle + time * 0.00032 * next.drift) * next.radius * 0.68;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nextX, nextY);
      ctx.strokeStyle = "rgba(25, 50, 95, 0.08)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, index % 4 === activeIndex ? 12 : 8, 0, Math.PI * 2);
      ctx.fillStyle = point.color;
      ctx.shadowColor = point.color;
      ctx.shadowBlur = index % 4 === activeIndex ? 22 : 14;
      ctx.globalAlpha = index % 4 === activeIndex ? 0.55 : 0.28;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    });

    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
}
