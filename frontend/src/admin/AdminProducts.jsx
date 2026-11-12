import React, { useEffect, useState, useMemo } from "react";
import api from "../api";
import AdminLayout from "../layouts/AdminLayout";
import AddProductModal from "./modals/AddProductMoadl"; // keep your original filename
import EditProductModal from "./modals/EditProductModal";
import OwnerPurchaseImport from "./OwnerPurchaseImport";
import Button from "../components/common/Button";
import { ChevronDown, Pencil, Trash2, Eye, EyeOff, Plus, Search } from "lucide-react";
import { useLang } from "../context/LangContext";
import { ResponsiveContainer, PieChart, Pie, Tooltip, Label } from "recharts";

/** Spinner (ring) */
function Spinner({ size = 40 }) {
  return (
    <div
      className="animate-spin rounded-full border-2 border-white/20 border-t-white/80"
      style={{ width: size, height: size }}
      aria-label="טוען"
    />
  );
}

/** Full-page loading screen */
function LoadingScreen({ label = "טוען…" }) {
  return (
    <div className="min-h-screen bg-[#0f141c] text-[#aab2c4] grid place-items-center px-4">
      <div className="flex flex-col items-center gap-3">
        <Spinner size={48} />
        <div className="text-sm text-white/70">{label}</div>
      </div>
    </div>
  );
}

