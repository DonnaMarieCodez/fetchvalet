"use client";

export default function ConfirmDeleteBuildingButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const confirmed = window.confirm(
          "Delete this building and all units inside it?"
        );
        if (!confirmed) {
          e.preventDefault();
        }
      }}
      className="rounded-xl bg-rose-600 px-4 py-2 text-white"
    >
      Delete Building
    </button>
  );
}