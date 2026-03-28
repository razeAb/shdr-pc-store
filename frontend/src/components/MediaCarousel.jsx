import React, { useState } from "react";
import { useLang } from "../context/LangContext.jsx";

export function MediaCarousel({ media = [] }) {
  const items = Array.isArray(media) ? media : [];
  const [activeIndex, setActiveIndex] = useState(0);
  const active = items[activeIndex] || "";
  const { t } = useLang();

  if (!items.length) {
    return (
      <div className="flex h-40 w-full items-center justify-center rounded-2xl border border-dashed border-white/20 text-xs text-white/60">
        {t({ en: "No media", he: "אין מדיה" })}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="h-44 w-full overflow-hidden rounded-2xl border border-white/10 bg-black/20">
        {active && (
          <img src={active} alt={t({ en: "Preview", he: "תצוגה מקדימה" })} className="h-full w-full object-cover" />
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {items.map((src, index) => (
          <button
            key={`${src}-${index}`}
            type="button"
            onClick={() => setActiveIndex(index)}
            className={`h-12 w-12 rounded-xl border ${index === activeIndex ? "border-ember" : "border-white/10"}`}
          >
            <img src={src} alt={t({ en: "Thumb", he: "תמונה ממוזערת" })} className="h-full w-full rounded-xl object-cover" />
          </button>
        ))}
      </div>
    </div>
  );
}