/** מעטפת מקטע */
function SectionCard({ title, children, extra }) {
  return (
    <section className="bg-[#111824] border border-[#1f2a36] rounded-2xl p-4 sm:p-6">
      <div className="flex items-center justify-between gap-2 mb-4">
        <h3 className="text-[15px] sm:text-[16px] font-semibold tracking-tight">{title}</h3>
        {extra}
      </div>
      {children}
    </section>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [categoryList, setCategoryList] = useState([]);
  const [categoryName, setCategoryName] = useState("");
  const [categorySaving, setCategorySaving] = useState(false);
  const [categoryError, setCategoryError] = useState("");
  const [isCategoryPanelOpen, setIsCategoryPanelOpen] = useState(false);

  // ---- סינון/חיפוש
  const [activeCategory, setActiveCategory] = useState("הכל");
  const [query, setQuery] = useState("");

  // ---- סטטיסטיקות
  const [categoryStats, setCategoryStats] = useState([]); // [{name, count}]
  const { lang, t } = useLang();
  // Products store their name in `title`; older records may use name fields.
  const resolveName = (p) =>
    (lang === "en" ? p?.name_en ?? p?.name : p?.name_he ?? p?.name) ?? p?.title ?? "";
  // Each category shows this many products until "show all" is pressed.
  const CATEGORY_PREVIEW = 12;
  const [expandedCategories, setExpandedCategories] = useState({});
  const resolveCategoryLabel = (value) => {
    if (value === "הכל") return t({ ar: "الكل", he: "הכל" });
    if (value === "לא מקוטלג") return t({ ar: "غير مصنف", he: "לא מקוטלג" });
    return value;
  };
  const restLabel = t({ ar: "الباقي", he: "שאר" });

  /** טעינת מוצרים + סטטיסטיקות */
  useEffect(() => {
    const fetchAll = async () => {
      let normalized = [];
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get(`/api/admin/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        normalized = (res.data?.products ?? []).map((p) => ({
          ...p,
          isActive: Boolean(p.isActive),
        }));
        setProducts(normalized);
        setError("");
      } catch (err) {
        console.error("שגיאה בטעינת מוצרים:", err);
        setError(t({ ar: "خطأ في تحميل المنتجات", he: "שגיאה בטעינת מוצרים" }));
      } finally {
        setLoading(false);
      }

      // סטטיסטיקות (סכום פריטים מוזמנים לפי קטגוריה – החודש)
      try {
        setStatsLoading(true);
        const token = localStorage.getItem("token");
        const statsRes = await api.get(`/api/admin/category-stats?period=month`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const raw = statsRes?.data;
        let list = [];
        if (Array.isArray(raw)) {
          list = raw; // [{name,count}]
        } else if (Array.isArray(raw?.categories)) {
          list = raw.categories;
        } else if (raw && typeof raw === "object") {
          list = Object.entries(raw)
            .filter(([, v]) => typeof v === "number")
            .map(([name, count]) => ({ name, count }));
        }

        // נפילה לחישוב מקומי אם ה‑API לא מחזיר כלום
        if (!list?.length) {
          const byCat = {};
          for (const p of normalized) {
            const cat = p.category || "לא מקוטלג";
            const c = Number(p.orderCount ?? p.timesOrdered ?? p.totalOrders ?? 0);
            byCat[cat] = (byCat[cat] || 0) + (isFinite(c) ? c : 0);
          }
          list = Object.entries(byCat).map(([name, count]) => ({ name, count }));
        }

        // להבטיח שכל הקטגוריות יופיעו (גם אם 0)
        const allCats = new Set(normalized.map((p) => p.category || "לא מקוטלג"));
        list = Array.from(allCats).map((name) => {
          const found = (list || []).find((x) => x.name === name);
          return { name, count: found ? Number(found.count) || 0 : 0 };
        });

        setCategoryStats(list);
      } catch (e) {
        console.warn("טעינת סטטיסטיקות נכשלה, מעבר לחישוב מקומי…", e);
        const byCat = {};
        const source = normalized.length ? normalized : products;
        for (const p of source) {
          const cat = p.category || "לא מקוטלג";
          const c = Number(p.orderCount ?? p.timesOrdered ?? p.totalOrders ?? 0);
          byCat[cat] = (byCat[cat] || 0) + (isFinite(c) ? c : 0);
        }
        let list = Object.entries(byCat).map(([name, count]) => ({ name, count }));

        // להבטיח שכל הקטגוריות יופיעו (גם אם 0)
        const allCats = new Set((normalized.length ? normalized : products).map((p) => p.category || "לא מקוטלג"));
        list = Array.from(allCats).map((name) => {
          const found = (list || []).find((x) => x.name === name);
          return { name, count: found ? Number(found.count) || 0 : 0 };
        });

        setCategoryStats(list);
      } finally {
        setStatsLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await api.get("/api/categories", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategoryList(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  /** קטגוריות למסננים */
  const categories = useMemo(() => {
    const fromProducts = new Set(products.map((p) …180 tokens truncated…yList((prev) => [res.data, ...prev]);
      setCategoryName("");
    } catch (err) {
      setCategoryError(err?.message || t({ ar: "فشل إضافة الفئة", he: "הוספת קטגוריה נכשלה" }));
    } finally {
      setCategorySaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId, name) => {
    if (!window.confirm(t({ ar: `حذف الفئة "${name}"؟`, he: `למחוק את הקטגוריה "${name}"?` }))) return;
    setCategoryError("");
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/categories/${categoryId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCategoryList((prev) => prev.filter((cat) => cat._id !== categoryId));
    } catch (err) {
      setCategoryError(err?.message || t({ ar: "فشل حذف الفئة", he: "מחיקת קטגוריה נכשלה" }));
    }
  };

  /** חיפוש בלבד */
  const searchFiltered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (!q) return true;
      const nameText = `${p.title || ""} ${p.sku || ""} ${p.name_en || ""} ${p.name_he || ""} ${p.name || ""}`.toLowerCase();
      const descText = `${p.description_en || ""} ${p.description_he || ""} ${p.description || ""}`.toLowerCase();
      return nameText.includes(q) || descText.includes(q);
    });
  }, [products, query]);

  /** חיפוש + קטגוריה */
  const visibleProducts = useMemo(() => {
    return searchFiltered.filter((p) => {
      const cat = p.category || "לא מקוטלג";
      return activeCategory === "הכל" || cat === activeCategory;
    });
  }, [searchFiltered, activeCategory]);

  /** קיבוץ לתצוגה */
  const groupedByCategory = useMemo(() => {
    return visibleProducts.reduce((acc, product) => {
      const cat = product.category || "לא מקוטלג";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(product);
      return acc;
    }, {});
  }, [visibleProducts]);

  /** דאטה לדונאט (גלובלי) */
  const donutData = useMemo(() => {
    const total = categoryStats.reduce((s, i) => s + (Number(i.count) || 0), 0);
    const ordered = [...categoryStats].sort((a, b) => {
      const ca = Number(a.count) || 0;
      const cb = Number(b.count) || 0;
      if (cb !== ca) return cb - ca;
      return String(a.name).localeCompare(String(b.name));
    });

    if (total === 0) {
      return ordered.map((i) => ({ name: i.name, value: 0, pct: 0, total: 0 }));
    }
    return ordered.map((i) => {
      const value = Number(i.count) || 0;
      const pct = Math.round((value / total) * 100);
      return { name: i.name, value, pct, total };
    });
  }, [categoryStats]);

  /** פעולות על מוצר */
  const handleToggleActive = async (productId, currentStatus) => {
    try {
      const token = localStorage.getItem("token");
      await api.patch(`/api/products/${productId}/toggle`, null, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) =>
        prev.map((p) => (p._id === productId ? { ...p, isActive: !currentStatus } : p))
      );
    } catch (err) {
      console.error("שגיאה בשינוי סטטוס מוצר:", err);
      alert(t({ ar: "لا يمكن تحديث حالة المنتج.", he: "לא ניתן לעדכן את סטטוס המוצר." }));
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm(t({ ar: "حذف المنتج؟", he: "למחוק את המוצר?" }))) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/api/products/${productId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProducts((prev) => prev.filter((p) => p._id !== productId));
    } catch (err) {
      console.error("שגיאה במחיקת מוצר:", err);
      alert(t({ ar: "فشل الحذف.", he: "מחיקה נכשלה." }));
    }
  };

  /** מצבים עליונים */
  if (loading) {
    return <LoadingScreen label={t({ ar: "جارٍ تحميل المنتجات...", he: "טוען מוצרים…" })} />;
  }
  if (error) {
    return (
      <div className="min-h-screen bg-[#0f141c] text-white grid place-items-center px-4">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <Button title={t({ ar: "تحديث", he: "רענן" })} onClick={() => window.location.reload()} />
        </div>
      </div>
    );
  }

  // צבע לסגמנט מודגש + צבע לשאר הטבעת
  const COLORS = ["#22c3e6", "#ef476f", "#f7c948", "#10b981", "#a78bfa", "#fb923c", "#60a5fa"];
  const REST = "rgba(255,255,255,0.08)";

  return (
    <AdminLayout
      title={t({ ar: "المنتجات", he: "מוצרים" })}
      subtitle={t({
        ar: "إدارة منتجات المتجر",
        he: `ניהול המוצרים בחנות · ${products.length} מוצרים`
      })}
      actions={
        <button
          type="button"
          onClick={() => {
            setSelectedProduct(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 px-4 py-2.5 text-sm font-semibold"
        >
          <Plus size={16} />
          {t({ ar: "أضف منتجًا جديدًا", he: "הוסף מוצר חדש" })}
        </button>
      }
    >
        <div className="px-4 sm:px-6">
          {products.some((p) => p.canManagePrivateProducts) && <OwnerPurchaseImport onSaved={(results) => setProducts((previous) => previous.map((product) => { const row = results.find((item) => item.sku === product.sku && item.status === "saved"); return row ? { ...product, ownerInfo: row.ownerInfo, automationLocked: row.automationLocked } : product; }))} />}
          {/* חיפוש */}
          <div className="mt-4 relative">
            <Search size={16} className="absolute top-1/2 -translate-y-1/2 right-3 text-white/40 pointer-events-none" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t({ ar: "بحث بالاسم أو الرمز", he: "חיפוש לפי שם או מק\"ט" })}
              className="w-full rounded-xl bg-[#111824] border border-[#1f2a36] pr-9 pl-3 py-2.5 text-sm outline-none focus:border-emerald-500/60"
            />
          </div>
          {/* ניהול קטגוריות (סגור כברירת מחדל – לא צריך בכל כניסה) */}
          <div className="mt-6">
            <SectionCard
              title={t({ ar: "إدارة الفئات", he: `ניהול קטגוריות (${categoryList.length})` })}
              extra={
                <button
                  type="button"
                  onClick={() => setIsCategoryPanelOpen((open) => !open)}
                  aria-expanded={isCategoryPanelOpen}
                  className="flex items-center gap-1 text-xs text-white/70 hover:text-white py-1"
                >
                  {isCategoryPanelOpen ? t({ ar: "إخفاء", he: "הסתר" }) : t({ ar: "إدارة", he: "ניהול" })}
                  <ChevronDown size={14} className={isCategoryPanelOpen ? "rotate-180" : ""} />
                </button>
              }
            >
              {isCategoryPanelOpen && (
              <div className="flex flex-col gap-4">
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    value={categoryName}
                    onChange={(e) => setCategoryName(e.target.value)}
                    placeholder={t({ ar: "اسم فئة جديدة", he: "שם קטגוריה חדשה" })}
                    className="flex-1 min-w-[180px] px-3 py-2 rounded-lg bg-[#0f141c] border border-[#1f2a36] text-white/90"
                  />
                  <button
                    type="button"
                    onClick={handleAddCategory}
                    disabled={categorySaving}
                    className="px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm disabled:opacity-60"
                  >
                    {categorySaving ? t({ ar: "جارٍ الحفظ...", he: "שומר..." }) : t({ ar: "أضف", he: "הוסף" })}
                  </button>
                </div>
                {categoryError ? (
                  <p className="text-xs text-rose-300">{categoryError}</p>
                ) : null}
                {categoryList.length === 0 ? (
                  <p className="text-xs text-white/50">{t({ ar: "لا توجد فئات للعرض.", he: "אין קטגוריות להצגה." })}</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {categoryList.map((cat) => (
                      <div
                        key={cat._id}
                        className="flex items-center gap-2 bg-[#0f141c] border border-[#1f2a36] rounded-full px-3 py-1 text-sm"
                      >
                        <span>{cat.name}</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat._id, cat.name)}
                          className="text-rose-300 hover:text-rose-200"
                          aria-label={t({ ar: `حذف ${cat.name}`, he: `מחק ${cat.name}` })}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <button type="button" onClick={fetchCategories} className="self-start text-xs text-white/60 hover:text-white">
                  {t({ ar: "تحديث", he: "רענן רשימה" })}
                </button>
              </div>
              )}
            </SectionCard>
          </div>

          {/* מסננים */}
          <div className="mt-6">
            <SectionCard title={t({ ar: "تصفية المنتجات", he: "סינון מוצרים" })}>
              <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible">
                {categories.map((cat) => {
                  const isActive = activeCategory === cat;
                  const count =
                    cat === "הכל" ? searchFiltered.length : searchFiltered.filter((p) => (p.category || "לא מקוטלג") === cat).length;
                  const label = resolveCategoryLabel(cat);

                  return (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`shrink-0 whitespace-nowrap px-3 py-2 sm:py-1.5 rounded-full text-sm border transition
                        ${
                          isActive
                            ? "bg-emerald-600 text-white border-emerald-500"
                            : "bg-[#0f141c] text-white/80 border-[#1f2a36] hover:border-white/20"
                        }`}
                      title={label}
                    >
                      {label} <span className="text-white/60">({count})</span>
                    </button>
                  );
                })}
              </div>
            </SectionCard>
          </div>

          {/* מוצרים */}
          {Object.keys(groupedByCategory).length === 0 ? (
            <SectionCard title={t({ ar: "المنتجات", he: "מוצרים" })}>
              <div className="text-[#8b93a7] text-sm py-6 text-center">
                {t({ ar: "لم يتم العثور على منتجات وفقًا للتصفية.", he: "לא נמצאו מוצרים בהתאם לסינון." })}
              </div>
            </SectionCard>
          ) : (
            Object.keys(groupedByCategory).map((category) => {
              const all = groupedByCategory[category];
              const isSearching = Boolean(query.trim());
              const shown = expandedCategories[category] || isSearching ? all : all.slice(0, CATEGORY_PREVIEW);
              return (
              <div key={category} className="mt-6">
                <SectionCard
                  title={`${resolveCategoryLabel(category)} (${all.length})`}
                  extra={
                    all.length > CATEGORY_PREVIEW && !isSearching ? (
                      <button
                        type="button"
                        onClick={() => setExpandedCategories((prev) => ({ ...prev, [category]: !prev[category] }))}
                        className="text-xs text-emerald-300 hover:text-emerald-200 py-1"
                      >
                        {expandedCategories[category]
                          ? t({ ar: "عرض أقل", he: "הצג פחות" })
                          : t({ ar: `عرض الكل (${all.length})`, he: `הצג הכל (${all.length})` })}
                      </button>
                    ) : null
                  }
                >
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                    {shown.map((product) => {
                      const inactive = !product.isActive;
                      return (
                        <div key={product._id} className="admin-product bg-[#0f141c] border border-[#1f2a36] rounded-xl overflow-hidden hover:border-white/20 transition">
                          {/* תמונה */}
                          <div className="admin-product__image relative h-40 bg-white">
                            {product.images?.length ? (
                              <img src={product.images[0]} alt={resolveName(product)} className="w-full h-full object-contain" loading="lazy" />
                            ) : (
                              <div className="w-full h-full grid place-items-center text-white/30 text-sm">
                                {t({ ar: "لا توجد صورة", he: "אין תמונה" })}
                              </div>
                            )}
                            {inactive && (
                              <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] grid place-items-center text-[12px]">
                                {t({ ar: "❌ غير متاح", he: "❌ לא זמין" })}
                              </div>
                            )}
                          </div>

                          {/* גוף הכרטיס */}
                          <div className="admin-product__body p-3 space-y-2 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <h3 className="text-sm font-semibold leading-snug line-clamp-2" title={resolveName(product)}>{resolveName(product)}</h3>
                              <span className="text-emerald-300 text-sm shrink-0">₪{product.price}</span>
                            </div>
                            {product.sku ? <div className="text-[11px] text-white/40 truncate">מק"ט: {product.sku}</div> : null}
                            {product.canManagePrivateProducts && <div className="text-xs text-amber-200/90 space-y-1" aria-label="מידע פרטי לבעלים">
                              <div>ספק: {product.ownerInfo?.supplier || "לא הוגדר"}</div>
                              <div>עלות שלי: {product.ownerInfo?.purchaseCost == null ? "לא הוזנה" : `₪${product.ownerInfo.purchaseCost} ${product.ownerInfo.costIncludesVat ? "כולל מע״מ" : "לפני מע״מ"}`}</div>
                              {product.automationLocked && <div>🔒 מחיר ותוכן נעולים · מלאי מתעדכן</div>}
                            </div>}
                            {product.inStock === false && <div className="text-xs text-rose-300">אזל מהמלאי</div>}

                            {/* פעולות */}
                            <div className="admin-product__actions grid grid-cols-3 gap-2 pt-1">
                              <button
                                onClick={() => setSelectedProduct(product)}
                                className="flex items-center justify-center gap-1 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-2 py-2 text-[12px]"
                                title={t({ ar: "تعديل المنتج", he: "ערוך מוצר" })}
                              >
                                <Pencil size={14} />
                                {t({ ar: "تعديل", he: "ערוך" })}
                              </button>
                              <button
                                onClick={() => handleDelete(product._id)}
                                className="flex items-center justify-center gap-1 bg-rose-600/90 hover:bg-rose-600 rounded-lg px-2 py-2 text-[12px]"
                                title={t({ ar: "حذف المنتج", he: "מחק מוצר" })}
                              >
                                <Trash2 size={14} />
                                {t({ ar: "حذف", he: "מחק" })}
                              </button>
                              <button
                                onClick={() => handleToggleActive(product._id, product.isActive)}
                                className={`flex items-center justify-center gap-1 rounded-lg px-2 py-2 text-[12px] ${product.isActive ? "bg-amber-500/90 hover:bg-amber-500" : "bg-emerald-600/90 hover:bg-emerald-600"}`}
                                title={product.isActive ? t({ ar: "إخفاء من القائمة", he: "הסתר מהתפריט" }) : t({ ar: "إظهار في القائمة", he: "הצג בתפריט" })}
                              >
                                {product.isActive ? <EyeOff size={14} /> : <Eye size={14} />}
                                {product.isActive ? t({ ar: "إخفاء", he: "הסתר" }) : t({ ar: "إظهار", he: "הצג" })}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </SectionCard>
              </div>
              );
            })
          )}

          {/* ===== השוואת תפריט (דונאט גלובלי) ===== */}
          <div className="mt-6">
            <SectionCard title={t({ ar: "مقارنة القائمة", he: "השוואת תפריט" })}>
              {/* תיאור קצר של המטרה */}
              <p className="text-xs text-white/60 mb-4">
                {t({
                  ar: "كل حلقة تعرض نسبة العناصر التي تم طلبها في الفئة من إجمالي العناصر المطلوبة هذا الشهر.",
                  he: "כל טבעת מציגה את אחוז הפריטים שהוזמנו בקטגוריה מתוך כלל הפריטים שהוזמנו החודש.",
                })}{" "}
                {t({ ar: "تعتمد البيانات على كمية العناصر (وليس على الإيرادات).", he: "הנתון מבוסס על כמות פריטים (לא על הכנסות)." })}
              </p>

              {statsLoading ? (
                <div className="py-10 flex items-center justify-center">
                  <Spinner size={40} />
                </div>
              ) : !donutData.length ? (
                <div className="text-[#8b93a7] text-sm py-6 text-center">{t({ ar: "لا توجد بيانات للعرض.", he: "אין נתונים להצגה." })}</div>
              ) : (
                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-6">
                  {donutData.map((d, idx) => {
                    const color = COLORS[idx % COLORS.length];
                    const restValue = d.total === 0 ? 1 : Math.max(0, d.total - d.value); // להשאיר טבעת גם כש‑total=0

                    return (
                      <div key={d.name} className="bg-[#111824] border border-[#1f2a36] rounded-2xl p-3 sm:p-5 flex flex-col items-center">
                        <div className="w-full h-[130px] sm:h-[220px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={[
                                  { name: d.name, value: d.value, fill: color },
                                  { name: restLabel, value: restValue, fill: REST },
                                ]}
                                dataKey="value"
                                innerRadius="65%"
                                outerRadius="90%"
                                stroke="none"
                                labelLine={false}
                              >
                                <Label
                                  content={({ viewBox }) => {
                                    const { cx, cy } = viewBox || {};
                                    return (
                                      <text
                                        x={cx}
                                        y={cy}
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        fill="#fff"
                                        style={{ fontSize: 20, fontWeight: 800 }}
                                      >
                                        {`${d.pct}%`}
                                      </text>
                                    );
                                  }}
                                />
                              </Pie>

                              <Tooltip
                                formatter={(val, name) => {
                                  if (name === d.name) {
                                    const pct = d.total ? Math.round((d.value / d.total) * 100) : 0;
                                    return [`${val} ${t({ ar: "عناصر", he: "פריטים" })} (${pct}%)`, d.name];
                                  }
                                  const rest = d.total ? d.total - d.value : 0;
                                  const pct = d.total ? Math.round((rest / d.total) * 100) : 0;
                                  return [`${rest} ${t({ ar: "عناصر", he: "פריטים" })} (${pct}%)`, restLabel];
                                }}
                                contentStyle={{ background: "#0f141c", border: "1px solid #1f2a36", borderRadius: 8 }}
                                itemStyle={{ color: "#fff" }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="mt-2 sm:mt-3 text-xs sm:text-base font-semibold text-white/90 text-center">{d.name}</div>
                      </div>
                    );
                  })}
                </div>
              )}
            </SectionCard>
          </div>
        </div>

      {/* מודלים */}
      {showModal && !selectedProduct && (
        <AddProductModal
          onClose={() => setShowModal(false)}
          onAdd={(newProduct) => {
            setProducts((prev) => [...prev, { ...newProduct, isActive: Boolean(newProduct.isActive) }]);
            setShowModal(false);
          }}
        />
      )}

      {selectedProduct && (
        <EditProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onUpdate={(updated) => {
            setProducts((prev) => prev.map((p) => (p._id === updated._id ? { ...updated, isActive: Boolean(updated.isActive) } : p)));
            setSelectedProduct(null);
          }}
        />
      )}
    </AdminLayout>
  );
}
