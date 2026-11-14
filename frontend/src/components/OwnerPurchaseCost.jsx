import { Eye, EyeOff } from "lucide-react";
import { useOwnerCosts } from "../context/OwnerCostsContext.jsx";
import { useLang } from "../context/LangContext.jsx";
import { formatCurrency } from "../utils/format.js";

export function OwnerCostToggle() {
  const { isOwner, visible, busy, error, toggle } = useOwnerCosts();
  const { t } = useLang();
  if (!isOwner) return null;
  const Icon = visible ? EyeOff : Eye;
  return <div className="owner-cost-control">
    <button type="button" className="owner-cost-toggle" aria-pressed={visible} disabled={busy} onClick={toggle}>
      <Icon size={16} aria-hidden="true" />
      {t(busy ? { he: "טוען עלויות…", en: "Loading costs…" } : visible ? { he: "הסתר עלויות", en: "Hide costs" } : { he: "הצג עלויות", en: "Show costs" })}
    </button>
    {error && <span role="alert" className="owner-cost-error">{error}</span>}
  </div>;
}

export default function OwnerPurchaseCost({ productId }) {
  const { visible, costs } = useOwnerCosts();
  const { t } = useLang();
  if (!visible) return null;
  const row = costs[productId];
  const cost = row?.purchaseCost;
  return <small className="owner-purchase-cost">
    {t({ he: "עלות שלי:", en: "My cost:" })} {Number.isFinite(cost) ? <>
      {formatCurrency(cost, "ILS")} · {t(row.costIncludesVat ? { he: "כולל מע״מ", en: "VAT included" } : { he: "לפני מע״מ", en: "Before VAT" })}
    </> : t({ he: "לא הוזנה", en: "Not entered" })}
  </small>;
}

// Private totals are derived in memory only and never saved in the cart/build.
export function OwnerBuildCost({ parts }) {
  const { visible, costs } = useOwnerCosts();
  const { t } = useLang();
  if (!visible || parts.length === 0) return null;
  const rows = parts.map(part => costs[part.id]);
  const missing = rows.filter(row => !Number.isFinite(row?.purchaseCost)).length;
  const known = rows.filter(row => Number.isFinite(row?.purchaseCost));
  const included = known.filter(row => row.costIncludesVat);
  const excluded = known.filter(row => !row.costIncludesVat);
  const sum = items => items.reduce((total, row) => total + row.purchaseCost, 0);
  return <div className="owner-purchase-cost" role="status">
    <strong>{t({ he: "עלות המחשב שלי", en: "My build cost" })}</strong>
    {missing > 0 && <div>{t({ he: `חסרה עלות ל־${missing} רכיבים — הסכומים חלקיים`, en: `Cost missing for ${missing} parts — partial amounts` })}</div>}
    {included.length > 0 && <div>{formatCurrency(sum(included), "ILS")} · {t({ he: "כולל מע״מ", en: "VAT included" })}</div>}
    {excluded.length > 0 && <div>{formatCurrency(sum(excluded), "ILS")} · {t({ he: "לפני מע״מ", en: "Before VAT" })}</div>}
    {included.length > 0 && excluded.length > 0 && <div>{t({ he: "העלויות מוצגות בנפרד לפי בסיס המע״מ", en: "Costs shown separately by VAT basis" })}</div>}
  </div>;
}
