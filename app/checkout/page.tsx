import { CheckoutClient } from "@/components/checkout-client";

export const metadata = {
  title: "Checkout"
};

export default function CheckoutPage() {
  return (
    <main className="bg-page pt-28 text-copy">
      <section className="container-luxe py-20 md:py-28">
        <CheckoutClient />
      </section>
    </main>
  );
}
