import { CheckoutClient } from "@/components/checkout-client";

export const metadata = {
  title: "Checkout"
};

export default function CheckoutPage() {
  return (
    <main className="min-h-screen bg-page pt-[104px] text-copy">
      <section className="container-luxe py-10 md:py-14">
        <CheckoutClient />
      </section>
    </main>
  );
}
