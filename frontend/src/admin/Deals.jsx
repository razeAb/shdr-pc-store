import React, { useEffect, useState } from "react";
import { Plus, Trash2, RefreshCcw } from "lucide-react";
import api from "../api";
import AdminLayout from "../layouts/AdminLayout";

const emptyForm = {
  title: "",
  description: "",
  imageUrl: "",
  sortOrder: "0",
  basePrice: "",
  discountedPrice: "",
  isActive: true,
};

export default function Deals() {
  const [deals, setDeals] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [imageFile, setImageFile] = useState(null);

  const token = localStorage.getItem("token");

  const fetchDeals = async () => {
    try {
      setIsLoading(true);
      setError("");
      const res = await api.get("/api/deals/admin", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeals(res.data?.deals || []);
    } catch (err) {
      console.error(err);
      setError(err?.message || "שגיאה בטעינת מבצעים");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDeals();
  }, []);

  const uploadFile = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    const uploadRes = await api.post("/api/upload", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return uploadRes.data.url;
  };

  const handleImageUpload = async () => {
    if (!imageFile) return;
    setIsSaving(true);
    setStatus("");
    setError("");
    try {
      const url = await uploadFile(imageFile);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      setImageFile(null);
      setStatus("התמונה הועלתה בהצלחה");
    } catch (err) {
      console.error(err);
      setError(err?.message || "שגיאה בהעלאת תמונה");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddDeal = async () => {
    setIsSaving(true);
    setStatus("");
    setError("");
    try {
      const payload = {
        title: form.title,
        description: form.description,
        imageUrl: form.imageUrl,
        sortOrder: Number(form.sortOrder) || 0,
        basePrice: form.basePrice,
        discountedPrice: form.discountedPrice,
        isActive: form.isActive,
      };
      const res = await api.post("/api/deals", payload, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeals((prev) => [res.data.deal, ...prev]);
      setForm(emptyForm);
      setImageFile(null);
      setIsAddOpen(false);
      setStatus("המבצע נוסף בהצלחה");
    } catch (err) {
      console.error(err);
      setError(err?.message || "שגיאה בהוספת מבצע");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateDeal = async (id, updates) => {
    setStatus("");
    setError("");
    try {
      const res = await api.put(`/api/deals/${id}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeals((prev) =>
        prev.map((deal) => (deal._id === id ? res.data.deal : deal)),
      );
      setStatus("המבצע עודכן");
    } catch (err) {
      console.error(err);
      setError(err?.message || "שגיאה בעדכון מבצע");
    }
  };

  const handleRemoveDeal = async (id) => {
    setStatus("");
    setError("");
    try {
      await api.delete(`/api/deals/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeals((prev) => prev.filter((deal) => deal._id !== id));
      setStatus("המבצע הוסר");
    } catch (err) {
      console.error(err);
      setError(err?.message || "שגיאה במחיקת מבצע");
    }
  };

  return (
    <AdminLayout
      title="מבצעים"
      subtitle="ניהול הקרוסלה בראש דף הבית"
      actions={
        <button
          type="button"
          onClick={() => setIsAddOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-sm font-semibold"
        >
          <Plus size={16} />
          הוסף מבצע
        </button>
      }
    >
        <div className="px-4 sm:px-6 pt-4 space-y-6">
          {(status || error) && (
            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                status
                  ? "border-emerald-500/40 bg-emerald-500/10"
                  : "border-rose-500/40 bg-rose-500/10"
              }`}
            >
              {status || error}
            </div>
          )}

          <section className="bg-[#111824] border border-[#1f2a36] rounded-2xl p-4 sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold">מבצעים קיימים</h2>
              <button
                type="button"
                onClick={fetchDeals}
                className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm flex items-center gap-2"
              >
                <RefreshCcw size={14} />
                רענן
              </button>
            </div>

            {isLoading ? (
              <div className="text-sm text-white/60">טוען מבצעים...</div>
            ) : deals.length === 0 ? (
              <div className="text-sm text-white/60">אין מבצעים להציג.</div>
            ) : (
              <div className="space-y-3">
                {deals.map((deal) => (
                  <div
                    key={deal._id}
                    className="grid grid-cols-1 md:grid-cols-[120px_1fr_auto] gap-3 items-center bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  >
                    <img
                      src={deal.imageUrl}
                      alt={deal.title || "deal"}
                      className="h-32 w-full md:h-16 md:w-28 rounded-lg object-cover border border-white/10"
                    />
                    <div className="space-y-2">
                      <input
                        value={deal.title || ""}
                        onChange={(e) =>
                          setDeals((prev) =>
                            prev.map((item) =>
                              item._id === deal._id
                                ? { ...item, title: e.target.value }
                                : item,
                            ),
                          )
                        }
                        onBlur={(e) =>
                          handleUpdateDeal(deal._id, { title: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#0f141c] border border-white/10 focus:border-emerald-400 outline-none text-sm"
                        placeholder="כותרת"
                      />
                      <textarea
                        value={deal.description || ""}
                        onChange={(e) =>
                          setDeals((prev) =>
                            prev.map((item) =>
                              item._id === deal._id
                                ? { ...item, description: e.target.value }
                                : item,
                            ),
                          )
                        }
                        onBlur={(e) =>
                          handleUpdateDeal(deal._id, { description: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-lg bg-[#0f141c] border border-white/10 focus:border-emerald-400 outline-none text-sm min-h-[90px]"
                        placeholder="תיאור קצר"
                      />
                      <div className="flex flex-wrap items-center gap-2 text-sm text-white/70">
                        <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
                          העלה תמונה
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              try {
                                const url = await uploadFile(file);
                                await handleUpdateDeal(deal._id, { imageUrl: url });
                              } catch (err) {
                                console.error(err);
                                setError(err?.message || "שגיאה בהעלאת תמונה");
                              }
                            }}
                          />
                        </label>
                        <span className="text-xs text-white/50">התמונה תעודכן מיד</span>
                      </div>
                      <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-3 sm:gap-4 text-sm text-white/70">
                        <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          מחיר בסיס:
                          <input
                            type="number"
                            value={deal.basePrice ?? ""}
                            onChange={(e) => {
                              const basePrice = e.target.value;
                              setDeals((prev) =>
                                prev.map((item) =>
                                  item._id === deal._id
                                    ? { ...item, basePrice }
                                    : item,
                                ),
                              );
                            }}
                            onBlur={(e) =>
                              handleUpdateDeal(deal._id, {
                                basePrice: e.target.value,
                              })
                            }
                            className="w-full sm:w-24 px-2 py-1.5 rounded-lg bg-[#0f141c] border border-white/10 focus:border-emerald-400 outline-none text-sm"
                          />
                        </label>
                        <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          מחיר מבצע:
                          <input
                            type="number"
                            value={deal.discountedPrice ?? ""}
                            onChange={(e) => {
                              const discountedPrice = e.target.value;
                              setDeals((prev) =>
                                prev.map((item) =>
                                  item._id === deal._id
                                    ? { ...item, discountedPrice }
                                    : item,
                                ),
                              );
                            }}
                            onBlur={(e) =>
                              handleUpdateDeal(deal._id, {
                                discountedPrice: e.target.value,
                              })
                            }
                            className="w-full sm:w-24 px-2 py-1.5 rounded-lg bg-[#0f141c] border border-white/10 focus:border-emerald-400 outline-none text-sm"
                          />
                        </label>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={Boolean(deal.isActive)}
                            onChange={(e) => {
                              const isActive = e.target.checked;
                              setDeals((prev) =>
                                prev.map((item) =>
                                  item._id === deal._id
                                    ? { ...item, isActive }
                                    : item,
                                ),
                              );
                              handleUpdateDeal(deal._id, { isActive });
                            }}
                          />
                          פעיל
                        </label>
                        <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                          סדר:
                          <input
                            type="number"
                            value={deal.sortOrder ?? 0}
                            onChange={(e) => {
                              const sortOrder = e.target.value;
                              setDeals((prev) =>
                                prev.map((item) =>
                                  item._id === deal._id
                                    ? { ...item, sortOrder }
                                    : item,
                                ),
                              );
                            }}
                            onBlur={(e) =>
                              handleUpdateDeal(deal._id, {
                                sortOrder: e.target.value,
                              })
                            }
                            className="w-full sm:w-24 px-2 py-1.5 rounded-lg bg-[#0f141c] border border-white/10 focus:border-emerald-400 outline-none text-sm"
                          />
                        </label>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDeal(deal._id)}
                      className="p-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-rose-300 justify-self-start md:justify-self-end"
                      aria-label="הסר"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

      {isAddOpen && (
            <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 sm:p-4" onClick={() => setIsAddOpen(false)}>
              <div
                className="w-full max-w-2xl max-h-[92dvh] overflow-y-auto bg-[#111824] border border-[#1f2a36] rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 text-white"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">הוספת מבצע</h2>
                    <p className="text-xs text-white/60 mt-1">
                      הוסף תמונה, כותרת, מחירים וסדר תצוגה
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="text-white/60 hover:text-white"
                    aria-label="סגור"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                    className="px-3 py-2 rounded-lg bg-[#0f141c] border border-white/10 focus:border-emerald-400 outline-none"
                    placeholder="כותרת"
                  />
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    className="px-3 py-2 rounded-lg bg-[#0f141c] border border-white/10 focus:border-emerald-400 outline-none md:col-span-2 min-h-[90px]"
                    placeholder="תיאור קצר"
                  />
                  <div className="flex flex-col gap-2 md:col-span-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <label className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 cursor-pointer">
                        העלה תמונה
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={handleImageUpload}
                        disabled={!imageFile || isSaving}
                        className="px-3 py-2 rounded-lg bg-emerald-500/20 border border-emerald-400/40 text-sm text-emerald-200 disabled:opacity-60"
                      >
                        {isSaving ? "מעלה..." : "שמור תמונה"}
                      </button>
                    </div>
                    {form.imageUrl ? (
                      <div className="text-xs text-white/50 break-all">
                        {form.imageUrl}
                      </div>
                    ) : null}
                  </div>
                  <input
                    type="number"
                    value={form.sortOrder}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, sortOrder: e.target.value }))
                    }
                    className="px-3 py-2 rounded-lg bg-[#0f141c] border border-white/10 focus:border-emerald-400 outline-none"
                    placeholder="סדר תצוגה"
                  />
                  <input
                    type="number"
                    value={form.basePrice}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, basePrice: e.target.value }))
                    }
                    className="px-3 py-2 rounded-lg bg-[#0f141c] border border-white/10 focus:border-emerald-400 outline-none"
                    placeholder="מחיר בסיס"
                  />
                  <input
                    type="number"
                    value={form.discountedPrice}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        discountedPrice: e.target.value,
                      }))
                    }
                    className="px-3 py-2 rounded-lg bg-[#0f141c] border border-white/10 focus:border-emerald-400 outline-none"
                    placeholder="מחיר מבצע"
                  />
                  <label className="flex items-center gap-2 text-sm text-white/70">
                    <input
                      type="checkbox"
                      checked={form.isActive}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          isActive: e.target.checked,
                        }))
                      }
                    />
                    פעיל
                  </label>
                </div>

                <div className="sticky bottom-0 -mx-5 sm:mx-0 px-5 sm:px-0 py-3 bg-[#111824] flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddOpen(false)}
                    className="px-4 py-2 rounded-xl border border-white/10 text-sm text-white/70 hover:text-white"
                  >
                    ביטול
                  </button>
                  <button
                    type="button"
                    onClick={handleAddDeal}
                    disabled={isSaving}
                    className="px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-400/40 text-sm text-emerald-200 disabled:opacity-60"
                  >
                    {isSaving ? "שומר..." : "שמור מבצע"}
                  </button>
                </div>
              </div>
            </div>
      )}
    </AdminLayout>
  );
}
