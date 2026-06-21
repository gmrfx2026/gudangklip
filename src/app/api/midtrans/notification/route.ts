import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { coreApi } from "@/lib/midtrans";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const serverKey = process.env.MIDTRANS_SERVER_KEY || "";
    const orderId = body.order_id as string;
    const transactionStatus = body.transaction_status as string;
    const fraudStatus = body.fraud_status as string;
    const transactionId = body.transaction_id as string;
    const paymentType = body.payment_type as string;
    const statusCode = body.status_code as string;

    const rawHash = `${orderId}${statusCode}${body.gross_amount}${serverKey}`;
    const signatureKey = crypto.createHash("sha512").update(rawHash).digest("hex");

    if (body.signature_key !== signatureKey) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 403 });
    }

    const transaction = await prisma.transaction.findUnique({
      where: { midtransOrderId: orderId },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (transaction.status === "SUCCESS" || transaction.status === "FAILED") {
      return NextResponse.json({ status: "Already processed" });
    }

    let newStatus = transaction.status;
    let paidAt: Date | null = null;

    if (transactionStatus === "capture" && fraudStatus === "accept") {
      newStatus = "SUCCESS";
      paidAt = new Date();
    } else if (transactionStatus === "settlement") {
      newStatus = "SUCCESS";
      paidAt = new Date();
    } else if (["cancel", "deny", "expire"].includes(transactionStatus)) {
      newStatus = "FAILED";
    } else if (transactionStatus === "pending") {
      newStatus = "PENDING";
    }

    await prisma.transaction.update({
      where: { midtransOrderId: orderId },
      data: {
        status: newStatus,
        midtransTransactionId: transactionId,
        paymentMethod: paymentType,
        paidAt,
      },
    });

    if (newStatus === "SUCCESS") {
      await prisma.user.update({
        where: { id: transaction.userId },
        data: { walletBalance: { increment: transaction.amount } },
      });
    }

    return NextResponse.json({ status: "OK" });
  } catch (error) {
    console.error("Midtrans notification error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
