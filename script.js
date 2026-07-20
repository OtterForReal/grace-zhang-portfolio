const header = document.querySelector("[data-header]");
const navToggle = document.querySelector(".nav-toggle");
const navLinks = [...document.querySelectorAll(".site-nav a")];
const revealItems = [...document.querySelectorAll(".reveal")];
const filters = [...document.querySelectorAll(".filter")];
const projectCards = [...document.querySelectorAll(".project-card")];
const cursor = document.querySelector(".cursor-dot");

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
    projectCards.forEach((card) => {
      const categories = card.dataset.category.split(" ");
      card.classList.toggle("is-hidden", selected !== "all" && !categories.includes(selected));
    });
  });
});

document.querySelectorAll("[data-tilt]").forEach((card) => {
  card.addEventListener("pointermove", (event) => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;

    card.style.transform = `perspective(900px) rotateX(${y * -5}deg) rotateY(${x * 5}deg)`;
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
