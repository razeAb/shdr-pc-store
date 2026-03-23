import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api";
import { normalizeProduct } from "../utils/products.js";

const ProductsContext = createContext(null);

export function ProductsProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = useCallback(async (signal) => {
    try {
      setLoading(true);
      setError("");
      const res = await api.get("/api/products", { signal });
      const list = Array.isArray(res.data) ? res.data : [];
      setProducts(list.map((item) => normalizeProduct(item)));
    } catch (err) {
      if (err?.name === "CanceledError" || err?.code === "ERR_CANCELED") return;
      setError(err?.message || "Failed to load products.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    fetchProducts(controller.signal);
    return () => controller.abort();
  }, [fetchProducts]);

  const value = useMemo(
    () => ({
      products,
      loading,
      error,
      refresh: () => fetchProducts()
    }),
    [products, loading, error, fetchProducts]
  );

  return <ProductsContext.Provider value={value}>{children}</ProductsContext.Provider>;
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error("useProducts must be used within ProductsProvider");
  }
  return context;
}
