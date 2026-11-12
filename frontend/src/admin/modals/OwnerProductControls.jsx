import React, { useState } from "react";
import api from "../../api";

// Rendered only when the authenticated server response grants owner access.
export default function OwnerProductControls({ product, onSaved }) {
  const [supplier, setSupplier] = useState(product.ownerInfo?.supplier || "");
  const [cost, setCost] = useState(product.ownerInfo?.purchaseCost ?? "");
  const [includesVat, setIncludesVat] = useState(product.ownerInfo?.costIncludesVat ?? true);
  const [locked, setLocked] = useState(product.automationLocked === true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const save = async () => {
    setSaving(true);
    setMessage("");
    try {
      const value = cost === "" ? null : Number(cost);
      if (value !== null && (!Number.isFinite(value) || value < 0)) throw new Error("עלות הקנייה חייבת להיות מספר חיובי או אפס.");
      const { data } = await api.patch(`/api/products/owner/${product._id}`, {
        supplier: supplier.trim(), purchaseCost: value, costIncludesVat: includesVat, automationLocked: locked,
      }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
      onSaved(data);
      setMessage("פרטי הרכש והנעילה נשמרו.");
    } catch (error) {
      setMessage(error.response?.data?.message || error.message || "השמירה נכשלה.");
    } finally { setSaving(false); }
  };

  return <section className="mb-5 rounded-xl border border-amber-400/30 bg-amber-400/5 p-4 space-y-3" aria-label="פרטי רכש פרטיים לבעלים">
    <h3 className="font-semibold text-amber-200">🔑 פרטי רכש — לחשבון שלך בלבד</h3>
    <label className="block text-sm">ספק / סוכן
      <input name="supplierName" value={supplier} onChange={(e) => setSupplier(e.target.value)} maxLength={200} placeholder="למשל: מור לוי או אלדין" className="mt-1 w-full rounded bg-[#1f1f1f] border border-white/20 px-3 py-2" />
    </label>
    <label className="block text-sm">עלות קנייה שלי (₪)
      <input name="purchaseCost" type="number" min="0" step="0.01" value={cost} onChange={(e) => setCost(e.target.value)} placeholder="לא הוזנה עלות" className="mt-1 w-full rounded bg-[#1f1f1f] border border-white/20 px-3 py-2" />
    </label>
    <label className="flex gap-2 text-sm"><input name="costIncludesVat" type="checkbox" checked={includesVat} onChange={(e) => setIncludesVat(e.target.checked)} />העלות כוללת מע״מ</label>
    <label className="flex gap-2 text-sm font-semibold"><input name="automationLocked" type="checkbox" checked={locked} onChange={(e) => setLocked(e.target.checked)} />🔒 נעילת מחיר ותוכן מסנכרון ומ־AI</label>
    <p className="text-xs text-white/65">גם כשהמוצר נעול, הסנכרון יכול לסמן אזל מהמלאי או חזר למלאי. לעריכת מחיר ותוכן יש לבטל את הנעילה ולשמור אותה תחילה.</p>
    <button type="button" disabled={saving} onClick={save} className="rounded-lg bg-amber-300 text-black px-3 py-2 font-semibold disabled:opacity-50">{saving ? "שומר…" : "שמור פרטי רכש ונעילה"}</button>
    {message && <p role="status" className="text-sm">{message}</p>}
  </section>;
}
