/**
 * Credit purchase configuration.
 *
 * Dokvera settles credit purchases through mobile money (M-Pesa / e-Mola)
 * with human confirmation: the buyer creates an order, pays, and an admin
 * approves the order in /admin/credits, which credits the balance atomically.
 *
 * Fill in the fields below with the real Dokvera accounts. While an entry is
 * empty the UI simply omits it instead of showing a placeholder.
 */

export type PaymentAccount = {
  id: string;
  /** e.g. "M-Pesa" */
  provider: string;
  /** Phone number / account. Leave empty until the real one is configured. */
  number: string;
  /** Registered account holder name. */
  holder: string;
};

export const PAYMENT_ACCOUNTS: PaymentAccount[] = [
  { id: "mpesa", provider: "M-Pesa", number: "", holder: "" },
  { id: "emola", provider: "e-Mola", number: "", holder: "" },
];

/** WhatsApp/phone used to send the payment proof. Empty = hidden in the UI. */
export const SUPPORT_CONTACT = "";

export function configuredAccounts(): PaymentAccount[] {
  return PAYMENT_ACCOUNTS.filter((a) => a.number.trim().length > 0);
}

export const ORDER_STATUS: Record<string, { label: string; tone: "muted" | "info" | "success" | "danger" }> = {
  pending: { label: "Aguarda confirmação", tone: "info" },
  paid: { label: "Creditado", tone: "success" },
  rejected: { label: "Rejeitado", tone: "danger" },
  cancelled: { label: "Cancelado", tone: "muted" },
};

export function orderStatusMeta(status: string) {
  return ORDER_STATUS[status] ?? { label: status, tone: "muted" as const };
}

/** Short human reference shown to the buyer and the admin. */
export function orderReference(orderId: string): string {
  return `DK-${orderId.slice(0, 8).toUpperCase()}`;
}
