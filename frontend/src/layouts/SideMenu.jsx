import React from "react";
import { NavLink } from "react-router-dom";

const links = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/products", label: "Products" },
  { to: "/admin/orders", label: "Orders" },
  { to: "/admin/deals", label: "Deals" },
  { to: "/admin/coupons", label: "Coupons" },
  { to: "/admin/history", label: "History" }
];

export default function SideMenu({ logoSrc, brand = "SHDR Store", onClose }) {
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
            <div className="text-xs uppercase tracking-[0.3em] text-white/50">Admin</div>
            <div className="text-sm font-semibold text-white">{brand}</div>
          </div>
        </div>
        {onClose && (
          <button
            type="button"
            className="rounded-lg bg-white/5 px-2 py-1 text-xs text-white/70"
            onClick={onClose}
          >
            Close
          </button>
        )}
      </div>

      <nav className="flex flex-col gap-2 flex-1">
        {links.map((link) => (
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
            {link.label}
          </NavLink>
        ))}
      </nav>

      <NavLink
        to="/"
        className={({ isActive }) =>
          `rounded-xl px-4 py-2 text-sm font-medium transition ${
            isActive ? "bg-white/10 text-white" : "text-white/60 hover:text-white"
          }`
        }
      >
        Back to Store
      </NavLink>
    </aside>
  );
}
