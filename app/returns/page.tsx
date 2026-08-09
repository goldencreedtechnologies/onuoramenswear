import Link from "next/link";

export const metadata = {
  title: "Returns & Exchanges",
  description: "ỌNUỌRA size exchange and manufacturing fault policy."
};

export default function ReturnsPage() {
  return (
    <main className="min-h-screen bg-page pt-[104px] text-copy">
      <section className="container-luxe max-w-5xl py-12 md:py-16">
        <p className="text-[10px] font-semibold uppercase text-gold">Returns & Exchanges</p>
        <h1 className="mt-3 max-w-3xl text-3xl font-semibold leading-tight md:text-5xl">
          A Considered Policy for a Carefully Made Garment.
        </h1>
        <div className="mt-10 grid gap-px bg-line md:grid-cols-2">
          <article className="bg-page p-6 md:p-8">
            <h2 className="text-lg font-semibold">Size Exchanges</h2>
            <p className="mt-4 text-sm leading-7 text-copy-muted">
              Request an exchange within 7 days of delivery. The garment must be unworn, unwashed,
              and returned with its original tags and packaging.
            </p>
          </article>
          <article className="bg-page p-6 md:p-8">
            <h2 className="text-lg font-semibold">Manufacturing Faults</h2>
            <p className="mt-4 text-sm leading-7 text-copy-muted">
              Refunds are reserved for confirmed manufacturing faults. Client care will review
              submitted photographs and order information before approving the return.
            </p>
          </article>
        </div>
        <div className="mt-10 grid gap-8 border-t border-line pt-8 md:grid-cols-2">
          <article>
            <h2 className="text-lg font-semibold">Return Condition</h2>
            <p className="mt-3 text-sm leading-7 text-copy-muted">
              Returned garments must be unworn except for a brief fit check, unwashed, unaltered,
              free from scent or marks, and accompanied by original tags, accessories, and
              packaging. We may decline items that cannot be returned to sale.
            </p>
          </article>
          <article>
            <h2 className="text-lg font-semibold">Items Not Eligible</h2>
            <p className="mt-3 text-sm leading-7 text-copy-muted">
              Personalised or altered garments, final-sale items, gift cards, and garments damaged
              through wear, washing, storage, or improper care are not eligible unless applicable
              law requires otherwise.
            </p>
          </article>
          <article>
            <h2 className="text-lg font-semibold">How to Request</h2>
            <p className="mt-3 text-sm leading-7 text-copy-muted">
              Contact Client Care within seven days of delivery with the order number, requested
              resolution, and clear photographs where there is a fault. Wait for return
              authorisation and routing instructions before sending anything.
            </p>
          </article>
          <article>
            <h2 className="text-lg font-semibold">Inspection and Resolution</h2>
            <p className="mt-3 text-sm leading-7 text-copy-muted">
              Approved returns are inspected on receipt. Exchanges depend on stock. Eligible
              refunds are issued to the original payment method after inspection; banking and
              payment-provider timelines may apply.
            </p>
          </article>
        </div>
        <p className="mt-8 max-w-3xl text-sm leading-7 text-copy-muted">
          Original delivery charges are not normally refundable. Return delivery and customs costs
          depend on the destination and reason for return. Confirm the correct route with the house
          before sending a garment. These terms do not remove consumer rights that apply by law.
        </p>
        <Link
          href="/contact"
          className="gold-focus mt-7 inline-flex min-h-12 items-center justify-center bg-obsidian px-6 text-xs font-semibold uppercase text-ivory transition hover:bg-gold hover:text-obsidian"
        >
          Contact Client Care
        </Link>
      </section>
    </main>
  );
}
