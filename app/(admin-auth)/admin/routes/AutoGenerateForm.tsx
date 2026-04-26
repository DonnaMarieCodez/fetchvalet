"use client";

import { useActionState } from "react";
import { autoGenerateRoutesForToday } from "./actions/route-actions";

const initialState = {
  status: "idle" as const,
  message: "",
};

export default function AutoGenerateForm() {
  const [state, formAction, isPending] = useActionState(
    autoGenerateRoutesForToday,
    initialState
  );

  return (
    <div className="mt-5 space-y-4">
      <form action={formAction}>
        <button
          type="submit"
          disabled={isPending}
          className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "Generating..." : "Generate Scheduled Routes"}
        </button>
      </form>

      {state.status !== "idle" && (
        <div
          className={`rounded-2xl p-4 text-sm ${
            state.status === "success"
              ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {state.message}
        </div>
      )}
    </div>
  );
}