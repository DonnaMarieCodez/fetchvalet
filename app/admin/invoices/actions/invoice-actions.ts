"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "../../../../src/lib/supabase/server";

function getLastDayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export async function createInvoice(formData: FormData) {
  const propertyId = String(formData.get("propertyId") || "").trim();
  const dueDate = String(formData.get("dueDate") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!propertyId || !dueDate) {
    throw new Error("Property and due date are required.");
  }

  const supabase = await createClient();
  const issueDate = new Date().toISOString().slice(0, 10);

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, name, monthly_billing_cents, property_status")
    .eq("id", propertyId)
    .single();

  if (propertyError || !property) {
    throw new Error(propertyError?.message || "Property not found.");
  }

  if (String(property.property_status || "").toLowerCase() === "suspended") {
    throw new Error("Cannot create an invoice for a suspended property.");
  }

  const monthlyBillingAmount = Number(property.monthly_billing_cents || 0);
  const invoiceNumber = `INV-${Date.now()}-${property.id
    .slice(0, 6)
    .toUpperCase()}`;

  const { error: invoiceError } = await supabase.from("invoices").insert({
    property_id: property.id,
    invoice_number: invoiceNumber,
    issue_date: issueDate,
    due_date: dueDate,
    status: "draft",
    amount_cents: monthlyBillingAmount,
    subtotal_cents: monthlyBillingAmount,
    adjustments_cents: 0,
    tax_cents: 0,
    total_cents: monthlyBillingAmount,
    notes: notes || null,
  });

  if (invoiceError) {
    throw new Error(invoiceError.message);
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/accounting");
}

export async function bulkGenerateMonthlyInvoices(formData: FormData) {
  const billingMonth = String(formData.get("billingMonth") || "").trim();
  const dueDate = String(formData.get("dueDate") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!billingMonth || !dueDate) {
    throw new Error("Billing month and due date are required.");
  }

  const [yearString, monthString] = billingMonth.split("-");
  const year = Number(yearString);
  const month = Number(monthString);

  if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
    throw new Error("Billing month must be in YYYY-MM format.");
  }

  const billingPeriodStart = `${year}-${pad(month)}-01`;
  const billingPeriodEnd = `${year}-${pad(month)}-${pad(
    getLastDayOfMonth(year, month)
  )}`;
  const issueDate = new Date().toISOString().slice(0, 10);

  const supabase = await createClient();

  const { data: properties, error: propertiesError } = await supabase
    .from("properties")
    .select("id, name, monthly_billing_cents, property_status")
    .eq("property_status", "active");

  if (propertiesError) {
    throw new Error(propertiesError.message);
  }

  for (const property of properties ?? []) {
    const { data: existingInvoice } = await supabase
      .from("invoices")
      .select("id")
      .eq("property_id", property.id)
      .eq("billing_period_start", billingPeriodStart)
      .eq("billing_period_end", billingPeriodEnd)
      .maybeSingle();

    if (existingInvoice) {
      continue;
    }

    const monthlyBillingAmount = Number(property.monthly_billing_cents || 0);
    const invoiceNumber = `INV-${year}${pad(month)}-${property.id
      .slice(0, 8)
      .toUpperCase()}`;

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        property_id: property.id,
        invoice_number: invoiceNumber,
        billing_period_start: billingPeriodStart,
        billing_period_end: billingPeriodEnd,
        issue_date: issueDate,
        due_date: dueDate,
        status: "draft",
        amount_cents: monthlyBillingAmount,
        subtotal_cents: monthlyBillingAmount,
        adjustments_cents: 0,
        tax_cents: 0,
        total_cents: monthlyBillingAmount,
        notes: notes || null,
      })
      .select("id")
      .single();

    if (invoiceError || !invoice) {
      throw new Error(invoiceError?.message || "Failed to bulk create invoices.");
    }

    const { error: lineItemError } = await supabase
      .from("invoice_line_items")
      .insert({
        invoice_id: invoice.id,
        description: `Monthly valet trash service for ${billingMonth}`,
        quantity: 1,
        unit_amount_cents: monthlyBillingAmount,
        line_total_cents: monthlyBillingAmount,
        service_date: billingPeriodStart,
      });

    if (lineItemError) {
      throw new Error(lineItemError.message);
    }
  }

  redirect("/admin/invoices");
}

