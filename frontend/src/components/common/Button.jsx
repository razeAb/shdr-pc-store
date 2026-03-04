import React from "react";

export default function Button({ title, className = "", ...props }) {
  return (
    <button
      type="button"
      className={`rounded-full bg-ember px-4 py-2 text-sm font-semibold text-white shadow-glow ${className}`}
      {...props}
    >
      {title}
    </button>
  );
}
