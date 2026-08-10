import Link from "next/link";
import { Check } from "lucide-react";
import { ClearCartOnMount } from "@/components/clear-cart-on-mount";
import { formatCurrency } from "@/data/site-config";
import { getOrderConfirmation, getOrderConfirmationForStripeSession } from "@/lib/backend/order-confirmation";

export const metadata = {
  title: "Order Confirmed"
};

type CheckoutSuccessPageProps = {
  searchParams: Promise<{ session_id?: string; order_id?: string; voucher?: string; token?: string }>;
};

export default async function CheckoutSuccessPage({ searchParams }: CheckoutSuccessPageProps) {
  const { session_id, order_id, voucher, token } = await searchParams;
  const voucherOrder = voucher === "1";
  const confirmation = voucherOrder && order_id
    ? await getOrderConfirmation(order_id, token)
    : await getOrderConfirmationForStripeSession(session_id);
  const zeroValueVoucher = voucherOrder || confirmation?.zeroValueVoucher;
  const emailWasSent = confirmation?.emailStatus === "sent";

  return (
    <main className="min-h-screen overflow-hidden bg-page pt-[104px] text-copy">
      <ClearCartOnMount />
      <section className="container-luxe grid min-h-[72vh] min-w-0 place-items-center py-14">
        <div className="w-full max-w-2xl min-w-0 text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold text-obsidian">
            <Check className="h-5 w-5" />
          </span>
          <p className="mt-6 text-[10px] font-semibold uppercase text-gold">
            {zeroValueVoucher ? "Order confirmed" : "Payment received"}
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight md:text-5xl">
            Your order is confirmed.
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-copy-muted">
            {zeroValueVoucher
              ? `Thank you${confirmation?.fullName ? `, ${confirmation.fullName}` : ""}. Your authorised 100% voucher was applied and no payment was required. Your order has been received and is now preparing for dispatch review.`
              : confirmation
                ? `Thank you${confirmation.fullName ? `, ${confirmation.fullName}` : ""}. Your payment has been confirmed and the house will begin fulfilment shortly.`
                : "Thank you for choosing ỌNUỌRA. Stripe is confirming the payment and the house will begin fulfilment as soon as that confirmation arrives."}
          </p>
          {confirmation ? (
            <div className="mx-auto mt-6 max-w-xl border border-line bg-panel-muted p-5 text-left text-sm leading-7 text-copy-muted">
              <p><span className="font-semibold text-copy">Order number:</span> {confirmation.orderNumber}</p>
              <p><span className="font-semibold text-copy">Tracking ID:</span> {confirmation.trackingId}</p>
              <p><span className="font-semibold text-copy">Order status:</span> {confirmation.status}</p>
              <p><span className="font-semibold text-copy">Payment status:</span> {confirmation.paymentStatus}</p>
              <p><span className="font-semibold text-copy">Delivery:</span> {confirmation.deliveryMethod} · {confirmation.deliveryWindow}</p>
              <p><span className="font-semibold text-copy">Delivery address:</span> {confirmation.deliveryAddress}</p>
              <div className="mt-4 border-t border-line pt-4">
                <p className="font-semibold text-copy">Order summary</p>
                <ul className="mt-2 space-y-1">
                  {confirmation.items.map((item) => <li key={`${item.name}-${item.size}-${item.colour ?? ""}`}>{item.name}{item.edition ? ` · ${item.edition}` : ""} · {item.colour ?? "Selected colour"} · {item.size} · Qty {item.quantity}</li>)}
                </ul>
                <dl className="mt-3 space-y-1 border-t border-line pt-3">
                  <div className="flex justify-between gap-4"><dt>Subtotal</dt><dd>{formatCurrency(confirmation.currency, confirmation.subtotal)}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Discount</dt><dd>-{formatCurrency(confirmation.currency, confirmation.discount)}</dd></div>
                  <div className="flex justify-between gap-4"><dt>Shipping</dt><dd>{formatCurrency(confirmation.currency, confirmation.shipping)}</dd></div>
                  <div className="flex justify-between gap-4 font-semibold text-copy"><dt>Total</dt><dd>{formatCurrency(confirmation.currency, confirmation.total)}</dd></div>
                </dl>
              </div>
              <p className="mt-4 border-t border-line pt-4">{emailWasSent ? "Your order confirmation and invoice have been sent to your email." : "Your order confirmation is being prepared and will be sent to your email shortly."}</p>
              <Link href="/tracking" className="gold-focus mt-4 inline-flex min-h-11 items-center justify-center bg-obsidian px-4 text-[10px] font-semibold uppercase tracking-[0.08em] text-ivory hover:bg-gold hover:text-obsidian">Track your order</Link>
            </div>
          ) : zeroValueVoucher ? (
            <div className="mx-auto mt-6 max-w-xl border border-line bg-panel-muted p-5 text-left text-sm leading-7 text-copy-muted">
              <p><span className="font-semibold text-copy">Dispatch status:</span> Order confirmed and preparing for dispatch</p>
              <p><span className="font-semibold text-copy">Estimated dispatch:</span> Within 3 working days</p>
              <p className="mt-3">We are preparing your order confirmation. If it does not arrive shortly, please contact Client Services.</p>
            </div>
          ) : null}
          {!confirmation && !zeroValueVoucher ? (
            <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-copy-muted">
              We are finalising your payment confirmation. This page will update once the secure payment notification is received.
            </p>
          ) : null}
          <Link
            href="/collection"
            className="gold-focus mt-7 inline-flex min-h-12 max-w-full items-center justify-center bg-obsidian px-6 text-center text-xs font-semibold uppercase text-ivory hover:bg-gold hover:text-obsidian"
          >
            Continue shopping
          </Link>
        </div>
      </section>
    </main>
  );
}
