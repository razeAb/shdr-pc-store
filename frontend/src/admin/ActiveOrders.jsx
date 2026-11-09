import React, { useEffect, useMemo, useState } from "react";
import { ChevronDown, ClipboardList } from "lucide-react";
import api from "../api";
import AdminLayout from "../layouts/AdminLayout";
import { formatCurrency } from "../utils/format.js";
import { useLang } from "../context/LangContext.jsx";

const ACTIVE_STATUSES = new Set(["pending", "paid", "shipped"]);

const formatDateParts = (timestamp) => {
  const d = new Date(new Date(timestamp).toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
  const date = d.toLocaleDateString("he-IL");
  const time = d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
};

const statusLabel = (status) => {
  if (status === "pending") return { ar: "قيد الانتظار", he: "ממתין" };
  if (status === "paid") return { ar: "مدفوع", he: "שולם" };
  if (status === "shipped") return { ar: "قيد التوصيل", he: "במשלוח" };
  if (status === "delivered") return { ar: "تم التسليم", he: "נמסר" };
  if (status === "failed") return { ar: "فشل", he: "נכשל" };
  return { ar: status || "غير معروف", he: status || "לא ידוע" };
};

export default function ActiveOrders() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const { t } = useLang();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");
        const res = await api.get("/api/orders/admin/all", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setOrders(Array.isArray(res.data) ? res.data : []);
        setError("");
      } catch (err) {
        setError(err?.message || t({ ar: "خطأ في تحميل الطلبات", he: "שגיאה בטעינת ההזמנות" }));
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const markDone = async (orderId) => {
    const token = localStorage.getItem("token");
    if (!token) return;
    setUpdatingId(orderId);
    try {
      await api.patch(
        `/api/orders/${orderId}/status`,
        { status: "delivered" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders((prev) => prev.map((order) => (order._id === orderId ? { ...order, status: "delivered" } : order)));
    } catch (err) {
      setError(err?.message || t({ ar: "خطأ في تحديث الطلب", he: "שגיאה בעדכון ההזמנה" }));
    } finally {
      setUpdatingId(null);
    }
  };

  const activeOrders = useMemo(
    () => orders.filter((order) => ACTIVE_STATUSES.has(order.status)),
    [orders]
  );

  if (loading) return <div className="min-h-screen bg-[#0f1415] text-white grid place-items-center">{t({ ar: "جارٍ التحميل...", he: "טוען…" })}</div>;
  if (error) return <div className="min-h-screen bg-[#0f1415] text-red-300 grid place-items-center">{t({ ar: "خطأ:", he: "שגיאה:" })} {error}</div>;

  return (
    <AdminLayout
      title={t({ ar: "الطلبات النشطة", he: "הזמנות פעילות" })}
      subtitle={t({ ar: "إدارة الطلبات الجارية", he: `ניהול הזמנות בתהליך · ${activeOrders.length} הזמנות` })}
    >
        <div className="px-4 md:px-6 mt-4 space-y-4">
          {/* Phones: one card per order */}
          <div className="md:hidden space-y-3">
            {activeOrders.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-[#17181d] px-4 py-8 text-center text-white/60">
                {t({ ar: "لا توجد طلبات نشطة حاليًا.", he: "אין הזמנות פעילות כרגע." })}
              </p>
            ) : (
              activeOrders.map((order) => {
                const { date, time } = formatDateParts(order.createdAt);
                const isOpen = expandedOrderId === order._id;
                return (
                  <article key={order._id} className="rounded-2xl border border-white/10 bg-[#17181d] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs text-white/50">#{order._id.slice(-6)} · {date} · {time}</div>
                        <div className="mt-1 font-semibold truncate">{order.customer?.fullName || t({ ar: "ضيف", he: "אורח" })}</div>
                      </div>
                      <div className="text-end shrink-0">
                        <div className="font-bold">{formatCurrency(order.total || 0)}</div>
                        <span className="mt-1 inline-block rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs text-emerald-300">
                          {t(statusLabel(order.status))}
                        </span>
                      </div>
                    </div>
                    {isOpen && <OrderDetails order={order} t={t} />}
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        className="flex items-center justify-center gap-1 rounded-xl bg-white/5 py-2.5 text-sm"
                        onClick={() => setExpandedOrderId(isOpen ? null : order._id)}
                        aria-expanded={isOpen}
                      >
                        {isOpen ? t({ ar: "إخفاء التفاصيل", he: "הסתר פרטים" }) : t({ ar: "المزيد من التفاصيل", he: "עוד פרטים" })}
                        <ChevronDown size={15} className={isOpen ? "rotate-180" : ""} />
                      </button>
                      <button
                        className="rounded-xl bg-emerald-500/90 py-2.5 text-sm font-semibold text-emerald-50 disabled:opacity-60"
                        onClick={() => markDone(order._id)}
                        disabled={updatingId === order._id}
                      >
                        {updatingId === order._id ? t({ ar: "جارٍ التحديث...", he: "מעדכן…" }) : t({ ar: "تم", he: "סיום" })}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <section className="hidden md:block rounded-2xl overflow-hidden shadow-lg border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-[720px] w-full text-base">
                <thead className="bg-emerald-500 text-emerald-50 text-base">
                  <tr className="text-right">
                    <th className="px-4 py-3 font-semibold">{t({ ar: "رقم الطلب", he: "מס׳ הזמנה" })}</th>
                    <th className="px-4 py-3 font-semibold">{t({ ar: "التاريخ", he: "תאריך" })}</th>
                    <th className="px-4 py-3 font-semibold">{t({ ar: "اسم العميل", he: "שם לקוח" })}</th>
                    <th className="px-4 py-3 font-semibold">{t({ ar: "الحالة", he: "סטטוס" })}</th>
                    <th className="px-4 py-3 font-semibold">{t({ ar: "المبلغ", he: "סכום" })}</th>
                    <th className="px-4 py-3 font-semibold">{t({ ar: "الإجراءات", he: "פעולות" })}</th>
                  </tr>
                </thead>
                <tbody className="bg-[#17181d] divide-y divide-white/10 text-base">
                  {activeOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-5 py-8 text-white/60 text-center">
                        {t({ ar: "لا توجد طلبات نشطة حاليًا.", he: "אין הזמנות פעילות כרגע." })}
                      </td>
                    </tr>
                  ) : (
                    activeOrders.map((order) => {
                      const { date, time } = formatDateParts(order.createdAt);
                      return (
                        <React.Fragment key={order._id}>
                          <tr className="text-right">
                            <td className="px-4 py-3 text-white/80">#{order._id.slice(-6)}</td>
                            <td className="px-4 py-3 text-white/60">
                              {date} · {time}
                            </td>
                            <td className="px-4 py-3 text-white/80">{order.customer?.fullName || t({ ar: "ضيف", he: "אורח" })}</td>
                            <td className="px-4 py-3 text-emerald-300">{t(statusLabel(order.status))}</td>
                            <td className="px-4 py-3 text-white/80">{formatCurrency(order.total || 0)}</td>
                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                <button
                                  className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs"
                                  onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                                >
                                  {expandedOrderId === order._id
                                    ? t({ ar: "إخفاء التفاصيل", he: "הסתר פרטים" })
                                    : t({ ar: "المزيد من التفاصيل", he: "עוד פרטים" })}
                                </button>
                                <button
                                  className="px-3 py-1.5 rounded-lg bg-emerald-500/90 hover:bg-emerald-500 text-emerald-50 text-xs disabled:opacity-60"
                                  onClick={() => markDone(order._id)}
                                  disabled={updatingId === order._id}
                                >
                                  {updatingId === order._id
                                    ? t({ ar: "جارٍ التحديث...", he: "מעדכן…" })
                                    : t({ ar: "تم", he: "סיום" })}
                                </button>
                              </div>
                            </td>
                          </tr>

                          {expandedOrderId === order._id && (
                            <tr className="bg-white/5">
                              <td colSpan={6} className="p-4">
                                <OrderDetails order={order} t={t} />
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
    </AdminLayout>
  );
}

function OrderDetails({ order, t }) {
  return (
    <div className="mt-3 md:mt-0 grid md:grid-cols-3 gap-4 text-sm md:text-base">
      <div className="space-y-1 break-words">
        <div>
          <strong>{t({ ar: "هاتف:", he: "טלפון:" })}</strong>{" "}
          {order.customer?.phone ? <a className="text-emerald-300" href={`tel:${order.customer.phone}`}>{order.customer.phone}</a> : "—"}
        </div>
        <div>
          <strong>{t({ ar: "بريد:", he: "אימייל:" })}</strong> {order.customer?.email || "—"}
        </div>
        <div>
          <strong>{t({ ar: "عنوان:", he: "כתובת:" })}</strong> {order.customer?.address || "—"}
        </div>
        <div>
          <strong>{t({ ar: "مدينة:", he: "עיר:" })}</strong> {order.customer?.city || "—"}
        </div>
      </div>
      <div className="md:col-span-2">
        <h4 className="font-semibold mb-2">{t({ ar: "تفاصيل الطلب", he: "פרטי ההזמנה" })}</h4>
        <ul className="space-y-2">
          {(order.items || []).map((item) => (
            <li key={`${order._id}-${item.productId}`} className="flex justify-between gap-3">
              <span className="text-white/80 min-w-0">{item.title}</span>
              <span className="text-white/60 shrink-0">
                {item.qty} × {formatCurrency(item.price)}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
