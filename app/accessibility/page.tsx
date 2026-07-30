import { PolicyPage } from "@/components/policy-page";

export const metadata = {
  title: "Accessibility",
  description: "ỌNUỌRA's commitment to an inclusive and accessible digital shopping experience."
};

const sections = [
  {
    title: "Our commitment",
    paragraphs: [
      "ỌNUỌRA is committed to making its digital experience usable by as many people as possible, including customers who use assistive technologies or navigate with different visual, motor, auditory, or cognitive needs.",
      "We work toward the Web Content Accessibility Guidelines and review accessibility as the site and services evolve."
    ]
  },
  {
    title: "What the site supports",
    paragraphs: [
      "The storefront is designed with semantic page structure, keyboard-operable controls, visible focus states, descriptive labels, responsive layouts, text alternatives for meaningful imagery, and strong contrast across the consistent ỌNUỌRA palette."
    ],
    bullets: [
      "Keyboard navigation for menus, filters, product options, dialogs, cart controls, and checkout.",
      "Reduced-motion support for customers who prefer less animation.",
      "Zoom and responsive reflow across common mobile and desktop viewports.",
      "Clear error, stock, size, delivery, and payment messaging."
    ]
  },
  {
    title: "Known limitations",
    paragraphs: [
      "Some third-party payment, mapping, authentication, or embedded services may provide experiences outside our direct control. We select reputable providers and raise accessibility issues when they are identified.",
      "Fashion photography can contain visual detail that is difficult to describe completely; product names, colours, angles, construction, and garment copy are provided alongside imagery."
    ]
  },
  {
    title: "Requesting assistance",
    paragraphs: [
      "If any part of the website prevents you from completing a purchase or accessing information, contact Client Care with the page, device, browser, and assistance needed. We will offer a reasonable alternative and use the report to improve the service."
    ]
  }
];

export default function AccessibilityPage() {
  return (
    <PolicyPage
      eyebrow="Accessibility"
      title="Luxury should welcome every client."
      introduction="Our aim is an elegant experience that remains clear, operable, and understandable across abilities and devices."
      effectiveDate="28 July 2026"
      sections={sections}
    />
  );
}
