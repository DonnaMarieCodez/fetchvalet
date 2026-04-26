import {
  bulkGenerateInvoices,
  createInvoice,
  deleteInvoice,
  updateInvoice,
} from "./actions/invoice-actions";
import { requireAdmin } from "../../../src/lib/auth/require-admin";
import { createClient } from "../../../src/lib/supabase/server";
import ConfirmDeleteInvoiceButton from "./ConfirmDeleteInvoiceButton";

type PropertyRecord = {
  id: string;
  name: string;
  monthly_billing_cents: number | null;
  property_status: string | null;
};

type InvoiceRecord = {
  id: string;
  invoice_number: string | null;
  billing_period_start: string | null;
  billing_period_end: string | null;
  issue_date: string | null;
  due_date: string | null;
  status: string | null;
  total_cents: number | null;
  notes: string | null;
  properties: {
    name: string;
  } | null;
};

type PaymentRecord = {
  id: string;
  invoice_id: string;
  amount_cents: number | null;
  payment_date: string | null;
  payment_method: string | null;
};

function formatMoney(cents: number | null | undefined) {
  return `$${((cents ?? 0) / 100).toFixed(2)}`;
}

function normalizeProperty(value: unknown): { name: string } | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    const first = value[0];

    if (
      first &&
      typeof first === "object" &&
      "name" in first &&
      typeof (first as { name?: unknown }).name === "string"
    ) {
      return { name: (first as { name: string }).name };
    }

    return null;
  }

  if (
    typeof value === "object" &&
    value !== null &&
    "name" in value &&
    typeof (value as { name?: unknown }).name === "string"
  ) {
    return { name: (value as { name: string }).name };
  }

  return null;
}

