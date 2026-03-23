import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, Package, ClipboardList, Sparkles, TicketPercent, History } from "lucide-react";

const links = [
  { to: "/admin", label: "לוח בקרה", icon: LayoutDashboard },
  { to: "/admin/products", label: "מוצרים", icon: Package },
  { to: "/admin/orders", label: "הזמנות", icon: ClipboardList },
  { to: "/admin/deals", label: "דילים", icon: Sparkles },
  { to: "/admin/coupons", label: "קופונים", icon: TicketPercent },
  { to: "/admin/history", label: "היסטוריה", icon: History }
];

export default function SideMenu({ logoSrc, brand = "חנות SHDR", onClose }) {
  return (
    <aside className="w-72 h-full bg-[#11131a] border-r border-white/10 p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {logoSrc ? (
            <img src={logoSrc} alt={brand} className="h-10 w-10 rounded-xl object-cover" />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-ember" />
          )}
          <div>
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">ניהול</div>
            <div className="text-sm font-semibold text-white">{brand}</div>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            className="rounded-lg bg-white/5 px-2 py-1 text-xs text-white/70"
            onClick={onClose}
          >
            סגור
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-2">
        {links.map((link) => {
          const Icon = link.icon;
          return (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.to === "/admin"}
            className={({ isActive }) =>
              `rounded-xl px-4 py-2 text-sm font-medium transition ${
                isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
              }`
            }
          >
            <span className="inline-flex items-center gap-2">
              <Icon size={16} />
              {link.label}
            </span>
          </NavLink>
          );
        })}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `rounded-xl px-4 py-2 text-sm font-medium transition ${
              isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
            }`
          }
        >
          חזרה לחנות
        </NavLink>
      </nav>
    </aside>
  );
}
