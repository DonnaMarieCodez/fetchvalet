"use client";

export default function ConfirmDeleteInvoiceButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const confirmed = window.confirm("Delete this invoice?");
        if (!confirmed) {
          e.preventDefault();
        }
      }}
      className="rounded-xl bg-rose-600 px-4 py-2 text-white"
    >
      Delete
    </button>
  );
}