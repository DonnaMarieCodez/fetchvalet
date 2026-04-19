import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "../../../src/lib/supabase/server";
import { getPropertyProfile } from "../../../src/lib/auth/get-property-profile";

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
};

type PaymentRecord = {
  id: string;
  invoice_id: string;
  amount_cents: number;
  payment_date: string;
  payment_method: string | null;
  reference_number: string | null;
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

export default async function PropertyInvoicesPage() {
  const { user, profile } = await getPropertyProfile();

  if (!user) {
    redirect("/property/login");
  }

  if (!profile || profile.role !== "property" || !profile.property_id) {
    redirect("/property/login");
  }

  const supabase = await createClient();

  const [{ data: property }, { data: invoices, error: invoicesError }, { data: payments, error: paymentsError }] =
    await Promise.all([
      supabase
        .from("properties")
        .select("id, name")
        .eq("id", profile.property_id)
        .single(),
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
          notes
        `)
        .eq("property_id", profile.property_id)
        .order("issue_date", { ascending: false }),
      supabase
        .from("invoice_payments")
        .select("id, invoice_id, amount_cents, payment_date, payment_method, reference_number"),
    ]);

  const typedInvoices = (invoices ?? []) as InvoiceRecord[];
  const typedPayments = (payments ?? []) as PaymentRecord[];

  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 to-slate-700 p-8 text-white shadow-lg">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-slate-300">
                Property Billing
              </p>
              <h1 className="mt-2 text-4xl font-bold">
                {property?.name || "Property"} Invoices
              </h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                Review monthly invoices, payment history, and current balances.
              </p>
            </div>

            <Link
              href="/property"
              className="rounded-2xl border border-white/30 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>

        {(invoicesError || paymentsError) && (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error: {invoicesError?.message || paymentsError?.message}
          </div>
        )}

        <div className="mt-8 space-y-4">
          {typedInvoices.length === 0 ? (
            <div className="rounded-3xl bg-white p-8 text-slate-600 shadow-sm ring-1 ring-slate-200">
              No invoices available yet.
            </div>
          ) : (
            typedInvoices.map((invoice) => {
              const invoicePayments = typedPayments.filter(
                (payment) => payment.invoice_id === invoice.id
              );

              const paidAmount = invoicePayments.reduce(
                (sum, payment) => sum + Number(payment.amount_cents || 0),
                0
              );

              const balance = Number(invoice.total_cents || 0) - paidAmount;

              return (
                <div
                  key={invoice.id}
                  className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                >
                  <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-2xl font-bold text-slate-900">
                          Invoice {invoice.invoice_number}
                        </h2>
                        <span
                          className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getInvoiceBadge(
                            invoice.status
                          )}`}
                        >
                          {invoice.status}
                        </span>
                      </div>

                      <p className="mt-3 text-sm text-slate-500">
                        Billing Period: {invoice.billing_period_start} to{" "}
                        {invoice.billing_period_end}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Issue Date: {invoice.issue_date}
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Due Date: {invoice.due_date}
                      </p>

                      {invoice.notes && (
                        <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-700">
                          {invoice.notes}
                        </div>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3 xl:w-[440px]">
                      <div className="rounded-2xl bg-slate-50 p-4">
                        <p className="text-sm text-slate-500">Invoice Total</p>
                        <p className="mt-2 text-2xl font-bold text-slate-900">
                          {formatMoney(invoice.total_cents)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-emerald-50 p-4">
                        <p className="text-sm text-emerald-700">Paid</p>
                        <p className="mt-2 text-2xl font-bold text-emerald-900">
                          {formatMoney(paidAmount)}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-amber-50 p-4">
                        <p className="text-sm text-amber-700">Balance</p>
                        <p className="mt-2 text-2xl font-bold text-amber-900">
                          {formatMoney(balance)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-lg font-bold text-slate-900">
                      Payment History
                    </h3>

                    {invoicePayments.length === 0 ? (
                      <div className="mt-3 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        No payments recorded yet.
                      </div>
                    ) : (
                      <div className="mt-3 space-y-3">
                        {invoicePayments.map((payment) => (
                          <div
                            key={payment.id}
                            className="rounded-2xl border bg-slate-50 p-4"
                          >
                            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                              <div>
                                <p className="font-medium text-slate-900">
                                  {formatMoney(payment.amount_cents)}
                                </p>
                                <p className="text-sm text-slate-500">
                                  Paid on {payment.payment_date}
                                </p>
                              </div>

                              <div className="text-sm text-slate-500">
                                {payment.payment_method || "Method not listed"}
                                {payment.reference_number
                                  ? ` · Ref ${payment.reference_number}`
                                  : ""}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </main>
  );
}