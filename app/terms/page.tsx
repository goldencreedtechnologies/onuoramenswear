import { PolicyPage } from "@/components/policy-page";

export const metadata = {
  title: "Terms & Conditions",
  description: "Terms governing use of the ỌNUỌRA website, purchases, offers, and services."
};

const sections = [
  {
    title: "Using This Website",
    paragraphs: [
      "By using this website or placing an order, you agree to these terms and any policies incorporated by reference. You must provide accurate information and use the site only for lawful personal or authorised business purposes.",
      "We may suspend access where activity threatens customers, the service, intellectual property, or applicable law."
    ]
  },
  {
    title: "Products and Availability",
    paragraphs: [
      "Garments are produced in controlled quantities. Product imagery and colour are presented as accurately as reasonably possible, but screens and lighting can create small variations.",
      "Placing an item in a bag does not reserve stock. An order is accepted only after payment is authorised, inventory is confirmed, and an order confirmation is issued."
    ]
  },
  {
    title: "Pricing, Payment, and Promotions",
    paragraphs: [
      "Prices and supported currencies are displayed on the product or checkout page. Delivery, tax, conversion, or other applicable charges are shown before payment where they can be determined.",
      "Promotions are subject to their stated eligibility, dates, and exclusions. The new-arrivals offer applies to qualifying groups of three garments and cannot be exchanged for cash."
    ]
  },
  {
    title: "Delivery and Title",
    paragraphs: [
      "Delivery estimates are not guarantees. Customers are responsible for providing an accessible and accurate destination and for any duties or import requirements not collected at checkout.",
      "Risk passes on confirmed delivery to the supplied destination or authorised recipient, subject to rights that cannot lawfully be excluded."
    ]
  },
  {
    title: "Returns, Exchanges, and Faults",
    paragraphs: [
      "Returns and exchanges are governed by the current Returns & Exchanges policy. Garments must meet the stated condition and timing requirements unless applicable law gives additional rights.",
      "Nothing in these terms limits mandatory consumer protections or liability that cannot legally be limited."
    ]
  },
  {
    title: "Intellectual Property and Liability",
    paragraphs: [
      "The ỌNUỌRA name, marks, garments, photography, writing, software, and website design are protected. Content may not be copied, sold, or commercially reused without written permission.",
      "To the extent permitted by law, ỌNUỌRA is not responsible for indirect or unforeseeable loss, service interruption outside reasonable control, or misuse of the website."
    ]
  }
];

export default function TermsPage() {
  return (
    <PolicyPage
      eyebrow="Legal"
      title="Terms for Shopping the House."
      introduction="These terms set the expectations that apply when you browse, create an account, or purchase from ỌNUỌRA."
      effectiveDate="28 July 2026"
      sections={sections}
    />
  );
}
