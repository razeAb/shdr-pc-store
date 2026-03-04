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
    price: "",
    description: "",
    tags: "",
    isActive: true,
    images: [],
    videos: [],
  });

  const [imageFiles, setImageFiles] = useState([]);
  const [videoFiles, setVideoFiles] = useState([]);
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

      const payload = {
        title: form.title,
        price: Number(form.price),
        sku: form.sku,
        category: form.category,
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
        throw new Error(t({ ar: "يرجى رفع صورة واحدة على الأقل.", he: "Please upload at least one photo." }));
      }

      const response = await api.post(`/api/products`, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      onAdd(response.data);
      onClose();
    } catch (err) {
      setError(err?.message || t({ ar: "فشل إضافة المنتج.", he: "Failed to add product." }));
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

      alert(t({ ar: "✅ تم رفع الوسائط بنجاح!", he: "✅ Media uploaded successfully!" }));
    } catch (err) {
      alert(t({ ar: "❌ فشل رفع الوسائط.", he: "❌ Failed to upload media." }));
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
          className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20 mb-3 focus:outline-none"
        />

        <input
          name="sku"
          placeholder={t({ ar: "SKU", he: "SKU" })}
          onChange={handleChange}
          value={form.sku}
          className="w-full px-4 py-2 rounded bg-[#1f1f1f] border border-white/20 mb-3 focus:outline-none"
        />

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
          name="price"
          placeholder={t({ ar: "السعر", he: "מחיר" })}
          type="number"
          onChange={handleChange}
          value={form.price}
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
