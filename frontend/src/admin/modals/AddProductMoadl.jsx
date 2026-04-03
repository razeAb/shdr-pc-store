import React, { useState, useEffect } from "react";
import api from "../../api";
import { MediaCarousel } from "../../components/MediaCarousel.jsx";
import { useLang } from "../../context/LangContext";

const AddProductModal = ({ onClose, onAdd }) => {
  const { t } = useLang();
  const [form, setForm] = useState({
    title: "",
    sku: "",
    category: "",
    subCategory: "",
    price: "",
    description: "",
    tags: "",
    isActive: true,
    images: [],
    videos: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState([]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const title = form.title.trim();
      const price = Number(form.price);

      if (!title) {
        throw new Error(t({ ar: "اسم المنتج مطلوب.", he: "שם המוצר הוא שדה חובה." }));
      }
      if (!Number.isFinite(price) || price < 0) {
        throw new Error(t({ ar: "يرجى إدخال سعر صالح.", he: "נא להזין מחיר תקין." }));
      }

      const payload = {
        title,
        price,
        sku: form.sku,
        category: form.category,
        subCategory: form.subCategory,
        isActive: form.isActive,
        images: form.images,
        videos: form.videos,
        description: form.description || "",
        tags: form.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean),
      };

      if (!payload.images?.length) {
        throw new Error(t({ ar: "يرجى رفع صورة واحدة على الأقل.", he: "נא להעלות לפחות תמונה אחת." }));
      }

      const response = await api.post(`/api/products`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onAdd(response.data);
      onClose();
    } catch (err) {
      setError(err?.message || t({ ar: "فشل إضافة المنتج.", he: "הוספת מוצר נכשלה." }));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadFile = async (file) => {
    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    const uploadRes = await api.post(`/api/upload`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return uploadRes.data.url;
  };

  const handleMediaUpload = async () => {
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
        images: [...prev.images, ...uploadedImages],
        videos: [...prev.videos, ...uploadedVideos],
      }));

      setImageFiles([]);
      setVideoFiles([]);

      alert(t({ ar: "✅ تم رفع الوسائط بنجاح!", he: "✅ המדיה הועלתה בהצלחה!" }));
    } catch (err) {
      alert(t({ ar: "❌ فشل رفع الوسائط.", he: "❌ העלאת המדיה נכשלה." }));
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/api/categories`, { headers: { Authorization: `Bearer ${token}` } });
        console.log("Fetched categories:", res.data); // 👈 Add this
        setCategories(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch categories:", err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center" onClick={onClose}>
      <div
        className="bg-[#2a2a2a] rounded-xl p-6 w-full max-w-md shadow-lg text-white overflow-y-auto max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-2xl font-bold mb-4 text-center">{t({ ar: "➕ إضافة منتج جديد", he: "➕ הוספת מוצר חדש" })}</h2>
        {error && <div className="text-red-500 text-center mb-2">{error}</div>}

        <input
          name="title"
          placeholder={t({ ar: "اسم المنتج", he: "שם מוצר" })}
          onChange={handleChange}
          value={form.title}
          required
          className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20 mb-3 focus:outline-none"
        />

        <input
          name="sku"
          placeholder={t({ ar: "Serial key", he: "מפתח סריאלי" })}
          onChange={handleChange}
          value={form.sku}
          className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20 mb-3 focus:outline-none"
        />

        <label className="font-semibold">{t({ ar: "روابط الصور:", he: "קישורי תמונות:" })}</label>
        <div className="flex gap-2 mb-3">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder={t({ ar: "الصق رابط صورة", he: "הדבק קישור לתמונה" })}
            className="flex-1 px-4 py-2 rounded bg-[#1f1f1f] border border-white/20 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = imageUrl.trim();
              if (!trimmed) return;
              setForm((prev) => ({ ...prev, images: [...prev.images, trimmed] }));
              setImageUrl("");
            }}
            className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-sm"
          >
            {t({ ar: "أضف", he: "הוסף" })}
          </button>
        </div>

        <label className="font-semibold">{t({ ar: "روابط الفيديو:", he: "קישורי וידאו:" })}</label>
        <div className="flex gap-2 mb-3">
          <input
            type="url"
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder={t({ ar: "الصق رابط فيديو", he: "הדבק קישור לוידאו" })}
            className="flex-1 px-4 py-2 rounded bg-[#1f1f1f] border border-white/20 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => {
              const trimmed = videoUrl.trim();
              if (!trimmed) return;
              setForm((prev) => ({ ...prev, videos: [...prev.videos, trimmed] }));
              setVideoUrl("");
            }}
            className="px-3 py-2 rounded bg-white/10 hover:bg-white/20 text-sm"
          >
            {t({ ar: "أضف", he: "הוסף" })}
          </button>
        </div>

        <label className="font-semibold">{t({ ar: "رفع الصور:", he: "העלה תמונות:" })}</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => setImageFiles(Array.from(e.target.files || []))}
          className="w-full mb-2"
        />

        <label className="font-semibold">{t({ ar: "رفع الفيديوهات:", he: "העלה סרטונים:" })}</label>
        <input
          type="file"
          accept="video/*"
          multiple
          onChange={(e) => setVideoFiles(Array.from(e.target.files || []))}
          className="w-full mb-2"
        />

        {(imageFiles.length > 0 || videoFiles.length > 0) && (
          <button
            type="button"
            onClick={handleMediaUpload}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded w-full mb-3"
          >
            {t({ ar: "رفع الوسائط", he: "העלה מדיה" })}
          </button>
        )}

        <div className="mb-4">
          <MediaCarousel images={form.images} videos={form.videos} />
        </div>

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
          <div className="mt-3 space-y-2">
            <div className="text-xs text-white/70">
              {t({ ar: "الفيديوهات المرفوعة:", he: "סרטונים שנוספו:" })} {form.videos.length}
            </div>
            <div className="space-y-2">
              {form.videos.map((src) => (
                <div key={src} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-2 py-1">
                  <span className="text-[11px] text-white/70 truncate flex-1">{src}</span>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((prev) => ({
                        ...prev,
                        videos: (prev.videos || []).filter((video) => video !== src),
                      }))
                    }
                    className="bg-red-600 text-white rounded-full w-5 h-5 text-xs"
                    aria-label={t({ ar: "إزالة", he: "הסר" })}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : null}

        <select
          name="category"
          onChange={handleChange}
          value={form.category}
          className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20 mb-3"
        >
          <option value="">{t({ ar: "اختر فئة", he: "בחר קטגוריה" })}</option>
          {categories.map((cat) => (
            <option key={cat._id || cat.name} value={cat.name}>
              {cat.name}
            </option>
          ))}
        </select>

        <input
          name="subCategory"
          placeholder={t({ ar: "الفئة الفرعية", he: "תת קטגוריה" })}
          onChange={handleChange}
          value={form.subCategory}
          className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20 mb-3"
        />

        <input
          name="price"
          placeholder={t({ ar: "السعر", he: "מחיר" })}
          type="number"
          onChange={handleChange}
          value={form.price}
          required
          className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20 mb-3"
        />

        <textarea
          name="description"
          placeholder={t({ ar: "الوصف", he: "תיאור" })}
          onChange={handleChange}
          value={form.description}
          className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20 mb-3 min-h-[100px]"
        />

        <input
          name="tags"
          placeholder={t({ ar: "وسوم (افصل بفواصل)", he: "תגיות (מופרדות בפסיקים)" })}
          onChange={handleChange}
          value={form.tags}
          className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20 mb-3"
        />

        <label className="flex items-center gap-2 mt-2 mb-4">
          <input type="checkbox" name="isActive" checked={form.isActive} onChange={handleChange} />
          <span className="text-sm">{t({ ar: "نشط", he: "פעיל" })}</span>
        </label>

        <div className="flex justify-between">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded font-bold w-1/2 mr-2"
          >
            {loading ? t({ ar: "جارٍ الإضافة...", he: "מוסיף..." }) : t({ ar: "أضف", he: "הוסף" })}
          </button>
          <button onClick={onClose} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded font-bold w-1/2 ml-2">
            {t({ ar: "إلغاء", he: "ביטול" })}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProductModal;
