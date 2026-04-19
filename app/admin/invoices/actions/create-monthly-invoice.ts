"use server";

import { redirect } from "next/navigation";
import { createClient } from "../../../../src/lib/supabase/server";

function getLastDayOfMonth(year: number, month: number) {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
}

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export async function createMonthlyInvoice(formData: FormData) {
  const propertyId = String(formData.get("propertyId") || "").trim();
  const billingMonth = String(formData.get("billingMonth") || "").trim();
  const dueDate = String(formData.get("dueDate") || "").trim();
  const notes = String(formData.get("notes") || "").trim();

  if (!propertyId || !billingMonth || !dueDate) {
    throw new Error("Property, billing month, and due date are required.");
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

  const { data: property, error: propertyError } = await supabase
    .from("properties")
    .select("id, name, monthly_billing_cents, property_status")
    .eq("id", propertyId)
    .single();

  if (propertyError || !property) {
    throw new Error(propertyError?.message || "Property not found.");
  }

  if (property.property_status === "suspended") {
    throw new Error("Invoices cannot be generated for suspended properties.");
  }

  const { data: existingInvoice, error: existingInvoiceError } = await supabase
    .from("invoices")
    .select("id")
    .eq("property_id", propertyId)
    .eq("billing_period_start", billingPeriodStart)
    .eq("billing_period_end", billingPeriodEnd)
    .maybeSingle();

  if (existingInvoiceError) {
    throw new Error(existingInvoiceError.message);
  }

  if (existingInvoice) {
    throw new Error("An invoice already exists for this property and month.");
  }

  const invoiceNumber = `INV-${year}${pad(month)}-${propertyId
    .slice(0, 8)
    .toUpperCase()}`;

  const monthlyBillingAmount = Number(property.monthly_billing_cents || 0);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      property_id: propertyId,
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
    throw new Error(invoiceError?.message || "Failed to create invoice.");
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

  redirect("/admin/invoices");
}