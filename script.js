const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const revealItems = [...document.querySelectorAll(".reveal")];
const filters = [...document.querySelectorAll(".filter")];
const projectRows = [...document.querySelectorAll(".project-row")];
const notes = [...document.querySelectorAll(".note")];
const cursor = document.querySelector(".cursor-dot");
const canvas = document.querySelector("[data-signal-canvas]");

const setScrolledHeader = () => {
  header.classList.toggle("scrolled", window.scrollY > 12);
};

setScrolledHeader();
window.addEventListener("scroll", setScrolledHeader, { passive: true });

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

const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;

      navLinks.forEach((link) => {
        link.classList.toggle("active", link.getAttribute("href") === `#${entry.target.id}`);
      });
    });
  },
  { rootMargin: "-45% 0px -45% 0px" }
);

document.querySelectorAll("main section[id]").forEach((section) => {
  sectionObserver.observe(section);
});

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

if (canvas) {
  const ctx = canvas.getContext("2d");
  const colors = ["#315c8c", "#d36a4b", "#6d8068", "#ead58b"];
  const points = Array.from({ length: 18 }, (_, index) => ({
    angle: (Math.PI * 2 * index) / 18,
    color: colors[index % colors.length],
    drift: 0.65 + (index % 5) * 0.08,
    radius: 74 + (index % 6) * 17,
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
      ctx.strokeStyle = "rgba(25, 26, 30, 0.09)";
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(x, y, index % 4 === activeIndex ? 6.5 : 4.4, 0, Math.PI * 2);
      ctx.fillStyle = point.color;
      ctx.globalAlpha = index % 4 === activeIndex ? 0.95 : 0.52;
      ctx.fill();
      ctx.globalAlpha = 1;
    });

    requestAnimationFrame(draw);
  };

  requestAnimationFrame(draw);
}
