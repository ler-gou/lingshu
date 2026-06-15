import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { orderId } = await req.json().catch(() => ({}));
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const orders: Map<string, any> = (globalThis as any).__lingshu_orders;
  if (!orders?.has(orderId)) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  orders.set(orderId, { ...orders.get(orderId), isPaid: true });
  return NextResponse.json({ success: true, orderId, isPaid: true });
}
