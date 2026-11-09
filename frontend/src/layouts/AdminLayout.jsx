import React, { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Menu, MoreHorizontal } from "lucide-react";
import SideMenu, { ADMIN_LINKS } from "./SideMenu";
import "./AdminLayout.css";

// Screens reachable in one tap from the phone tab bar; the rest are in "More".
const TAB_BAR_PATHS = ["/admin", "/admin/orders", "/admin/products", "/admin/history"];

/**
 * Shared admin page frame: sidebar on desktop, slide-in drawer + bottom tab
 * bar on phones, and a sticky top bar with the page title and actions.
 *   title / subtitle – top bar text
 *   actions          – buttons on the top bar's end (wrap below on phones)
 */
export default function AdminLayout({ title, subtitle, actions, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => setIsMenuOpen(false), [location.pathname]);

  useEffect(() => {
    if (!isMenuOpen) return undefined;
    const onKey = (event) => event.key === "Escape" && setIsMenuOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [isMenuOpen]);

  return (
    <div dir="rtl" className="admin-shell min-h-screen bg-[#0f141c] text-white flex">
      {/* Desktop sidebar */}
      <SideMenu logoSrc="/logo.jpeg" brand="SHDR" className="hidden md:flex sticky top-0 h-screen border-l shrink-0" />

      {/* Phone drawer */}
      <div
        className={`fixed inset-0 z-40 bg-black/60 transition-opacity md:hidden ${isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />
      <SideMenu
        logoSrc="/logo.jpeg"
        brand="SHDR"
        onClose={() => setIsMenuOpen(false)}
        className={`md:hidden fixed inset-y-0 right-0 z-50 h-[100dvh] max-w-[85vw] border-l shadow-2xl transition-transform duration-200 ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      />

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-30 bg-[#11131a]/95 backdrop-blur border-b border-white/10">
          <div className="px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-3 gap-y-2">
            <button
              type="button"
              className="md:hidden grid place-items-center h-10 w-10 rounded-xl bg-white/5 hover:bg-white/10 transition"
              onClick={() => setIsMenuOpen(true)}
              aria-label="פתח תפריט"
              aria-expanded={isMenuOpen}
            >
              <Menu size={20} />
            </button>
            <div className="min-w-0 flex-1">
              <h1 className="text-[17px] sm:text-[18px] font-bold tracking-tight truncate">{title}</h1>
              {subtitle && <p className="text-[11px] text-[#8b93a7] mt-0.5 truncate">{subtitle}</p>}
            </div>
            {actions && <div className="admin-actions flex items-center gap-2">{actions}</div>}
          </div>
        </header>

        <main className="flex-1 min-w-0 pb-24 md:pb-10">{children}</main>
      </div>

      {/* Phone tab bar */}
      <nav className="admin-tabbar md:hidden fixed bottom-0 inset-x-0 z-30 grid grid-cols-5 border-t border-white/10 bg-[#11131a]/95 backdrop-blur" aria-label="ניווט ניהול">
        {ADMIN_LINKS.filter(({ to }) => TAB_BAR_PATHS.includes(to)).map(({ to, short, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/admin"}
            className={({ isActive }) =>
              `flex flex-col items-center justify-center gap-1 py-2 text-[11px] ${isActive ? "text-emerald-300" : "text-white/60"}`
            }
          >
            <Icon size={20} />
            {short}
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setIsMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-2 text-[11px] text-white/60"
        >
          <MoreHorizontal size={20} />
          עוד
        </button>
      </nav>
    </div>
  );
}
