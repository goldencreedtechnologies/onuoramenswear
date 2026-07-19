import Stripe from "stripe";
import { getStripeSecretKey } from "@/lib/backend/env";

export function createStripeClient() {
  const secretKey = getStripeSecretKey();

  if (!secretKey) {
    throw new Error("Missing STRIPE_SECRET_KEY.");
  }

  return new Stripe(secretKey);
}
