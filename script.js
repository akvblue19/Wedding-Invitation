(() => {
  const header = document.querySelector(".topbar");
  const menuButton = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".navigation");
  const navLinks = [...document.querySelectorAll(".nav-link")];
  const sections = [...document.querySelectorAll("main section[id]")];
  const rsvpDialog = document.querySelector(".rsvp-dialog");
  const form = document.querySelector("#rsvp-form");
  const success = document.querySelector(".form-success");
  const music = document.querySelector("#wedding-music");
  const musicButton = document.querySelector(".music-toggle");
  const musicLabel = musicButton.querySelector(".music-label");
  const musicPrompt = document.querySelector(".music-prompt");
  const musicPromptButton = musicPrompt.querySelector(".music-prompt-button");

  const updateMusicControl = playing => {
    musicButton.setAttribute("aria-pressed", String(playing));
    musicButton.setAttribute("aria-label", `${playing ? "Pause" : "Play"} background music`);
    musicLabel.textContent = playing ? "Pause music" : "Play music";
  };
  musicButton.addEventListener("click", async () => {
    if (music.paused) {
      try {
        await music.play();
        updateMusicControl(true);
      } catch {
        updateMusicControl(false);
      }
    } else {
      music.pause();
      updateMusicControl(false);
    }
  });
  musicPromptButton.addEventListener("click", async () => {
    try {
      await music.play();
      updateMusicControl(true);
      musicPrompt.classList.add("is-hidden");
    } catch {
      updateMusicControl(false);
    }
  });
  music.addEventListener("pause", () => updateMusicControl(false));
  music.addEventListener("play", () => updateMusicControl(true));

  if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.querySelectorAll(".falling-petals").forEach(layer => {
      const colors = ["#c44e5b", "#dc7f8a", "#bd463f", "#d39a45"];
      for (let i = 0; i < 18; i += 1) {
        const heart = i % 3 === 0;
        const particle = document.createElement("span");
        particle.className = heart ? "falling-heart" : "falling-petal";
        if (heart) particle.textContent = "♥";
        const duration = 13 + Math.random() * 9;
        particle.style.setProperty("--left", `${Math.random() * 100}%`);
        particle.style.setProperty("--size", `${heart ? 17 + Math.random() * 6 : 8 + Math.random() * 6}px`);
        particle.style.setProperty("--duration", `${duration}s`);
        particle.style.setProperty("--delay", `${-Math.random() * duration}s`);
        particle.style.setProperty("--drift", `${Math.round((Math.random() - .5) * 110)}px`);
        particle.style.setProperty("--fall", `${layer.parentElement.offsetHeight + 45}px`);
        particle.style.setProperty("--particle-color", colors[Math.floor(Math.random() * colors.length)]);
        layer.append(particle);
      }
    });
  }

  // Count down to the wedding date in India Standard Time; no event time was provided.
  const weddingTime = new Date("2026-12-02T00:00:00+05:30").getTime();
  const paintCountdown = () => {
    const left = Math.max(0, weddingTime - Date.now());
    const total = Math.floor(left / 1000);
    document.querySelector("#count-days").textContent = String(Math.floor(total / 86400)).padStart(2, "0");
    document.querySelector("#count-hours").textContent = String(Math.floor((total % 86400) / 3600)).padStart(2, "0");
    document.querySelector("#count-minutes").textContent = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
  };
  paintCountdown();
  window.setInterval(paintCountdown, 60_000);

  const closeMenu = () => {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
  };
  menuButton.addEventListener("click", () => {
    const isOpen = menuButton.getAttribute("aria-expanded") === "true";
    menuButton.setAttribute("aria-expanded", String(!isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Open navigation" : "Close navigation");
    navigation.classList.toggle("is-open", !isOpen);
  });
  navLinks.forEach(link => link.addEventListener("click", closeMenu));
  document.addEventListener("keydown", event => { if (event.key === "Escape") closeMenu(); });

  const updateHeader = () => header.classList.toggle("scrolled", window.scrollY > 50);
  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -28px 0px" });
    document.querySelectorAll(".reveal").forEach(element => revealObserver.observe(element));

    const sectionObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const current = entry.target.id;
        navLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === `#${current}`));
      });
    }, { rootMargin: "-35% 0px -55% 0px" });
    sections.forEach(section => sectionObserver.observe(section));
  } else {
    document.querySelectorAll(".reveal").forEach(element => element.classList.add("is-visible"));
  }

  document.querySelectorAll(".event-image").forEach(button => button.addEventListener("click", () => {
    const card = button.closest(".event-card");
    const expanded = card.classList.toggle("is-expanded");
    button.setAttribute("aria-expanded", String(expanded));
    card.querySelector(".event-note").setAttribute("aria-hidden", String(!expanded));
  }));

  document.querySelector(".dialog-close").addEventListener("click", () => rsvpDialog.close());
  document.querySelector(".success-close").addEventListener("click", () => rsvpDialog.close());
  rsvpDialog.addEventListener("click", event => { if (event.target === rsvpDialog) rsvpDialog.close(); });

  form.addEventListener("submit", event => {
    event.preventDefault();
    const reply = Object.fromEntries(new FormData(form).entries());
    reply.savedAt = new Date().toISOString();
    try {
      const replies = JSON.parse(localStorage.getItem("ankit-gautami-rsvps") || "[]");
      replies.push(reply);
      localStorage.setItem("ankit-gautami-rsvps", JSON.stringify(replies));
    } catch (error) {
      console.warn("RSVP saved only for this session.", error);
    }
    form.hidden = true;
    document.querySelector(".form-privacy").hidden = true;
    success.hidden = false;
  });
})();
