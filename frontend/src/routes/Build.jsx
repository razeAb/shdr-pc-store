import { Link, useOutletContext, useSearchParams } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, ChevronLeft, ChevronRight, Cpu, RotateCcw, ShoppingBag, X, Zap } from "lucide-react";
import { useProducts } from "../context/ProductsContext.jsx";
import { OwnerCostToggle, OwnerBuildCost } from "../components/OwnerPurchaseCost.jsx";
import { useCart } from "../context/CartContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import { formatCurrency } from "../utils/format.js";
import { ATTRIBUTE_VALUE_LABELS, getShortTitle } from "../utils/products.js";
import {
  BUILD_STEPS,
  PLATFORMS,
  STEP_FACTS,
  getAttr,
  getRecommendedWattage,
  getStepOptions,
  isStepRequired,
  pruneIncompatible
} from "../utils/pcBuilder.js";

const STORAGE_KEY = "shdr-pc-build";

// The build is remembered per browser as { platform, stepIndex, partIds }.
const readSavedBuild = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && PLATFORMS[saved.platform]) return saved;
  } catch {
    // Storage unavailable or corrupt: start fresh.
  }
  return { platform: "", stepIndex: 0, partIds: {} };
};

const SORTS = {
  price_asc: (a, b) => a.product.price - b.product.price,
  price_desc: (a, b) => b.product.price - a.product.price
};

