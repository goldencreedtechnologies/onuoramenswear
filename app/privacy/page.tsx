import { PolicyPage } from "@/components/policy-page";

export const metadata = {
  title: "Privacy Policy",
  description: "How ỌNUỌRA collects, uses, stores, and protects personal information."
};

const sections = [
  {
    title: "Information We Collect",
    paragraphs: [
      "We collect information you provide when you create an account, place an order, request client care, join ỌNUỌRA Circle, or otherwise communicate with the house."
    ],
    bullets: [
      "Identity and contact information, including name, email address, telephone number, and account credentials.",
      "Order and delivery information, including selected garments, sizing, destination, delivery notes, and transaction references.",
      "Technical and usage information, including device, browser, approximate location, page activity, and security events."
    ]
  },
  {
    title: "How Information Is Used",
    paragraphs: [
      "Information is used to provide the storefront, process orders, calculate delivery, prevent fraud, support customers, maintain inventory, improve site performance, and communicate where permission or another lawful basis applies.",
      "Payment card details are handled by our payment provider and are not stored in full by ỌNUỌRA."
    ]
  },
  {
    title: "Sharing and Service Providers",
    paragraphs: [
      "We share only the information reasonably required by trusted providers supporting payment, hosting, authentication, analytics, communication, fulfilment, and delivery. Providers are expected to process data for agreed purposes and protect it appropriately.",
      "We may disclose information where required by law, to protect customers or the business, or in connection with a legitimate corporate transaction."
    ]
  },
  {
    title: "Retention and Security",
    paragraphs: [
      "Records are retained for as long as required to provide services, satisfy legal and accounting obligations, resolve disputes, and maintain security. Retention periods vary by record type.",
      "ỌNUỌRA uses access controls, encrypted connections, service separation, and operational monitoring. No online system is risk-free, and customers should use a unique password and protect their devices."
    ]
  },
  {
    title: "Your Choices and Rights",
    paragraphs: [
      "Depending on your location, you may request access, correction, deletion, restriction, portability, or objection regarding your personal information. You may also withdraw marketing consent at any time.",
      "We may need to verify identity before completing a request and may retain information where law or a legitimate operational requirement permits."
    ]
  },
  {
    title: "Cookies and Updates",
    paragraphs: [
      "Essential storage supports authentication, cart state, and security. Optional analytics or marketing technologies should operate only as permitted by applicable law and your choices.",
      "This policy may be revised as our services, providers, or legal obligations change. The effective date above identifies the current version."
    ]
  }
];

export default function PrivacyPage() {
  return (
    <PolicyPage
      eyebrow="Legal"
      title="Privacy, Handled With Discretion."
      introduction="This policy explains the personal information ỌNUỌRA processes and the choices available to you."
      effectiveDate="28 July 2026"
      sections={sections}
    />
  );
}
