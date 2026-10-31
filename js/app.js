
(() => {
  // =====================================
  // МЕНЮ
  // =====================================

  const navToggle = document.querySelector(".nav-toggle");
  const nav = document.querySelector(".site-nav");

  const closeNav = () => {
    nav?.classList.remove("is-open");
    navToggle?.setAttribute("aria-expanded", "false");
    navToggle?.setAttribute("aria-label", "Відкрити меню");
  };

  navToggle?.addEventListener("click", () => {
    const open = navToggle.getAttribute("aria-expanded") !== "true";

    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute(
      "aria-label",
      open ? "Закрити меню" : "Відкрити меню"
    );

    nav?.classList.toggle("is-open", open);
  });

  nav?.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeNav);
  });


  // =====================================
  // ГАЛЕРЕЯ
  // =====================================

  const photos = [
    "img/photo1.jpg",
    "img/photo2.jpg",
    "img/photo3.jpg",
    "img/photo4.jpg"
  ];

  let currentPhoto = 0;

  const galleryPhoto = document.querySelector("#gallery-photo");
  const nextButton = document.querySelector(".next-btn");
  const prevButton = document.querySelector(".prev-btn");

  const showPhoto = (index) => {
    if (!galleryPhoto || photos.length === 0) return;

    currentPhoto = (index + photos.length) % photos.length;
    galleryPhoto.src = photos[currentPhoto];
  };

  nextButton?.addEventListener("click", () => {
    showPhoto(currentPhoto + 1);
  });

  prevButton?.addEventListener("click", () => {
    showPhoto(currentPhoto - 1);
  });


  // =====================================
  // АУДІОПЛЕЄР
  // =====================================

  const player = document.querySelector(".player");
  const playBtn = document.querySelector(".player-play");
  const progress = document.querySelector(".progress");
  const volume = document.querySelector(".volume");
  const timeCurrent = document.querySelector(".time-current");
  const timeTotal = document.querySelector(".time-total");
  const playerState = document.querySelector(".player-state");

  // Якщо аудіоплеєра немає на сторінці, пропускаємо його код
  if (
    player &&
    playBtn &&
    progress &&
    volume &&
    timeCurrent &&
    timeTotal &&
    playerState
  ) {
    const AudioContextClass =
      window.AudioContext || window.webkitAudioContext;

    if (AudioContextClass) {
      const audioCtx = new AudioContextClass();

      const master = audioCtx.createGain();
      master.gain.value = Number(volume.value);
      master.connect(audioCtx.destination);

      const notes = [196, 247, 294, 330, 392, 330, 294, 247];
      const duration = notes.length * 1.5;

      let playing = false;
      let startedAt = 0;
      let offset = 0;
      let timer = 0;
      let sources = [];

      const format = (value) => {
        const minutes = Math.floor(value / 60);
        const seconds = Math.floor(value % 60)
          .toString()
          .padStart(2, "0");

        return `${minutes}:${seconds}`;
      };

      timeTotal.textContent = format(duration);

      const stopVoices = () => {
        sources.forEach((source) => {
          try {
            source.stop();
          } catch {
            // Джерело вже зупинене
          }
        });

        sources = [];
      };

      const schedule = (from = 0) => {
        stopVoices();

        notes.forEach((freq, index) => {
          const start = index * 1.5;
          const end = start + 1.35;

          if (end <= from) return;

          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();

          osc.type = "triangle";
          osc.frequency.value = freq;

          const when =
            audioCtx.currentTime + Math.max(0, start - from);

          const release =
            audioCtx.currentTime + Math.max(0.05, end - from);

          gain.gain.setValueAtTime(0.0001, when);
          gain.gain.exponentialRampToValueAtTime(0.08, when + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, release);

          osc.connect(gain);
          gain.connect(master);

          osc.start(when);
          osc.stop(release + 0.02);

          sources.push(osc);
        });
      };

      const renderTime = () => {
        const elapsed = playing
          ? Math.min(
              duration,
              offset + (audioCtx.currentTime - startedAt)
            )
          : offset;

        progress.value = String((elapsed / duration) * 100);
        timeCurrent.textContent = format(elapsed);

        if (elapsed >= duration) {
          playing = false;
          offset = 0;

          player.classList.remove("is-playing");
          playBtn.setAttribute("aria-label", "Відтворити мелодію");
          playerState.textContent =
            "Мелодія завершилась. Можна увімкнути ще раз.";

          stopVoices();
          window.clearInterval(timer);
        }
      };

      const play = async () => {
        if (audioCtx.state === "suspended") {
          await audioCtx.resume();
        }

        if (offset >= duration) offset = 0;

        schedule(offset);

        startedAt = audioCtx.currentTime;
        playing = true;

        player.classList.add("is-playing");
        playBtn.setAttribute("aria-label", "Пауза");
        playerState.textContent = "Зараз звучить тиха тема";

        window.clearInterval(timer);
        timer = window.setInterval(renderTime, 120);
      };

      const pause = () => {
        offset = Math.min(
          duration,
          offset + (audioCtx.currentTime - startedAt)
        );

        playing = false;

        stopVoices();

        player.classList.remove("is-playing");
        playBtn.setAttribute("aria-label", "Відтворити мелодію");
        playerState.textContent = "На паузі";

        window.clearInterval(timer);
        renderTime();
      };

      playBtn.addEventListener("click", () => {
        if (playing) {
          pause();
        } else {
          play();
        }
      });

      progress.addEventListener("input", () => {
        offset = (Number(progress.value) / 100) * duration;

        timeCurrent.textContent = format(offset);

        if (playing) play();
      });

      volume.addEventListener("input", () => {
        master.gain.value = Number(volume.value);
      });
    }
  }
})();