export default function Build() {
  const { onToast } = useOutletContext();
  const { products, loading, error } = useProducts();
  const { addItem } = useCart();
  const { t, lang } = useLang();
  const [build, setBuild] = useState(readSavedBuild);
  const [sort, setSort] = useState("price_asc");

  // Links like /build?platform=AMD (home page) skip the platform question.
  // A saved build on the same platform is kept; a different one starts fresh.
  const [searchParams, setSearchParams] = useSearchParams();
  useEffect(() => {
    const requested = searchParams.get("platform");
    if (!requested) return;
    if (PLATFORMS[requested]) {
      setBuild((prev) => (prev.platform === requested ? prev : { platform: requested, stepIndex: 0, partIds: {} }));
    }
    setSearchParams({}, { replace: true });
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(build));
    } catch {
      // Not saved; the build still works for this visit.
    }
  }, [build]);

  // Resolve saved ids to live products (a sold-out part simply drops out).
  const parts = useMemo(() => {
    const byId = new Map(products.map((product) => [product.id, product]));
    return Object.fromEntries(
      Object.entries(build.partIds)
        .map(([key, id]) => [key, byId.get(id)])
        .filter(([, product]) => product)
    );
  }, [products, build.partIds]);

  const { platform, stepIndex } = build;
  const step = BUILD_STEPS[stepIndex];
  const { options, hiddenCount } = useMemo(
    () => (platform ? getStepOptions(products, step, parts, platform) : { options: [], hiddenCount: 0 }),
    [products, step, parts, platform]
  );
  const sortedOptions = useMemo(() => [...options].sort(SORTS[sort]), [options, sort]);

  const total = Object.values(parts).reduce((sum, product) => sum + product.price, 0);
  const missingSteps = BUILD_STEPS.filter(({ key }) => isStepRequired(key, parts) && !parts[key]);
  const recommendedWattage = getRecommendedWattage(parts);
  const Arrow = lang === "he" ? ChevronLeft : ChevronRight;
  const BackArrow = lang === "he" ? ChevronRight : ChevronLeft;

  const stepTitle = (key) => t(BUILD_STEPS.find((item) => item.key === key).title);
  const label = (value) => t(ATTRIBUTE_VALUE_LABELS[value] || { en: value, he: value });

  const goToStep = (index) => setBuild((prev) => ({ ...prev, stepIndex: index }));

  const choosePlatform = (key) => setBuild({ platform: key, stepIndex: 0, partIds: {} });

  const resetBuild = () => setBuild({ platform: "", stepIndex: 0, partIds: {} });

  const selectPart = (product) => {
    const next = { ...parts, [step.key]: product };
    const { parts: kept, removed } = pruneIncompatible(next, platform, step.key);
    if (removed.length) {
      onToast(
        t({
          en: `Removed (no longer compatible): ${removed.map(stepTitle).join(", ")}`,
          he: `הוסרו כי כבר לא תואמים: ${removed.map(stepTitle).join(", ")}`
        })
      );
    }
    setBuild((prev) => ({
      ...prev,
      partIds: Object.fromEntries(Object.entries(kept).map(([key, part]) => [key, part.id])),
      stepIndex: Math.min(prev.stepIndex + 1, BUILD_STEPS.length - 1)
    }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const removePart = (key) =>
    setBuild((prev) => {
      const partIds = { ...prev.partIds };
      delete partIds[key];
      return { ...prev, partIds };
    });

  const addBuildToCart = () => {
    Object.values(parts).forEach((product) => addItem(product));
    onToast(t({ en: "Build added to cart", he: "המחשב נוסף לעגלה" }));
  };

  // ---------------------------------------------------------------- platform
  if (!platform) {
    const cpuCount = (brand) => products.filter((p) => p.productType === "CPU" && p.brand === brand).length;
    return (
      <section className="pc-builder pc-builder--intro" aria-labelledby="builder-title">
        <div className="section-heading">
          <p className="eyebrow">{t({ en: "PC BUILDER", he: "בונה המחשבים" })}</p>
          <h1 id="builder-title">{t({ en: "Build your PC", he: "בנו את המחשב שלכם" })}</h1>
          <p>
            {t({
              en: "Pick a platform and we'll walk you through every part, showing only parts that fit together.",
              he: "בחרו פלטפורמה ונעבור יחד על כל רכיב. נציג רק רכיבים שמתאימים זה לזה."
            })}
          </p>
        </div>
        <h2 className="pc-builder__question">
          {t({ en: "Which platform do you want to build on?", he: "על איזו פלטפורמה תרצו לבנות?" })}
        </h2>
        <div className="pc-builder__platforms">
          {Object.values(PLATFORMS).map((item) => (
            <button
              key={item.key}
              type="button"
              className={`platform-card platform-card--${item.key.toLowerCase()}`}
              onClick={() => choosePlatform(item.key)}
            >
              <span className="platform-card__logo">{item.key}</span>
              <strong>{t(item.title)}</strong>
              <span>{t(item.blurb)}</span>
              <small>{t({ en: `${cpuCount(item.key)} processors in stock`, he: `${cpuCount(item.key)} מעבדים במלאי` })}</small>
            </button>
          ))}
        </div>
        <ol className="pc-builder__how">
          {BUILD_STEPS.map((item, index) => (
            <li key={item.key}>
              <span>{index + 1}</span>
              {t(item.title)}
            </li>
          ))}
        </ol>
      </section>
    );
  }

  // ----------------------------------------------------------------- builder
  const isOptional = !isStepRequired(step.key, parts);
  const facts = STEP_FACTS[step.key];

  return (
    <section className="pc-builder" aria-labelledby="builder-title">
      <div className="pc-builder__top">
        <div>
          <p className="eyebrow">{t({ en: "PC BUILDER", he: "בונה המחשבים" })}</p>
          <h1 id="builder-title">{t(PLATFORMS[platform].title)}</h1>
        </div>
        <button type="button" className="text-button" onClick={resetBuild}>
          <RotateCcw size={14} aria-hidden="true" /> {t({ en: "Start over", he: "התחלה מחדש" })}
        </button>
      </div>

      <ol className="pc-builder__steps">
        {BUILD_STEPS.map((item, index) => {
          const done = Boolean(parts[item.key]);
          return (
            <li key={item.key}>
              <button
                type="button"
                className={`build-step ${index === stepIndex ? "is-active" : ""} ${done ? "is-done" : ""}`}
                onClick={() => goToStep(index)}
                aria-current={index === stepIndex ? "step" : undefined}
              >
                <span className="build-step__num">{done ? <Check size={13} /> : index + 1}</span>
                {t(item.title)}
              </button>
            </li>
          );
        })}
      </ol>

      <div className="pc-builder__layout">
        <div className="pc-builder__main">
          <div className="pc-builder__step-head">
            <div>
              <h2>
                {t(step.title)}
                {isOptional && <span className="build-optional">{t({ en: "Optional", he: "אופציונלי" })}</span>}
              </h2>
              <p className="pc-builder__hint">
                {step.key === "gpu" && isOptional
                  ? t({ en: "Your processor has built-in graphics, so you can skip this.", he: "למעבד שבחרתם יש גרפיקה מובנית, אפשר לדלג על שלב זה." })
                  : step.key === "psu"
                  ? t({ en: `Recommended for this build: ${recommendedWattage}W or more.`, he: `מומלץ למחשב הזה: ${recommendedWattage}W ומעלה.` })
                  : t({ en: "Only parts that fit your build are shown.", he: "מוצגים רק רכיבים שמתאימים למחשב שלכם." })}
                {hiddenCount > 0 && (
                  <> {t({ en: `(${hiddenCount} incompatible hidden)`, he: `(${hiddenCount} לא תואמים הוסתרו)` })}</>
                )}
              </p>
            </div>
            <label className="sort-select">
              <span className="visually-hidden">{t({ en: "Sort by", he: "מיין לפי" })}</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="price_asc">{t({ en: "Price: low to high", he: "מחיר: מהנמוך לגבוה" })}</option>
                <option value="price_desc">{t({ en: "Price: high to low", he: "מחיר: מהגבוה לנמוך" })}</option>
              </select>
            </label>
          </div>

          {loading ? (
            <p>{t({ en: "Loading parts…", he: "טוען רכיבים…" })}</p>
          ) : error ? (
            <p>{t({ en: "Could not load parts.", he: "לא ניתן לטעון רכיבים." })}</p>
          ) : sortedOptions.length === 0 ? (
            <p className="pc-builder__empty">
              {t({
                en: "No compatible parts in stock for this step. Try changing an earlier choice.",
                he: "אין כרגע רכיבים תואמים לשלב זה. נסו לשנות בחירה קודמת."
              })}
            </p>
          ) : (
            <ul className="build-options">
              {sortedOptions.map(({ product, check }) => {
                const isSelected = parts[step.key]?.id === product.id;
                return (
                  <li key={product.id} className={`build-option ${isSelected ? "is-selected" : ""}`}>
                    <Link className="build-option__image" to={`/product/${product.slug}`} target="_blank" rel="noreferrer">
                      <img src={product.image} alt="" loading="lazy" />
                    </Link>
                    <div className="build-option__body">
                      <p className="product-meta">{product.brand}</p>
                      <h3>
                        <Link to={`/product/${product.slug}`} target="_blank" rel="noreferrer" title={product.title}>
                          {getShortTitle(product.title)}
                        </Link>
                      </h3>
                      <div className="build-option__facts">
                        {facts
                          .map((key) => [key, getAttr(product, key)])
                          .filter(([, value]) => value)
                          .map(([key, value]) => (
                            <span key={key}>
                              {key === "cores" ? t({ en: `${value} cores`, he: `${value} ליבות` }) : label(value)}
                            </span>
                          ))}
                        {check.recommended && <span className="is-good">{t(check.note)}</span>}
                      </div>
                      {check.warning && (
                        <p className="build-option__warning">
                          <AlertTriangle size={13} aria-hidden="true" /> {t(check.warning)}
                        </p>
                      )}
                      {check.note && !check.recommended && <p className="build-option__note">{t(check.note)}</p>}
                    </div>
                    <div className="build-option__buy">
                      <span className="price-now">{formatCurrency(product.price, "ILS")}</span>
                      <button
                        type="button"
                        className={isSelected ? "secondary-button" : "primary-button"}
                        onClick={() => selectPart(product)}
                      >
                        {isSelected ? <><Check size={15} /> {t({ en: "Selected", he: "נבחר" })}</> : t({ en: "Select", he: "בחירה" })}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}

          <div className="pc-builder__nav">
            <button type="button" className="secondary-button" onClick={() => goToStep(stepIndex - 1)} disabled={stepIndex === 0}>
              <BackArrow size={16} /> {t({ en: "Back", he: "הקודם" })}
            </button>
            {stepIndex < BUILD_STEPS.length - 1 && (
              <button type="button" className="secondary-button" onClick={() => goToStep(stepIndex + 1)}>
                {isOptional && !parts[step.key] ? t({ en: "Skip", he: "דילוג" }) : t({ en: "Next", he: "הבא" })} <Arrow size={16} />
              </button>
            )}
          </div>
        </div>

        <aside id="build-summary" className="build-summary" aria-label={t({ en: "Your build", he: "המחשב שלכם" })}>
          <h2><Cpu size={18} aria-hidden="true" /> {t({ en: "Your build", he: "המחשב שלכם" })}</h2>
          <ul>
            {BUILD_STEPS.map((item, index) => {
              const part = parts[item.key];
              const required = isStepRequired(item.key, parts);
              return (
                <li key={item.key} className={part ? "is-filled" : ""}>
                  <button type="button" className="build-summary__step" onClick={() => goToStep(index)}>
                    <small>{t(item.title)}</small>
                    <span>
                      {part
                        ? getShortTitle(part.title)
                        : required
                        ? t({ en: "Not selected", he: "לא נבחר" })
                        : t({ en: "Optional", he: "אופציונלי" })}
                    </span>
                  </button>
                  {part && (
                    <>
                      <span className="build-summary__price">{formatCurrency(part.price, "ILS")}</span>
                      <button
                        type="button"
                        className="build-summary__remove"
                        onClick={() => removePart(item.key)}
                        aria-label={t({ en: `Remove ${t(item.title)}`, he: `הסרת ${t(item.title)}` })}
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>

          <div className="build-summary__power">
            <Zap size={15} aria-hidden="true" />
            {t({ en: `Recommended power supply: ${recommendedWattage}W+`, he: `ספק כוח מומלץ: ${recommendedWattage}W ומעלה` })}
          </div>

          <div className="build-summary__total">
            <span>{t({ en: "Total", he: "סה\"כ" })}</span>
            <strong>{formatCurrency(total, "ILS")}</strong>
          </div>

          <OwnerCostToggle />
          <OwnerBuildCost parts={Object.values(parts)} />

          {missingSteps.length > 0 ? (
            <p className="build-summary__status">
              {t({ en: "Still missing: ", he: "חסרים עדיין: " })}
              {missingSteps.map(({ title }) => t(title)).join(", ")}
            </p>
          ) : (
            <p className="build-summary__status is-ok">
              <Check size={14} aria-hidden="true" /> {t({ en: "All parts are compatible", he: "כל הרכיבים תואמים" })}
            </p>
          )}

          <button
            type="button"
            className="primary-button build-summary__cart"
            onClick={addBuildToCart}
            disabled={Object.keys(parts).length === 0}
          >
            <ShoppingBag size={17} aria-hidden="true" />
            {missingSteps.length
              ? t({ en: "Add selected parts to cart", he: "הוספת הרכיבים שנבחרו לעגלה" })
              : t({ en: "Add build to cart", he: "הוספת המחשב לעגלה" })}
          </button>
          <p className="build-summary__fineprint">
            {t({
              en: "Compatibility is checked from manufacturer specs. Not sure? Contact us before ordering.",
              he: "התאימות נבדקת לפי מפרט היצרן. לא בטוחים? צרו איתנו קשר לפני ההזמנה."
            })}
          </p>
        </aside>
      </div>

      <div className="build-mobile-bar">
        <div>
          <small>
            {t({
              en: `${Object.keys(parts).length} of ${BUILD_STEPS.length} parts`,
              he: `${Object.keys(parts).length} מתוך ${BUILD_STEPS.length} רכיבים`
            })}
          </small>
          <strong>{formatCurrency(total, "ILS")}</strong>
        </div>
        <a className="primary-button" href="#build-summary">
          <Cpu size={15} aria-hidden="true" /> {t({ en: "View build", he: "צפייה במחשב" })}
        </a>
      </div>
    </section>
  );
}
