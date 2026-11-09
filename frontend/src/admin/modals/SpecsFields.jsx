import React from "react";
import { useLang } from "../../context/LangContext";

// Categories whose products get filterable specs (processor, GPU, RAM, storage).
export const SPECS_CATEGORIES = ["Gaming PCs", "Laptops"];

export const EMPTY_SPECS = { cpuBrand: "", cpu: "", gpu: "", ram: "", storage: "" };

const TEXT_FIELDS = [
  { key: "cpu", label: { ar: "طراز المعالج", he: "דגם מעבד" }, placeholder: "Core i5-14400F" },
  { key: "gpu", label: { ar: "بطاقة الرسومات", he: "כרטיס מסך" }, placeholder: "RTX 5060" },
  { key: "ram", label: { ar: "الذاكرة", he: "זיכרון" }, placeholder: "16GB" },
  { key: "storage", label: { ar: "التخزين", he: "אחסון" }, placeholder: "1TB" },
];

const inputClass = "w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20";

export default function SpecsFields({ specs, onChange }) {
  const { t } = useLang();
  const value = { ...EMPTY_SPECS, ...specs };
  const update = (key, next) => onChange({ ...value, [key]: next });

  return (
    <fieldset className="space-y-2 border border-white/10 rounded p-3">
      <legend className="text-sm px-1">{t({ ar: "المواصفات (للفلاتر)", he: "מפרט (משמש לסינון)" })}</legend>

      <label className="block text-sm">{t({ ar: "مصنّع المعالج", he: "יצרן מעבד" })}</label>
      <select value={value.cpuBrand} onChange={(e) => update("cpuBrand", e.target.value)} className={inputClass}>
        <option value="">—</option>
        <option value="Intel">Intel</option>
        <option value="AMD">AMD</option>
      </select>

      {TEXT_FIELDS.map((field) => (
        <React.Fragment key={field.key}>
          <label className="block text-sm">{t(field.label)}</label>
          <input
            type="text"
            value={value[field.key]}
            onChange={(e) => update(field.key, e.target.value)}
            placeholder={field.placeholder}
            dir="ltr"
            className={inputClass}
          />
        </React.Fragment>
      ))}
    </fieldset>
  );
}