export async function updateInvoice(formData: FormData) {
  const supabase = await createClient();

  const invoiceId = String(formData.get("invoiceId") || "").trim();
  const dueDate = String(formData.get("dueDate") || "").trim();
  const status = String(formData.get("status") || "").trim();
  const notes = String(formData.get("notes") || "").trim();
  const totalDollars = Number(formData.get("totalDollars") || 0);

  if (!invoiceId || !dueDate || !status) {
    throw new Error("Invoice, due date, and status are required.");
  }

  const totalCents = Math.round(totalDollars * 100);

  const { error } = await supabase
    .from("invoices")
    .update({
      due_date: dueDate,
      status,
      amount_cents: totalCents,
      total_cents: totalCents,
      notes: notes || null,
    })
    .eq("id", invoiceId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/accounting");
}

export async function recordInvoicePayment(formData: FormData) {
  const supabase = await createClient();

  const invoiceId = String(formData.get("invoiceId") || "").trim();
  const paymentDate = String(formData.get("paymentDate") || "").trim();
  const amountDollars = Number(formData.get("amountDollars") || 0);
  const paymentMethod = String(formData.get("paymentMethod") || "").trim();
  const referenceNumber = String(formData.get("referenceNumber") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!invoiceId || !paymentDate) {
    throw new Error("Invoice and payment date are required.");
  }

  if (Number.isNaN(amountDollars) || amountDollars <= 0) {
    throw new Error("Payment amount must be greater than zero.");
  }

  const amountCents = Math.round(amountDollars * 100);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, total_cents, status")
    .eq("id", invoiceId)
    .single();

  if (invoiceError || !invoice) {
    throw new Error(invoiceError?.message || "Invoice not found.");
  }

  const { error: paymentError } = await supabase
    .from("invoice_payments")
    .insert({
      invoice_id: invoiceId,
      payment_date: paymentDate,
      amount_cents: amountCents,
      payment_method: paymentMethod || null,
      reference_number: referenceNumber || null,
      notes: notes || null,
    });

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  const { data: payments, error: paymentsError } = await supabase
    .from("invoice_payments")
    .select("amount_cents")
    .eq("invoice_id", invoiceId);

  if (paymentsError) {
    throw new Error(paymentsError.message);
  }

  const totalPaid = (payments ?? []).reduce(
    (sum, payment) => sum + Number(payment.amount_cents || 0),
    0
  );

  const invoiceTotal = Number(invoice.total_cents || 0);

  let nextStatus = invoice.status || "draft";
  if (totalPaid >= invoiceTotal) {
    nextStatus = "paid";
  } else if (totalPaid > 0) {
    nextStatus = "partial";
  } else if (nextStatus === "paid") {
    nextStatus = "sent";
  }

  const { error: updateInvoiceError } = await supabase
    .from("invoices")
    .update({ status: nextStatus })
    .eq("id", invoiceId);

  if (updateInvoiceError) {
    throw new Error(updateInvoiceError.message);
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/accounting");
}

export async function deleteInvoice(formData: FormData) {
  const supabase = await createClient();

  const invoiceId = String(formData.get("invoiceId") || "").trim();

  if (!invoiceId) {
    throw new Error("Invoice ID is required.");
  }

  await supabase.from("invoice_line_items").delete().eq("invoice_id", invoiceId);
  await supabase.from("invoice_payments").delete().eq("invoice_id", invoiceId);

  const { error } = await supabase.from("invoices").delete().eq("id", invoiceId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/admin/invoices");
  revalidatePath("/admin/accounting");
}

export { bulkGenerateMonthlyInvoices as bulkGenerateInvoices };