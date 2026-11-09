import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import api from "../api";
import AdminLayout from "../layouts/AdminLayout";
import { useLang } from "../context/LangContext.jsx";

const emptyForm = { code: "", type: "percent", value: "", active: true };

export default function Coupons() {
  const [coupons, setCoupons] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useLang();

  const fetchCoupons = async () => {
    try {
      setIsLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await api.get("/api/admin/coupons", { headers: { Authorization: `Bearer ${token}` } });
      setCoupons(res.data?.coupons || []);
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || t({ ar: "خطأ في تحميل القسائم", he: "שגיאה בטעינת קופונים" }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAddCoupon = async () => {
    setIsSaving(true);
    setStatus("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      const payload = {
        code: form.code,
        type: form.type,
        value: form.value,
        active: form.active,
      };
      const res = await api.post("/api/admin/coupons", payload, { headers: { Authorization: `Bearer ${token}` } });
      setCoupons((prev) => [res.data.coupon, ...prev]);
      setForm(emptyForm);
      setStatus(t({ ar: "تمت إضافة القسيمة بنجاح", he: "הקופון נוסף בהצלחה" }));
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || t({ ar: "خطأ في إضافة القسيمة", he: "שגיאה בהוספת קופון" }));
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCoupon = async (id) => {
    setStatus("");
    setError("");
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/admin/coupons/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setCoupons((prev) => prev.filter((c) => c._id !== id));
      setStatus(t({ ar: "تمت إزالة القسيمة", he: "הקופון הוסר" }));
    } catch (err) {
      console.error(err);
      setError(err?.response?.data?.message || t({ ar: "خطأ في حذف القسيمة", he: "שגיאה במחיקת קופון" }));
    }
  };

  return (
    <AdminLayout
      title={t({ ar: "القسائم", he: "קופונים" })}
      subtitle={t({ ar: "إدارة القسائم النشطة", he: "ניהול קופונים פעילים לאתר" })}
    >
        <div className="px-4 sm:px-6 pt-4 space-y-6">
          {(status || error) && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                status ? "border-emerald-500/40 bg-emerald-500/10" : "border-rose-500/40 bg-rose-500/10"
              }`}
            >
              {status || error}
            </div>
          )}

          <section className="bg-[#111824] border border-[#1f2a36] rounded-2xl p-4 sm:p-6">
            <div className="flex flex-wrap gap-3 items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">{t({ ar: "إضافة قسيمة", he: "הוספת קופון" })}</h2>
                <p className="text-xs text-white/60 mt-1">{t({ ar: "خصم نسبة أو مبلغ ثابت بالشيكل", he: "אחוז הנחה או סכום קבוע בשקלים" })}</p>
              </div>
              <button
                type="button"
                onClick={handleAddCoupon}
                disabled={isSaving}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold disabled:opacity-60"
              >
                <Plus size={16} />
                {isSaving ? t({ ar: "جارٍ الحفظ...", he: "שומר..." }) : t({ ar: "أضف قسيمة", he: "הוסף קופון" })}
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <input
                value={form.code}
                onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
                className="col-span-2 md:col-span-1 px-3 py-2.5 rounded-lg bg-[#0f141c] border border-white/10 focus:border-emerald-400 outline-none"
                placeholder={t({ ar: "الكود (مثال: WELCOME10)", he: "קוד (לדוגמה: WELCOME10)" })}
              />
              <select
                value={form.type}
                onChange={(e) => setForm((prev) => ({ ...prev, type: e.target.value }))}
                className="px-3 py-2 rounded-lg bg-[#0f141c] border border-white/10 focus:border-emerald-400 outline-none"
              >
                <option value="percent">{t({ ar: "نسبة", he: "אחוז" })}</option>
                <option value="fixed">{t({ ar: "مبلغ ثابت", he: "סכום קבוע" })}</option>
              </select>
              <input
                type="number"
                value={form.value}
                onChange={(e) => setForm((prev) => ({ ...prev, value: e.target.value }))}
                className="px-3 py-2 rounded-lg bg-[#0f141c] border border-white/10 focus:border-emerald-400 outline-none"
                placeholder={
                  form.type === "percent"
                    ? t({ ar: "قيمة % (مثال 10)", he: "ערך % (למשל 10)" })
                    : t({ ar: "قيمة ₪ (مثال 20)", he: "ערך ₪ (למשל 20)" })
                }
                min="0"
              />
              <label className="flex items-center gap-2 text-sm text-white/70">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm((prev) => ({ ...prev, active: e.target.checked }))}
                />
                {t({ ar: "نشط", he: "פעיל" })}
              </label>
            </div>
          </section>

          <section className="bg-[#111824] border border-[#1f2a36] rounded-2xl p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold">{t({ ar: "القسائم الحالية", he: "קופונים קיימים" })}</h2>
              <button
                type="button"
                onClick={fetchCoupons}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm"
              >
                {t({ ar: "تحديث", he: "רענן" })}
              </button>
            </div>

            {isLoading ? (
              <div className="text-sm text-white/60">{t({ ar: "جارٍ تحميل القسائم...", he: "טוען קופונים..." })}</div>
            ) : coupons.length === 0 ? (
              <div className="text-sm text-white/60">{t({ ar: "لا توجد قسائم للعرض.", he: "אין קופונים להציג." })}</div>
            ) : (
              <div className="space-y-3">
                {coupons.map((coupon) => (
                  <div key={coupon._id} className="flex flex-wrap items-center justify-between gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                    <div>
                      <div className="text-sm font-semibold">{coupon.code}</div>
                      <div className="text-xs text-white/60 mt-1">
                        {coupon.type === "percent"
                          ? t({ ar: `${coupon.value}% خصم`, he: `${coupon.value}% הנחה` })
                          : t({ ar: `${coupon.value} ₪ خصم`, he: `${coupon.value} ₪ הנחה` })}{" "}
                        · {coupon.active ? t({ ar: "نشط", he: "פעיל" }) : t({ ar: "غير نشط", he: "לא פעיל" })}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCoupon(coupon._id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-rose-300"
                      aria-label={t({ ar: "إزالة", he: "הסר" })}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
    </AdminLayout>
  );
}
