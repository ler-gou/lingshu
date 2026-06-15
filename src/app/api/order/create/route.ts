import { NextRequest, NextResponse } from "next/server";

// In-memory order store (in production, use DB)
const orders = new Map<string, { chartData: any; isPaid: boolean; createdAt: number }>();

export async function POST(req: NextRequest) {
  const { chartData, module } = await req.json().catch(() => ({}));
  if (!chartData) return NextResponse.json({ error: "Missing chartData" }, { status: 400 });

  const orderId = `lx_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  orders.set(orderId, { chartData, isPaid: false, createdAt: Date.now() });

  // Generate mock payment URL (in production, this is WeChat/Alipay QR URL)
  const mockPayUrl = `/api/payment/pay?orderId=${orderId}`;

  // Store for webhook access
  (globalThis as any).__lingshu_orders = orders;

  return NextResponse.json({
    orderId,
    payUrl: mockPayUrl,
    status: "pending",
    expiresIn: 600, // 10 minutes
  });
}

export { orders };
