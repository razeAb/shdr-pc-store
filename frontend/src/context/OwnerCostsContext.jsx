import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import api from "../api";

const OwnerCostsContext = createContext({ isOwner: false, visible: false, costs: {}, busy: false, error: "", toggle: () => {} });

function readSession() {
  const token = localStorage.getItem("shdr-token") || localStorage.getItem("token") || "";
  const authTime = Number(localStorage.getItem("shdr-auth-time") || 0);
  const expiresAt = authTime ? authTime + 60 * 60 * 1000 : 0;
  return { token: expiresAt && expiresAt <= Date.now() ? "" : token, expiresAt };
}

export function OwnerCostsProvider({ children }) {
  const { pathname } = useLocation();
  const [session, setSession] = useState(readSession);
  const [access, setAccess] = useState(null);
  const [view, setView] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(null);
  const generation = useRef(0);

  useEffect(() => {
    const sync = () => {
      const next = readSession();
      setSession((old) => old.token === next.token && old.expiresAt === next.expiresAt ? old : next);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    window.addEventListener("shdr-auth-changed", sync);
    const timer = session.expiresAt > Date.now() ? window.setTimeout(sync, session.expiresAt - Date.now()) : null;
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.removeEventListener("shdr-auth-changed", sync);
      window.clearTimeout(timer);
    };
  }, [pathname, session.expiresAt]);

  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    generation.current += 1;
    request.current?.abort();
    setAccess(null); setView(null); setBusy(false); setError("");
    if (session.token) {
      api.get("/api/products/owner/access", { signal: controller.signal, headers: { Authorization: `Bearer ${session.token}` } })
        .then(({ data }) => { if (active && data.canManagePrivateProducts === true) setAccess(session.token); })
        .catch(() => {});
    }
    return () => { active = false; controller.abort(); generation.current += 1; request.current?.abort(); };
  }, [session.token]);

  // Also check current storage, so account changes cannot reuse an old view before effects run.
  const isOwner = !!session.token && access === session.token && readSession().token === session.token;
  const visible = isOwner && view?.token === session.token;

  async function toggle() {
    if (!isOwner) return;
    generation.current += 1;
    const current = generation.current;
    request.current?.abort();
    setView(null); setError("");
    if (visible) { setBusy(false); return; }
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    try {
      const { data } = await api.get("/api/products/owner/storefront", { signal: controller.signal, headers: { Authorization: `Bearer ${session.token}` } });
      if (current !== generation.current || readSession().token !== session.token) return;
      const costs = Object.fromEntries((data.costs || []).map((row) => [row.productId, row]));
      setView({ token: session.token, costs });
    } catch (failure) {
      if (current !== generation.current || controller.signal.aborted) return;
      if ([401, 403].includes(failure.response?.status)) setAccess(null);
      else setError("לא ניתן לטעון עלויות כרגע. נסה שוב.");
    } finally { if (current === generation.current) setBusy(false); }
  }

  // Memory only: private values never enter product/cart objects, storage or URLs.
  return <OwnerCostsContext.Provider value={{ isOwner, visible, costs: visible ? view.costs : {}, busy, error, toggle }}>{children}</OwnerCostsContext.Provider>;
}

export const useOwnerCosts = () => useContext(OwnerCostsContext);
