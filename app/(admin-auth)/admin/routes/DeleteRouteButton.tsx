"use client";

export default function DeleteRouteButton() {
  return (
    <button
      type="submit"
      onClick={(event) => {
        const confirmed = window.confirm(
          "Are you sure you want to delete this route? This will also remove its stops and proof records."
        );

        if (!confirmed) {
          event.preventDefault();
        }
      }}
      className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
    >
      Delete Route
    </button>
  );
}