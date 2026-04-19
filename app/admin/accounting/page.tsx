import { createClient } from "../../../src/lib/supabase/server";

type InvoiceRecord = {
  id: string;
  invoice_number: string | null;
  billing_period_start: string | null;
  billing_period_end: string | null;
  issue_date: string | null;
  due_date: string | null;
  status: string | null;
  subtotal_cents: number | null;
  adjustments_cents: number | null;
  tax_cents: number | null;
  total_cents: number | null;
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
  notes: string | null;
};

function formatMoney(cents: number | null | undefined) {
  return `$${((cents ?? 0) / 100).toFixed(2)}`;
}

function normalizeProperty(
  value: unknown
): { name: string } | null {
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

export default async function AdminAccountingPage() {
  const supabase = await createClient();

  const [{ data: invoices, error: invoicesError }, { data: payments, error: paymentsError }] =
    await Promise.all([
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
          subtotal_cents,
          adjustments_cents,
          tax_cents,
          total_cents,
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
          payment_method,
          notes
        `)
        .order("payment_date", { ascending: false }),
    ]);

  if (invoicesError) {
    throw new Error(invoicesError.message);
  }

  if (paymentsError) {
    throw new Error(paymentsError.message);
  }

  const typedInvoices: InvoiceRecord[] = (invoices ?? []).map((invoice) => {
    const row = invoice as Record<string, unknown>;

    return {
      id: String(row.id ?? ""),
      invoice_number:
        typeof row.invoice_number === "string" ? row.invoice_number : null,
      billing_period_start:
        typeof row.billing_period_start === "string"
          ? row.billing_period_start
          : null,
      billing_period_end:
        typeof row.billing_period_end === "string"
          ? row.billing_period_end
          : null,
      issue_date: typeof row.issue_date === "string" ? row.issue_date : null,
      due_date: typeof row.due_date === "string" ? row.due_date : null,
      status: typeof row.status === "string" ? row.status : null,
      subtotal_cents:
        typeof row.subtotal_cents === "number" ? row.subtotal_cents : 0,
      adjustments_cents:
        typeof row.adjustments_cents === "number" ? row.adjustments_cents : 0,
      tax_cents: typeof row.tax_cents === "number" ? row.tax_cents : 0,
      total_cents: typeof row.total_cents === "number" ? row.total_cents : 0,
      properties: normalizeProperty(row.properties),
    };
  });

  const typedPayments: PaymentRecord[] = (payments ?? []).map((payment) => {
    const row = payment as Record<string, unknown>;

    return {
      id: String(row.id ?? ""),
      invoice_id: String(row.invoice_id ?? ""),
      amount_cents:
        typeof row.amount_cents === "number" ? row.amount_cents : 0,
      payment_date:
        typeof row.payment_date === "string" ? row.payment_date : null,
      payment_method:
        typeof row.payment_method === "string" ? row.payment_method : null,
      notes: typeof row.notes === "string" ? row.notes : null,
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

  const totalOutstanding = Math.max(0, totalInvoiced - totalCollected);

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
            Accounting
          </p>
          <h1 className="mt-2 text-4xl font-bold">Accounting Overview</h1>
          <p className="mt-3 max-w-2xl text-slate-200">
            Review invoicing totals, payments received, and outstanding balances.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
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

          <div className="rounded-3xl bg-amber-50 p-6 shadow-sm ring-1 ring-amber-100">
            <p className="text-sm text-amber-700">Outstanding</p>
            <p className="mt-3 text-4xl font-bold text-amber-900">
              {formatMoney(totalOutstanding)}
            </p>
          </div>
        </div>

        <section className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">Invoices</h2>

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
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-xl font-bold text-slate-900">
                        {invoice.properties?.name || "Unknown Property"}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        {invoice.invoice_number || "No invoice number"}
                      </p>
                      <p className="mt-2 text-sm text-slate-600">
                        Issue Date: {invoice.issue_date || "Not set"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Due Date: {invoice.due_date || "Not set"}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        Billing Period:{" "}
                        {invoice.billing_period_start || "Not set"} -{" "}
                        {invoice.billing_period_end || "Not set"}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm text-slate-500 capitalize">
                        {invoice.status || "draft"}
                      </p>
                      <p className="mt-2 text-2xl font-bold text-slate-900">
                        {formatMoney(invoice.total_cents)}
                      </p>
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