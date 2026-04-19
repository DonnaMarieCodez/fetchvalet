import { createClient } from "../../../src/lib/supabase/server";
import { createMonthlyInvoice } from "./actions/create-monthly-invoice";
import {
  bulkGenerateMonthlyInvoices,
  updateInvoice,
  recordInvoicePayment,
  deleteInvoice,
} from "./actions/invoice-actions";
import ConfirmDeleteInvoiceButton from "./ConfirmDeleteInvoiceButton";

type InvoiceRecord = {
  id: string;
  invoice_number: string;
  billing_period_start: string;
  billing_period_end: string;
  issue_date: string;
  due_date: string;
  status: string;
  total_cents: number;
  notes: string | null;
  properties: {
    name: string;
  } | null;
};

type PropertyRecord = {
  id: string;
  name: string;
};

type PaymentRecord = {
  id: string;
  invoice_id: string;
  amount_cents: number;
};

function formatMoney(cents: number | null) {
  return `$${((cents || 0) / 100).toFixed(2)}`;
}

function getInvoiceBadge(status: string) {
  switch (status) {
    case "draft":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "sent":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "paid":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "partial":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "overdue":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "void":
      return "bg-slate-100 text-slate-500 border-slate-300";
    default:
      return "bg-slate-50 text-slate-700 border-slate-200";
  }
}

