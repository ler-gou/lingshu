import { NextRequest, NextResponse } from "next/server";

// Mock payment page — in production this is WeChat/Alipay redirect
export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("orderId") || "unknown";
  const html = `<!DOCTYPE html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>支付确认</title>
<style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:-apple-system,sans-serif;background:#f5f5f7;display:flex;align-items:center;justify-content:center;min-height:100vh}
.card{background:#fff;border-radius:24px;padding:40px 32px;text-align:center;max-width:360px;width:100%;box-shadow:0 2px 20px rgba(0,0,0,0.06)}
h2{font-size:20px;margin-bottom:8px;color:#1d1d1f}p{color:#86868b;font-size:14px;margin-bottom:24px}
.btn{background:#1d1d1f;color:#c5a059;border:none;border-radius:16px;padding:14px 32px;font-size:16px;font-weight:600;cursor:pointer;width:100%;transition:opacity .2s}
.btn:hover{opacity:.9}.btn:active{opacity:.8}
.note{font-size:12px;color:#aeaeb2;margin-top:16px}</style></head><body>
<div class="card"><h2>￥19.9</h2><p>灵枢 · 深度命书</p><p style="font-size:12px;color:#86868b;margin-bottom:20px">订单: ${orderId}</p>
<button class="btn" onclick="pay()">确认支付（模拟）</button><p class="note">这是演示环境 · 点击即支付成功</p></div>
<script>
async function pay(){try{await fetch('/api/payment/webhook',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({orderId:'${orderId}'})});document.querySelector('.btn').textContent='✅ 支付成功！';setTimeout(()=>{window.close()},1500)}catch(e){alert('失败:'+e.message)}}
</script></body></html>`;
  return new NextResponse(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
