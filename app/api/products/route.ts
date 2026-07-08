import { NextResponse } from "next/server";
import { getStoreProducts } from "@/lib/backend/catalog";

export async function GET() {
  const products = await getStoreProducts();
  return NextResponse.json({ products });
}