export default async function InvoicesPage() {
  const supabase = await createClient();

  const [
    { data: invoices, error: invoicesError },
    { data: properties, error: propertiesError },
    { data: payments, error: paymentsError },
  ] = await Promise.all([
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
        properties(name)
      `)
      .order("issue_date", { ascending: false }),
    supabase
      .from("properties")
      .select("id, name")
      .eq("property_status", "active")
      .order("name", { ascending: true }),
    supabase
      .from("invoice_payments")
      .select("id, invoice_id, amount_cents"),
  ]);

  const typedInvoices = (invoices ?? []) as InvoiceRecord[];
  const typedProperties = (properties ?? []) as PropertyRecord[];
  const typedPayments = (payments ?? []) as PaymentRecord[];

  return (
    <>
      <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
        <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
          Billing
        </p>
        <h1 className="mt-2 text-4xl font-bold">Invoices</h1>
        <p className="mt-3 max-w-2xl text-slate-200">
          Generate, edit, bulk create, record payments, and manage monthly property invoices.
        </p>
      </div>

      {(invoicesError || propertiesError || paymentsError) && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
          Error: {invoicesError?.message || propertiesError?.message || paymentsError?.message}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            Generate Monthly Invoice
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create one invoice for a single active property.
          </p>

          <form action={createMonthlyInvoice} className="mt-5 space-y-4">
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
                {typedProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">
                Billing Month
              </label>
              <input
                name="billingMonth"
                type="month"
                required
                className="mt-1 w-full rounded-2xl border px-3 py-2"
              />
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
                rows={3}
                className="mt-1 w-full rounded-2xl border px-3 py-2"
                placeholder="Optional notes"
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
            >
              Generate Invoice
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h2 className="text-2xl font-bold text-slate-900">
            Bulk Generate Invoices
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Create invoices for all active properties at once.
          </p>

          <form action={bulkGenerateMonthlyInvoices} className="mt-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">
                Billing Month
              </label>
              <input
                name="billingMonth"
                type="month"
                required
                className="mt-1 w-full rounded-2xl border px-3 py-2"
              />
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
                rows={3}
                className="mt-1 w-full rounded-2xl border px-3 py-2"
                placeholder="Optional notes applied to all generated invoices"
              />
            </div>

            <button
              type="submit"
              className="rounded-2xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
            >
              Generate All Active Property Invoices
            </button>
          </form>
        </div>
      </div>

      <div className="mt-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
        <h2 className="text-2xl font-bold text-slate-900">All Invoices</h2>
        <p className="mt-2 text-sm text-slate-500">
          Review invoice details, totals, payments, and status updates.
        </p>

        <div className="mt-5 space-y-4">
          {typedInvoices.length === 0 ? (
            <div className="rounded-2xl bg-slate-50 p-6 text-slate-600">
              No invoices created yet.
            </div>
          ) : (
            typedInvoices.map((invoice) => {
              const paidAmount = typedPayments
                .filter((payment) => payment.invoice_id === invoice.id)
                .reduce((sum, payment) => sum + Number(payment.amount_cents || 0), 0);

              const balance = Number(invoice.total_cents || 0) - paidAmount;

              return (
                <div
                  key={invoice.id}
                  className="rounded-2xl border bg-slate-50 p-5"
                >
                  <div className="grid gap-6 xl:grid-cols-[0.95fr,1.25fr]">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <p className="text-xl font-bold text-slate-900">
                          {invoice.properties?.name || "Unknown Property"}
                        </p>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getInvoiceBadge(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-slate-600">
                        Invoice {invoice.invoice_number}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Billing Period: {invoice.billing_period_start} to{" "}
                        {invoice.billing_period_end}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Due: {invoice.due_date}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Paid: {formatMoney(paidAmount)} · Balance: {formatMoney(balance)}
                      </p>

                      <p className="mt-4 text-2xl font-bold text-slate-900">
                        {formatMoney(invoice.total_cents)}
                      </p>
                    </div>

                    <div className="space-y-4">
                      <form action={updateInvoice} className="space-y-3">
                        <input type="hidden" name="invoiceId" value={invoice.id} />

                        <div className="grid gap-3 md:grid-cols-3">
                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Due Date
                            </label>
                            <input
                              name="dueDate"
                              type="date"
                              defaultValue={invoice.due_date}
                              required
                              className="mt-1 w-full rounded-xl border px-3 py-2"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Status
                            </label>
                            <select
                              name="status"
                              defaultValue={invoice.status}
                              className="mt-1 w-full rounded-xl border px-3 py-2"
                            >
                              <option value="draft">Draft</option>
                              <option value="sent">Sent</option>
                              <option value="paid">Paid</option>
                              <option value="partial">Partial</option>
                              <option value="overdue">Overdue</option>
                              <option value="void">Void</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Total ($)
                            </label>
                            <input
                              name="totalDollars"
                              type="number"
                              step="0.01"
                              min="0"
                              defaultValue={((invoice.total_cents || 0) / 100).toFixed(2)}
                              className="mt-1 w-full rounded-xl border px-3 py-2"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-700">
                            Notes
                          </label>
                          <textarea
                            name="notes"
                            rows={2}
                            defaultValue={invoice.notes || ""}
                            className="mt-1 w-full rounded-xl border px-3 py-2"
                            placeholder="Invoice notes"
                          />
                        </div>

                        <button
                          type="submit"
                          className="rounded-xl bg-slate-900 px-4 py-2 text-white"
                        >
                          Save Changes
                        </button>
                      </form>

                      <div className="rounded-2xl border bg-white p-4">
                        <p className="text-sm font-semibold text-slate-900">
                          Record Payment
                        </p>

                        <form action={recordInvoicePayment} className="mt-3 space-y-3">
                          <input type="hidden" name="invoiceId" value={invoice.id} />

                          <div className="grid gap-3 md:grid-cols-3">
                            <div>
                              <label className="block text-sm font-medium text-slate-700">
                                Payment Date
                              </label>
                              <input
                                name="paymentDate"
                                type="date"
                                required
                                className="mt-1 w-full rounded-xl border px-3 py-2"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700">
                                Amount ($)
                              </label>
                              <input
                                name="amountDollars"
                                type="number"
                                step="0.01"
                                min="0.01"
                                required
                                className="mt-1 w-full rounded-xl border px-3 py-2"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-slate-700">
                                Method
                              </label>
                              <input
                                name="paymentMethod"
                                placeholder="ACH, Check, Card"
                                className="mt-1 w-full rounded-xl border px-3 py-2"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Reference Number
                            </label>
                            <input
                              name="referenceNumber"
                              placeholder="Optional reference"
                              className="mt-1 w-full rounded-xl border px-3 py-2"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-slate-700">
                              Payment Notes
                            </label>
                            <textarea
                              name="notes"
                              rows={2}
                              className="mt-1 w-full rounded-xl border px-3 py-2"
                              placeholder="Optional payment notes"
                            />
                          </div>

                          <button
                            type="submit"
                            className="rounded-xl bg-emerald-600 px-4 py-2 text-white"
                          >
                            Record Payment
                          </button>
                        </form>
                      </div>

                      <form action={deleteInvoice}>
                        <input type="hidden" name="invoiceId" value={invoice.id} />
                        <ConfirmDeleteInvoiceButton />
                      </form>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}