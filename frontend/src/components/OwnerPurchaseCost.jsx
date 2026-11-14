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
