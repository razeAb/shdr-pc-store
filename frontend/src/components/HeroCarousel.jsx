import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLang } from "../context/LangContext.jsx";
import { formatCurrency } from "../utils/format.js";

// Fallback promo config, used only until real products are available (e.g.
// first paint before the catalog loads). Shape: { id, image, link, alt }.
const DEFAULT_SLIDES = [
  { id: "slide-1", image: "/images/hero-1.svg", link: "/search?category=PC%20Gaming", alt: { en: "PC Gaming deals", he: "מבצעים לגיימינג במחשב" } },
  { id: "slide-2", image: "/images/hero-2.svg", link: "/search?category=PlayStation", alt: { en: "PlayStation lineup", he: "מגוון פלייסטיישן" } },
  { id: "slide-3", image: "/images/hero-3.svg", link: "/search?category=Xbox", alt: { en: "Xbox lineup", he: "מגוון אקסבוקס" } }
];

const STORAGE_KEY = "shdr-carousel-paused";

export default function HeroCarousel({ slides }) {
  const { t } = useLang();
  const activeSlides = slides && slides.length > 0 ? slides : DEFAULT_SLIDES;
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
      setActiveIndex((prev) => (prev + 1) % activeSlides.length);
    }, 6000);
    return () => window.clearInterval(intervalRef.current);
  }, [isAutoPlay, activeSlides.length]);

  const goToSlide = (nextIndex) => {
    const index = (nextIndex + activeSlides.length) % activeSlides.length;
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
      aria-label={t({ en: "Featured games", he: "משחקים מומלצים" })}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsPointerInside(true)}
      onMouseLeave={() => setIsPointerInside(false)}
      onFocusCapture={() => setIsFocusInside(true)}
      onBlurCapture={handleBlurCapture}
      ref={carouselRef}
    >
      <div className="carousel-track">
        {activeSlides.map((slide, index) => (
          <article
            key={slide.id}
            className={`carousel-slide ${index === activeIndex ? "is-active" : ""}`}
            aria-roledescription="slide"
            aria-label={t({ en: `${index + 1} of ${activeSlides.length}`, he: `${index + 1} מתוך ${activeSlides.length}` })}
            aria-hidden={index !== activeIndex}
          >
            {slide.link ? (
              <Link className="slide-art slide-art--linked" to={slide.link} tabIndex={index === activeIndex ? 0 : -1}>
                <img
                  src={slide.image}
                  alt={t(slide.alt) || ""}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchpriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                />
                {slide.title ? (
                  <div className="slide-overlay">
                    {slide.eyebrow ? <p className="eyebrow">{t(slide.eyebrow)}</p> : null}
                    <h2 className="slide-overlay__title">{slide.title}</h2>
                    {Number.isFinite(slide.price) ? (
                      <p className="slide-overlay__price">{formatCurrency(slide.price, "ILS")}</p>
                    ) : null}
                    <span className="primary-button slide-overlay__cta">
                      {t({ en: "Shop Now", he: "לקנייה" })}
                    </span>
                  </div>
                ) : null}
              </Link>
            ) : (
              <div className="slide-art">
                <img
                  src={slide.image}
                  alt={t(slide.alt) || ""}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchpriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                />
              </div>
            )}
          </article>
        ))}
      </div>

      <div className="carousel-controls">
        <button
          type="button"
          className="icon-button"
          onClick={() => goToSlide(activeIndex - 1)}
          aria-label={t({ en: "Previous slide", he: "שקופית קודמת" })}
        >
          <span aria-hidden="true">{t({ en: "Prev", he: "קודם" })}</span>
        </button>
        <div className="carousel-dots" role="tablist" aria-label={t({ en: "Slide dots", he: "ניווט שקופיות" })}>
          {activeSlides.map((slide, index) => (
            <button
              key={slide.id}
              type="button"
              className={`dot ${index === activeIndex ? "is-active" : ""}`}
              onClick={() => goToSlide(index)}
              aria-label={t({ en: `Go to slide ${index + 1}`, he: `מעבר לשקופית ${index + 1}` })}
              aria-pressed={index === activeIndex}
            />
          ))}
        </div>
        <button
          type="button"
          className="icon-button"
          onClick={() => goToSlide(activeIndex + 1)}
          aria-label={t({ en: "Next slide", he: "שקופית הבאה" })}
        >
          <span aria-hidden="true">{t({ en: "Next", he: "הבא" })}</span>
        </button>
        <button
          type="button"
          className="secondary-button pause-toggle"
          onClick={() => setIsUserPaused((prev) => !prev)}
          aria-pressed={isUserPaused}
        >
          {isUserPaused ? t({ en: "Play", he: "נגן" }) : t({ en: "Pause", he: "השהה" })}
        </button>
      </div>
    </section>
  );
}
