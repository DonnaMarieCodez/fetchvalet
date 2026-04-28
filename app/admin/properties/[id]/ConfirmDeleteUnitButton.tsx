"use client";

type ConfirmDeleteUnitButtonProps = {
  label?: string;
};

export default function ConfirmDeleteUnitButton({
  label = "Delete",
}: ConfirmDeleteUnitButtonProps) {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const confirmed = window.confirm("Delete this unit?");
        if (!confirmed) {
          e.preventDefault();
        }
      }}
      className="rounded-full bg-rose-600 px-2 py-1 text-xs text-white"
    >
      {label}
    </button>
  );
}