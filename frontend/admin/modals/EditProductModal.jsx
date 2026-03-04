import React, { useEffect, useState } from "react";
import api from "../../api";
import { motion, AnimatePresence } from "framer-motion";
import { MediaCarousel } from "../../components/MediaCarousel.jsx";
import { useLang } from "../../context/LangContext";

const pick = (obj, keys) => keys.reduce((acc, k) => (obj[k] !== undefined ? { ...acc, [k]: obj[k] } : acc), {});

const EditProductModal = ({ product, onClose, onUpdate }) => {
  const { t } = useLang();
  const initial = {
    name: product?.name ?? product?.title ?? "",
    title: product?.title ?? product?.name ?? "",
    price: product?.price ?? "",
    category: product?.category ?? "",
    description: product?.description ?? "",
    fullSandwichPrice: product?.fullSandwichPrice ?? "",
    extraPattyPrice: product?.extraPattyPrice ?? "",
    isActive: product?.isActive ?? true,
    images: product?.images ?? (product?.image ? [product.image] : []),
    videos: product?.videos ?? [],
  };

  const [form, setForm] = useState(initial);
  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  // מצב לאנימציית סטטוס
  const [status, setStatus] = useState(null); // { type: "success" | "error", msg: string }

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/api/categories", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const showStatus = (type, msg, opts = {}) => {
    setStatus({ type, msg });
    const { autoClose = true, closeAfterMs = 1500 } = opts;
    if (autoClose) {
      setTimeout(() => setStatus(null), closeAfterMs);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
  };

  const uploadFile = async (file) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error(
        t({
          ar: "لا يوجد تصريح (لم يتم العثور على رمز). يرجى تسجيل الدخول مجددًا.",
          he: "אין הרשאה (לא נמצא טוקן). התחבר/י מחדש.",
        })
      );
    }

    const formData = new FormData();
    formData.append("file", file);

    const res = await api.post(`/api/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data.url;
  };

  const handleMediaUpload = async () => {
    if (!imageFiles.length && !videoFiles.length) return;
    setUploading(true);
    setError("");
    try {
      const uploadedImages = [];
      const uploadedVideos = [];

      for (const file of imageFiles) {
        const url = await uploadFile(file);
        uploadedImages.push(url);
      }

      for (const file of videoFiles) {
        const url = await uploadFile(file);
        uploadedVideos.push(url);
      }

      setForm((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedImages],
        videos: [...(prev.videos || []), ...uploadedVideos],
      }));

      setImageFiles([]);
      setVideoFiles([]);
      showStatus("success", t({ ar: "✅ تم رفع الوسائط بنجاح", he: "✅ המדיה הועלתה בהצלחה" }));
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || t({ ar: "خطأ في رفع الوسائط", he: "שגיאה בהעלאת מדיה" });
      setError(msg);
      showStatus("error", "❌ " + msg);
    } finally {
      setUploading(false);
    }
  };

  const toNumberOrUndefined = (v) => {
    if (v === "" || v === null || v === undefined) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error(
          t({
            ar: "لا يوجد تصريح (لم يتم العثور على رمز). يرجى تسجيل الدخول مجددًا.",
            he: "אין הרשאה (לא נמצא טוקן). התחבר/י מחדש.",
          })
        );
      }

      const payload = pick(
        {
          name: form.name?.trim(),
          title: (form.title || form.name)?.trim(),
          price: toNumberOrUndefined(form.price),
          stock: toNumberOrUndefined(form.stock),
          images: form.images,
          videos: form.videos,
          category: form.category?.trim(),
          description: form.description?.trim(),
          fullSandwichPrice: form.category === "Sandwiches" ? toNumberOrUndefined(form.fullSandwichPrice) : undefined,
          extraPattyPrice: form.category === "Sandwiches" ? toNumberOrUndefined(form.extraPattyPrice) : undefined,
          isActive: !!form.isActive,
        },
        ["name", "title", "price", "category", "description", "images", "videos", "fullSandwichPrice", "extraPattyPrice", "isActive"]
      );

      const response = await api.put(`/api/products/${product._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onUpdate?.(response.data);

      // מציגים אנימציית הצלחה ואז סוגרים
      showStatus("success", t({ ar: "تم الحفظ بنجاح! 🎉", he: "נשמר בהצלחה! 🎉" }));
      setTimeout(() => onClose(), 700); // נותן לאנימציה רגע להופיע
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || err.message || t({ ar: "خطأ في تحديث المنتج", he: "שגיאה בעדכון מוצר" });
      setError(msg);
      showStatus("error", "❌ " + msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={onClose} aria-modal="true" role="dialog">
      <div
        className="relative bg-[#2a2a2a] rounded-xl p-6 w-full max-w-md shadow-lg text-white max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">{t({ ar: "✏️ تعديل منتج", he: "✏️ עריכת מוצר" })}</h2>

        {error && <div className="mb-4 text-red-300 text-sm bg-red-900/30 border border-red-700/50 rounded p-2">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4 text-right">
          <label className="block text-sm">{t({ ar: "اسم المنتج", he: "שם מוצר" })}</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={t({ ar: "اسم المنتج", he: "שם מוצר" })}
            required
            className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20"
          />

          <label className="block text-sm">{t({ ar: "السعر", he: "מחיר" })}</label>
          <input
            type="number"
            name="price"
            inputMode="decimal"
            value={form.price}
            onChange={handleChange}
            placeholder={t({ ar: "السعر", he: "מחיר" })}
            required
            className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20"
          />

          {form.category === "Sandwiches" && (
            <>
              <label className="block text-sm">{t({ ar: "سعر الساندويتش الكامل", he: "מחיר סנדוויץ' מלא" })}</label>
              <input
                type="number"
                name="fullSandwichPrice"
                inputMode="decimal"
                value={form.fullSandwichPrice}
                onChange={handleChange}
                placeholder={t({ ar: "سعر الساندويتش الكامل", he: "מחיר סנדוויץ' מלא" })}
                className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20"
              />
              <label className="block text-sm">{t({ ar: "سعر إضافة قطعة لحم", he: "מחיר תוספת קציצה" })}</label>
              <input
                type="number"
                name="extraPattyPrice"
                inputMode="decimal"
                value={form.extraPattyPrice}
                onChange={handleChange}
                placeholder={t({ ar: "سعر إضافة قطعة لحم", he: "מחיר תוספת קציצה" })}
                className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20"
              />
            </>
          )}

          <label className="font-semibold block mt-2">{t({ ar: "رفع الصور:", he: "העלה תמונות:" })}</label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
            className="w-full"
          />

          <label className="font-semibold block mt-2">{t({ ar: "رفع الفيديوهات:", he: "העלה סרטונים:" })}</label>
          <input
            type="file"
            accept="video/*"
            multiple
            onChange={(e) => setVideoFiles(Array.from(e.target.files || []))}
            className="w-full"
          />

          {(imageFiles.length > 0 || videoFiles.length > 0) && (
            <button
              type="button"
              onClick={handleMediaUpload}
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-bold py-2 px-4 rounded w-full mb-3"
            >
              {uploading ? t({ ar: "جارٍ الرفع...", he: "מעלה..." }) : t({ ar: "رفع الوسائط", he: "העלה מדיה" })}
            </button>
          )}

          <MediaCarousel images={form.images} videos={form.videos} />

          {form.images?.length ? (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {form.images.map((src) => (
                <div key={src} className="relative">
                  <img src={src} alt="Preview" className="h-20 w-full rounded border border-white/10 object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        images: (prev.images || []).filter((img) => img !== src),
                      }))
                    }
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          {form.videos?.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3">
              {form.videos.map((src) => (
                <div key={src} className="relative">
                  <video src={src} className="h-24 w-full rounded border border-white/10 object-cover" />
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        videos: (prev.videos || []).filter((video) => video !== src),
                      }))
                    }
                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                    aria-label={t({ ar: "إزالة الفيديو", he: "הסר סרטון" })}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : null}

          <label className="block text-sm">{t({ ar: "الفئة", he: "קטגוריה" })}</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20"
          >
            <option value="">{t({ ar: "اختر فئة", he: "בחר קטגוריה" })}</option>
            {categories.map((cat) => (
              <option key={cat._id || cat.name} value={cat.name}>
                {cat.name}
              </option>
            ))}
            {form.category && !categories.find((cat) => cat.name === form.category) ? (
              <option value={form.category}>{form.category}</option>
            ) : null}
          </select>

          <label className="block text-sm">{t({ ar: "الوصف (اختياري)", he: "תיאור (אופציונלי)" })}</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder={t({ ar: "وصف للطبق / المنتج", he: "תיאור למנה / מוצר" })}
            className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20 min-h-[80px]"
          />

          <label className="flex items-center gap-2 pt-1">
            <input type="checkbox" name="isActive" checked={!!form.isActive} onChange={handleChange} className="accent-green-500" />
            {t({ ar: "نشط للعرض في القائمة", he: "פעיל להצגה בתפריט" })}
          </label>

          <div className="flex justify-between pt-4 gap-2">
            <button
              type="submit"
              disabled={uploading || saving}
              className="bg-green-500 hover:bg-green-600 disabled:opacity-60 text-white px-5 py-2 rounded font-bold"
            >
              {saving ? t({ ar: "جارٍ الحفظ...", he: "שומר..." }) : t({ ar: "💾 حفظ", he: "💾 שמור" })}
            </button>
            <button type="button" onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded font-bold">
              {t({ ar: "❌ إلغاء", he: "❌ ביטול" })}
            </button>
          </div>
        </form>

        {/* אנימציות הצלחה/שגיאה */}
        <AnimatePresence>
          {status && (
            <motion.div
              key="status-toast"
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className={`pointer-events-none absolute left-1/2 -translate-x-1/2 bottom-4 px-4 py-3 rounded-xl shadow-lg text-sm
                ${status.type === "success" ? "bg-green-600/90" : "bg-red-600/90"}`}
            >
              <div className="flex items-center gap-2">
                {status.type === "success" ? (
                  // אייקון וי
                  <motion.svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="text-white"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <motion.path d="M20 6L9 17l-5-5" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                ) : (
                  // אייקון X
                  <motion.svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    className="text-white"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 18 }}
                  >
                    <path d="M18 6L6 18M6 6l12 12" strokeWidth="2.5" strokeLinecap="round" />
                  </motion.svg>
                )}
                <span className="text-white">{status.msg}</span>
              </div>
              {/* הבזק קטן להצלחה */}
              {status.type === "success" && (
                <motion.div
                  initial={{ scale: 0, opacity: 0.6 }}
                  animate={{ scale: 1.4, opacity: 0 }}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 rounded-xl border border-white/40"
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EditProductModal;
