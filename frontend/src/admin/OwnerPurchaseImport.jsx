import React, { useMemo, useState } from "react";
import api from "../api";

export default function OwnerPurchaseImport({ onSaved }) {
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const parsed = useMemo(() => {
    if (!text.trim()) return { rows: [], error: "" };
    const rows = [];
    const seen = new Set();
    for (const [index, line] of text.trim().split(/\r?\n/).entries()) {
      const fields = line.split("\t").map((value) => value.trim());
      const [sku, supplier, cost, vat] = fields;
      if (fields.length !== 4 || !sku || !supplier || !cost || !Number.isFinite(Number(cost)) || Number(cost) < 0 || !["true", "false"].includes(vat)) return { rows: [], error: `שורה ${index + 1}: יש להזין מק״ט, ספק, עלות ו־true/false למע״מ, מופרדים בטאב.` };
      if (seen.has(sku)) return { rows: [], error: `מק״ט כפול: ${sku}` };
      seen.add(sku);
      rows.push({ sku, supplier, purchaseCost: Number(cost), costIncludesVat: vat === "true" });
    }
    return { rows, error: "" };
  }, [text]);
  async function save() {
    setBusy(true); setError(""); setResults([]);
    const completed = [];
    try {
      for (let index = 0; index < parsed.rows.length; index += 50) {
        const { data } = await api.patch("/api/products/owner/import", { rows: parsed.rows.slice(index, index + 50) }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
        completed.push(...data.results);
        setResults([...completed]);
        onSaved(data.results);
      }
    } catch (failure) { setError(failure.response?.data?.message || "הייבוא נעצר. התוצאות למטה מציגות את מה שכבר נשמר; אפשר לנסות שוב את השורות שנותרו."); }
    finally { setBusy(false); }
  }
  return <details className="mt-4 rounded-xl border border-amber-300/30 p-4">
    <summary className="cursor-pointer font-semibold text-amber-200">ייבוא עלויות ספק — לחשבון שלך בלבד</summary>
    <p className="my-3 text-sm text-white/70">מק״ט מלא, שם ספק, עלות קנייה, האם כוללת מע״מ (true או false), מופרדים בטאב. הייבוא מעדכן רק פרטי רכש במוצרים קיימים. מוצרים נעולים או מק״טים שאינם חד־משמעיים ידולגו.</p>
    <label className="block">נתוני עלויות ספק<textarea aria-label="נתוני עלויות ספק" disabled={busy} value={text} onChange={(event) => { setText(event.target.value); setResults([]); }} rows={6} dir="ltr" className="my-2 w-full rounded border border-white/20 bg-[#111824] p-3 text-sm" /></label>
    {parsed.error && <p role="alert">{parsed.error}</p>}
    <p className="text-sm">{parsed.rows.length} שורות מוכנות</p>
    <button type="button" disabled={busy || !parsed.rows.length || !!parsed.error} onClick={save} className="my-3 rounded bg-amber-300 px-4 py-2 font-semibold text-black disabled:opacity-50">{busy ? `מייבא… ${results.length}/${parsed.rows.length}` : "שמור עלויות ספק בלבד"}</button>
    {error && <p role="alert">{error}</p>}
    {!!results.length && <div role="status" aria-label="תוצאות ייבוא עלויות"><p>נשמרו: {results.filter((row) => row.status === "saved").length} · דולגו: {results.filter((row) => row.status !== "saved").length} · נבדקו: {results.length}/{parsed.rows.length}</p><textarea aria-label="פירוט תוצאות ייבוא" readOnly value={results.map((row) => `${row.sku}\t${row.status}`).join("\n")} rows={5} dir="ltr" className="mt-2 w-full rounded bg-[#111824] p-2 text-sm" /></div>}
  </details>;
}
