import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId");
  if (!orderId) return NextResponse.json({ error: "Missing orderId" }, { status: 400 });

  const orders: Map<string, any> = (globalThis as any).__lingshu_orders;
  const order = orders?.get(orderId);

  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  return NextResponse.json({
    orderId,
    isPaid: order.isPaid,
    chartData: order.isPaid ? order.chartData : null,
  });
}
