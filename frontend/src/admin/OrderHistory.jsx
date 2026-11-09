import React, { useEffect, useState } from "react";
import { useLang } from "../context/LangContext";
import api from "../api";
import AdminLayout from "../layouts/AdminLayout";
import { ChevronDown } from "lucide-react";

/* ---------- helpers ---------- */
const formatDateParts = (timestamp) => {
  // Normalize to Asia/Jerusalem for consistency with other pages
  const d = new Date(new Date(timestamp).toLocaleString("en-US", { timeZone: "Asia/Jerusalem" }));
  const date = d.toLocaleDateString("he-IL");
  const time = d.toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
};

const translatePaymentMethod = (method) =>
  method === "Card"
    ? "כרטיס אשראי"
    : method === "Cash"
      ? "מזומן"
      : method === "Bit"
        ? "ביט"
        : method === "GOOGLE_PAY"
          ? "גוגל פיי"
          : method === "APPLE_PAY"
            ? "אפל פיי"
            : method || " לא ידוע";

const getOrderHistory = async () => {
  const token = localStorage.getItem("token");
  const response = await api.get(`/api/orders/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

/* ---------- page ---------- */
export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const { lang, t } = useLang();
  const resolveOrderItemName = (item) => {
    const product = item?.product || {};
    return lang === "en"
      ? product.name_en ?? item.name_en ?? product.name ?? item.name ?? item.title ?? "Unknown"
      : product.name_he ?? item.name_he ?? product.name ?? item.name ?? item.title ?? "לא ידוע";
  };
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // initial fetch + default today range
  useEffect(() => {
    (async () => {
      try {
        const data = await getOrderHistory();
        setOrders(Array.isArray(data) ? data : []);
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        const today = now.toISOString().split("T")[0];
        setFromDate(today);
        setToDate(today);
        setLoading(false);
      } catch (err) {
        setError(err?.message || "שגיאה בטעינת הנתונים");
        setLoading(false);
      }
    })();
  }, []);

  const filteredOrders = orders.filter((order) => {
    const ymd = new Date(order.createdAt).toISOString().split("T")[0];
    return (!fromDate || ymd >= fromDate) && (!toDate || ymd <= toDate);
  });

  if (loading) return <div className="min-h-screen bg-[#0f1415] text-white grid place-items-center">{t({ ar: "جارٍ التحميل...", he: "טוען…" })}</div>;
  if (error) return <div className="min-h-screen bg-[#0f1415] text-red-300 grid place-items-center">{t({ ar: "خطأ:", he: "שגיאה:" })} {error}</div>;

  return (
    <AdminLayout
      title={t({ ar: "سجل الطلبات", he: "היסטוריית הזמנות" })}
      subtitle={t({ ar: "عرض الطلبات حسب الفترة", he: "צפייה בהזמנות לפי טווח תאריכים" })}
    >
        <div className="px-4 md:px-6 mt-4 space-y-4">
          {/* Filters card */}
          <section className="bg-[#17181d] border border-white/10 rounded-2xl p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                <span className="text-white/80 shrink-0">{t({ ar: "من تاريخ:", he: "מתאריך:" })}</span>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </label>

              <label className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-sm">
                <span className="text-white/80 shrink-0">{t({ ar: "حتى تاريخ:", he: "עד תאריך:" })}</span>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full rounded-xl bg-white/5 border border-white/10 px-3 py-2 outline-none focus:ring-2 focus:ring-emerald-500/30"
                />
              </label>

              <div className="flex items-center text-xs text-white/50">
                {t({ ar: "الإجمالي في الفترة:", he: "סה״כ בטווח:" })} <span className="ms-2 text-white/80 font-semibold">{filteredOrders.length}</span>
              </div>
            </div>
          </section>

          {/* Phones: one card per order */}
          <div className="md:hidden space-y-3">
            {filteredOrders.length === 0 ? (
              <p className="rounded-2xl border border-white/10 bg-[#17181d] px-4 py-8 text-center text-white/60">
                {t({ ar: "لا توجد طلبات في الفترة المحددة.", he: "אין הזמנות בטווח התאריכים שנבחר." })}
              </p>
            ) : (
              filteredOrders.map((order) => {
                const { date, time } = formatDateParts(order.createdAt);
                const isOpen = expandedOrderId === order._id;
                return (
                  <article key={order._id} className="rounded-2xl border border-white/10 bg-[#17181d] p-4">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-3 text-start"
                      onClick={() => setExpandedOrderId(isOpen ? null : order._id)}
                      aria-expanded={isOpen}
                    >
                      <div className="min-w-0">
                        <div className="font-semibold">#{order._id.slice(-6)}</div>
                        <div className="text-xs text-white/50 mt-0.5">{date} · {time}</div>
                      </div>
                      <span className="flex items-center gap-1 text-sm text-white/70">
                        {isOpen ? t({ ar: "إخفاء", he: "הסתר" }) : t({ ar: "تفاصيل", he: "פרטים" })}
                        <ChevronDown size={15} className={isOpen ? "rotate-180" : ""} />
                      </span>
                    </button>
                    {isOpen && (
                      <div className="mt-3 border-t border-white/10 pt-3">
                        <HistoryDetails order={order} t={t} resolveOrderItemName={resolveOrderItemName} />
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>

          {/* Table card */}
          <section className="hidden md:block rounded-2xl overflow-hidden shadow-lg border border-white/10">
            <div className="overflow-x-auto">
              <table className="min-w-[680px] w-full text-sm">
                <thead className="bg-emerald-500 text-emerald-50">
                  <tr className="text-right">
                    <th className="px-4 py-3 font-semibold">{t({ ar: "رقم الطلب", he: "מס׳ הזמנה" })}</th>
                    <th className="px-4 py-3 font-semibold">{t({ ar: "التاريخ", he: "תאריך" })}</th>
                    <th className="px-4 py-3 font-semibold">{t({ ar: "الوقت", he: "שעה" })}</th>
                    <th className="px-4 py-3 font-semibold">{t({ ar: "الإجراءات", he: "פעולות" })}</th>
                  </tr>
                </thead>
                <tbody className="bg-[#17181d] divide-y divide-white/10">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-5 py-8 text-white/60 text-center">
                        {t({ ar: "لا توجد طلبات في الفترة المحددة.", he: "אין הזמנות בטווח התאריכים שנבחר." })}
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((order) => {
                      const { date, time } = formatDateParts(order.createdAt);
                      return (
                        <React.Fragment key={order._id}>
                          <tr className="text-right">
                            <td className="px-4 py-3 text-white/80">#{order._id.slice(-6)}</td>
                            <td className="px-4 py-3 text-white/80">{date}</td>
                            <td className="px-4 py-3 text-white/60">{time}</td>
                            <td className="px-4 py-3">
                              <button
                                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs"
                                onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                              >
                                {expandedOrderId === order._id
                                  ? t({ ar: "إخفاء التفاصيل", he: "הסתר פרטים" })
                                  : t({ ar: "المزيد من التفاصيل", he: "עוד פרטים" })}
                              </button>
                            </td>
                          </tr>

                          {/* Expanded row */}
                          {expandedOrderId === order._id && (
                            <tr className="bg-white/5">
                              <td colSpan={4} className="p-4">
                                <HistoryDetails order={order} t={t} resolveOrderItemName={resolveOrderItemName} />
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

          {/* Footer line */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-white/50 text-[12px]">
            <div>
              טווח נוכחי: {fromDate || "—"} עד {toDate || "—"} · סה״כ בטווח: {filteredOrders.length}
            </div>
            <div className="text-white/40">מועדון SHDR</div>
          </div>
        </div>
    </AdminLayout>
  );
}

function HistoryDetails({ order, t, resolveOrderItemName }) {
  return (
    <div className="grid md:grid-cols-3 gap-4 text-sm">
      <div className="space-y-1">
        <div>
          <strong>{t({ ar: "المستخدم:", he: "משתמש:" })}</strong>{" "}
          {order.user ? order.user.name : order.customerName || t({ ar: "ضيف", he: "אורח" })}
        </div>
        <div>
          <strong>{t({ ar: "هاتف:", he: "טלפון:" })}</strong> {order.user ? order.user.phone : order.phone || "—"}
        </div>
        <div>
          <strong>{t({ ar: "المبلغ:", he: "סכום לתשלום:" })}</strong>{" "}
          {order.totalPrice ? `₪${order.totalPrice}` : t({ ar: "غير متاح", he: "לא זמין" })}
        </div>
        <div>
          <strong>{t({ ar: "طريقة الدفع:", he: "אמצעי תשלום:" })}</strong>{" "}
          {translatePaymentMethod(order.paymentDetails?.method || order.paymentMethod || order.payment?.method)}
        </div>
      </div>

      <div className="md:col-span-2">
        <h4 className="font-semibold mb-2">{t({ ar: "تفاصيل الطلب", he: "פרטי ההזמנה" })}</h4>
        <ul className="space-y-2">
          {Array.isArray(order.items) &&
            order.items.map((item, idx) => {
              const hasVegetables = Array.isArray(item.vegetables) && item.vegetables.length;
              const hasAdditions = Array.isArray(item.additions) && item.additions.length;
              const hasMeta = hasVegetables || hasAdditions || item.comment;

              return (
                <li key={idx} className="leading-6">
                  <strong>{resolveOrderItemName(item)}</strong> — כמות: {item.quantity}{" "}
                  {item.isWeighted ? "גרם" : ""}
                  {hasMeta ? (
                    <div className="text-white/70">
                      {hasVegetables ? `ירקות: ${item.vegetables.join(", ")}` : ""}
                      {hasVegetables && hasAdditions ? " · " : ""}
                      {hasAdditions ? `תוספות: ${item.additions.map((a) => a.addition).join(", ")}` : ""}
                      {item.comment ? ` · הערות: ${item.comment}` : ""}
                    </div>
                  ) : null}
                </li>
              );
            })}
        </ul>
      </div>
    </div>
  );
}
