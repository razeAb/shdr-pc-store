import { useEffect, useRef, useState } from "react";

const slides = [
  {
    id: "slide-1",
    title: "Cyberpunk 2077",
    description: "A neon-soaked open-world RPG packed with choices.",
    cta: "Shop Now",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg"
  },
  {
    id: "slide-2",
    title: "Elden Ring",
    description: "Forge a path through the Lands Between.",
    cta: "Pre-order",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1245620/header.jpg"
  },
  {
    id: "slide-3",
    title: "Baldur's Gate 3",
    description: "Lead your party through a legendary fantasy campaign.",
    cta: "View Deal",
    image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1086940/header.jpg"
  }
];

const STORAGE_KEY = "shdr-carousel-paused";

export default function HeroCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPointerInside, setIsPointerInside] = useState(false);
  const [isFocusInside, setIsFocusInside] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) ?? false;
    } catch {
      return false;
    }
  });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const carouselRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);
    const handler = (event) => setPrefersReducedMotion(event.matches);
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handler);
      return () => mediaQuery.removeEventListener("change", handler);
    }
    mediaQuery.addListener(handler);
    return () => mediaQuery.removeListener(handler);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(isUserPaused));
  }, [isUserPaused]);

  const isInteracting = isPointerInside || isFocusInside;
  const isAutoPlay = !prefersReducedMotion && !isUserPaused && !isInteracting;

  useEffect(() => {
    if (!isAutoPlay) {
      window.clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => window.clearInterval(intervalRef.current);
  }, [isAutoPlay]);

  const goToSlide = (nextIndex) => {
    const index = (nextIndex + slides.length) % slides.length;
    setActiveIndex(index);
  };

  const handleBlurCapture = (event) => {
    if (!carouselRef.current?.contains(event.relatedTarget)) {
      setIsFocusInside(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToSlide(activeIndex + 1);
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToSlide(activeIndex - 1);
    }
  };

  return (
    <section
      className="hero-carousel"
      aria-roledescription="carousel"
      aria-label="Featured games"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPointerInside(true)}
      onMouseLeave={() => setIsPointerInside(false)}
      onFocusCapture={() => setIsFocusInside(true)}
      onBlurCapture={handleBlurCapture}
      ref={carouselRef}
    >
      <div className="carousel-track">
        {slides.map((slide, index) => (
          <article
            key={slide.id}
            className={`carousel-slide ${index === activeIndex ? "is-active" : ""}`}
            aria-roledescription="slide"
            aria-label={`${index + 1} of ${slides.length}`}
            aria-hidden={index !== activeIndex}
          >
            <div className="slide-content">
              <p className="eyebrow">Featured Drop</p>
              <h1>{slide.title}</h1>
              <p className="slide-description">{slide.description}</p>
              <button type="button" className="primary-button">
                {slide.cta}
              </button>
            </div>
            <div className="slide-art">
              {/* Hero images should use fetchpriority="high" when shipped to production. */}
              <img
                src={slide.image}
                alt={`${slide.title} key art`}
                loading={index === 0 ? "eager" : "lazy"}
                fetchpriority={index === 0 ? "high" : "auto"}
                decoding="async"
              />
            </div>
          </article>
        ))}
      </div>

      <div className="carousel-controls">
        <button
          type="button"
          className="icon-button"
          onClick={() => goToSlide(activeIndex - 1)}
          aria-label="Previous slide"
        >
          <span aria-hidden="true">Prev</span>
        </button>
        <div className="carousel-dots" role="tablist" aria-label="Slide dots">
          {slides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`dot ${index === activeIndex ? "is-active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
              aria-pressed={index === activeIndex}
            />
          ))}
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={() => goToSlide(activeIndex + 1)}
          aria-label="Next slide"
        >
          <span aria-hidden="true">Next</span>
        </button>
        <button
          type="button"
          className="secondary-button pause-toggle"
          onClick={() => setIsUserPaused((prev) => !prev)}
          aria-pressed={isUserPaused}
        >
          {isUserPaused ? "Play" : "Pause"}
        </button>
      </div>
    </section>
  );
}
