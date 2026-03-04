export default function Toast({ message, isVisible }) {
  return (
    <div className={`toast ${isVisible ? "is-visible" : ""}`} role="status" aria-live="polite">
      {message}
    </div>
  );
}