export default async function AdminInvoicesPage() {
  const supabase = await createClient();

  const [
    { data: properties, error: propertiesError },
    { data: invoices, error: invoicesError },
    { data: payments, error: paymentsError },
  ] = await Promise.all([
    supabase
      .from("properties")
      .select("id, name, monthly_billing_cents, property_status")
      .order("name", { ascending: true }),

    supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        billing_period_start,
        billing_period_end,
        issue_date,
        due_date,
        status,
        total_cents,
        notes,
        properties (
          name
        )
      `)
      .order("issue_date", { ascending: false }),

    supabase
      .from("invoice_payments")
      .select(`
        id,
        invoice_id,
        amount_cents,
        payment_date,
        payment_method
      `)
      .order("payment_date", { ascending: false }),
  ]);

  if (propertiesError) {
    throw new Error(propertiesError.message);
  }

  if (invoicesError) {
    throw new Error(invoicesError.message);
  }

  if (paymentsError) {
    throw new Error(paymentsError.message);
  }

  const typedProperties: PropertyRecord[] = (properties ?? []).map((row) => {
    const record = row as Record<string, unknown>;

    return {
      id: String(record.id ?? ""),
      name: typeof record.name === "string" ? record.name : "Unknown Property",
      monthly_billing_cents:
        typeof record.monthly_billing_cents === "number"
          ? record.monthly_billing_cents
          : 0,
      property_status:
        typeof record.property_status === "string"
          ? record.property_status
          : null,
    };
  });

  const typedInvoices: InvoiceRecord[] = (invoices ?? []).map((row) => {
    const record = row as Record<string, unknown>;

    return {
      id: String(record.id ?? ""),
      invoice_number:
        typeof record.invoice_number === "string"
          ? record.invoice_number
          : null,
      billing_period_start:
        typeof record.billing_period_start === "string"
          ? record.billing_period_start
          : null,
      billing_period_end:
        typeof record.billing_period_end === "string"
          ? record.billing_period_end
          : null,
      issue_date:
        typeof record.issue_date === "string" ? record.issue_date : null,
      due_date: typeof record.due_date === "string" ? record.due_date : null,
      status: typeof record.status === "string" ? record.status : null,
      total_cents:
        typeof record.total_cents === "number" ? record.total_cents : 0,
      notes: typeof record.notes === "string" ? record.notes : null,
      properties: normalizeProperty(record.properties),
    };
  });

  const typedPayments: PaymentRecord[] = (payments ?? []).map((row) => {
    const record = row as Record<string, unknown>;

    return {
      id: String(record.id ?? ""),
      invoice_id: String(record.invoice_id ?? ""),
      amount_cents:
        typeof record.amount_cents === "number" ? record.amount_cents : 0,
      payment_date:
        typeof record.payment_date === "string" ? record.payment_date : null,
      payment_method:
        typeof record.payment_method === "string"
          ? record.payment_method
          : null,
    };
  });

  const totalInvoiced = typedInvoices.reduce(
    (sum, invoice) => sum + (invoice.total_cents ?? 0),
    0
  );

  const totalCollected = typedPayments.reduce(
    (sum, payment) => sum + (payment.amount_cents ?? 0),
    0
  );

  const activeProperties = typedProperties.filter(
    (property) => (property.property_status || "").toLowerCase() !== "suspended"
  );

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            Invoices
          </p>
          <h1 className="mt-2 text-4xl font-bold">Invoice Management</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Generate monthly invoices, bulk-create invoices for active properties,
            and update invoice records.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">Total Invoiced</p>
            <p className="mt-3 text-4xl font-bold text-slate-900">
              {formatMoney(totalInvoiced)}
            </p>
          </div>

          <div className="rounded-3xl bg-emerald-50 p-6 shadow-sm ring-1 ring-emerald-100">
            <p className="text-sm text-emerald-700">Total Collected</p>
            <p className="mt-3 text-4xl font-bold text-emerald-900">
              {formatMoney(totalCollected)}
            </p>
          </div>
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              Generate Monthly Invoice
            </h2>

            <form action={createInvoice} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Property
                </label>
                <select
                  name="propertyId"
                  required
                  defaultValue=""
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                >
                  <option value="">Select a property</option>
                  {activeProperties.map((property) => (
                    <option key={property.id} value={property.id}>
                      {property.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Due Date
                </label>
                <input
                  name="dueDate"
                  type="date"
                  required
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Optional notes"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Generate Invoice
              </button>
            </form>
          </section>

          <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
            <h2 className="text-2xl font-bold text-slate-900">
              Bulk Generate Invoices
            </h2>

            <form action={bulkGenerateInvoices} className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Due Date
                </label>
                <input
                  name="dueDate"
                  type="date"
                  required
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Optional notes applied to all generated invoices"
                  className="mt-1 w-full rounded-2xl border px-3 py-2"
                />
              </div>

              <button
                type="submit"
                className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                Generate All Active Property Invoices
              </button>
            </form>
          </section>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">All Invoices</h2>

          <div className="mt-5 space-y-4">
            {typedInvoices.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
                No invoices found.
              </div>
            ) : (
              typedInvoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="rounded-2xl border bg-slate-50 p-5"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xl font-bold text-slate-900">
                        {invoice.properties?.name || "Unknown Property"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {invoice.invoice_number || "No invoice number"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        {invoice.billing_period_start || "Not set"} to{" "}
                        {invoice.billing_period_end || "Not set"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Due {invoice.due_date || "Not set"}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {formatMoney(invoice.total_cents)}
                      </p>
                    </div>

                    <div className="w-full max-w-xl">
                      <form action={updateInvoice} className="space-y-3">
                        <input type="hidden" name="invoiceId" value={invoice.id} />

                        <div className="grid gap-3 md:grid-cols-3">
                          <input
                            name="dueDate"
                            type="date"
                            defaultValue={invoice.due_date || ""}
                            className="rounded-2xl border px-3 py-2"
                          />

                          <select
                            name="status"
                            defaultValue={invoice.status || "draft"}
                            className="rounded-2xl border px-3 py-2"
                          >
                            <option value="draft">Draft</option>
                            <option value="sent">Sent</option>
                            <option value="paid">Paid</option>
                            <option value="overdue">Overdue</option>
                          </select>

                          <input
                            name="totalDollars"
                            type="number"
                            step="0.01"
                            min="0"
                            defaultValue={((invoice.total_cents ?? 0) / 100).toFixed(2)}
                            className="rounded-2xl border px-3 py-2"
                          />
                        </div>

                        <textarea
                          name="notes"
                          rows={3}
                          defaultValue={invoice.notes || ""}
                          placeholder="Invoice notes"
                          className="w-full rounded-2xl border px-3 py-2"
                        />

                        <div className="flex flex-wrap gap-3">
                          <button
                            type="submit"
                            className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                          >
                            Save Changes
                          </button>
                        </div>
                      </form>

                      <form action={deleteInvoice} className="mt-3">
                        <input type="hidden" name="invoiceId" value={invoice.id} />
                        <ConfirmDeleteInvoiceButton />
                      </form>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}