import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LayoutDashboard, Package, ClipboardList, Sparkles, TicketPercent, History, LogOut, Store, X } from "lucide-react";

export const ADMIN_LINKS = [
  { to: "/admin", label: "לוח בקרה", short: "בקרה", icon: LayoutDashboard },
  { to: "/admin/products", label: "מוצרים", short: "מוצרים", icon: Package },
  { to: "/admin/orders", label: "הזמנות", short: "הזמנות", icon: ClipboardList },
  { to: "/admin/deals", label: "דילים", short: "דילים", icon: Sparkles },
  { to: "/admin/coupons", label: "קופונים", short: "קופונים", icon: TicketPercent },
  { to: "/admin/history", label: "היסטוריה", short: "היסטוריה", icon: History }
];

const linkClass = ({ isActive }) =>
  `flex items-center gap-3 rounded-xl px-4 py-3 md:py-2 text-sm font-medium transition ${
    isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white hover:bg-white/5"
  }`;

/**
 * Admin navigation. `onClose` marks the mobile drawer version (shows a close
 * button); `className` sets how it's positioned (see AdminLayout).
 */
export default function SideMenu({ logoSrc, brand = "חנות SHDR", onClose, className = "" }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("shdr-token");
    localStorage.removeItem("shdr-role");
    localStorage.removeItem("shdr-auth-time");
    window.dispatchEvent(new Event("shdr-auth-changed"));
    onClose?.();
    navigate("/login", { replace: true });
  };

  return (
    <aside className={`w-72 bg-[#11131a] border-white/10 p-5 md:p-6 flex flex-col gap-6 overflow-y-auto ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoSrc ? (
            <img src={logoSrc} alt={brand} className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-ember" />
          )}
          <div>
            <div className="text-xs text-white/50">ניהול</div>
            <div className="text-sm font-semibold text-white">{brand}</div>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            className="grid place-items-center h-10 w-10 rounded-xl bg-white/5 text-white/70 hover:text-white"
            onClick={onClose}
            aria-label="סגור תפריט"
          >
            <X size={18} />
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-1">
        {ADMIN_LINKS.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === "/admin"} className={linkClass} onClick={onClose}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
        <NavLink to="/" className={linkClass} onClick={onClose}>
          <Store size={17} />
          חזרה לחנות
        </NavLink>
      </nav>

      <button
        type="button"
        onClick={handleLogout}
        className="mt-auto inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 md:py-2 text-sm font-medium text-white/70 transition hover:bg-white/10 hover:text-white"
      >
        <LogOut size={16} />
        התנתקות
      </button>
    </aside>
  );
}
