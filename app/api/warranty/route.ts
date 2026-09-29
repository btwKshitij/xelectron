import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/server/mail";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, productModel, serialNumber, invoiceNumber, purchaseDate } = body;

    if (!name || !email || !serialNumber || !invoiceNumber) {
      return NextResponse.json(
        { success: false, error: "Please fill in all required fields (Name, Email, Serial Number, Invoice Number)." },
        { status: 400 }
      );
    }

    const cleanSerial = String(serialNumber).trim().toUpperCase();
    const cleanInvoice = String(invoiceNumber).trim().toUpperCase();
    const cleanEmail = String(email).trim().toLowerCase();

    // Calculate valid until (1 year from purchase date or registration date)
    let validUntilDate: Date;
    if (purchaseDate) {
      validUntilDate = new Date(purchaseDate);
      if (isNaN(validUntilDate.getTime())) {
        validUntilDate = new Date();
      }
      validUntilDate.setFullYear(validUntilDate.getFullYear() + 1);
    } else {
      validUntilDate = new Date();
      validUntilDate.setFullYear(validUntilDate.getFullYear() + 1);
    }

    const formattedValidUntil = validUntilDate.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    const warrantyDetails = {
      name: String(name).trim(),
      email: cleanEmail,
      phone: phone ? String(phone).trim() : "",
      productModel: productModel ? String(productModel).trim() : "XElectron Device",
      serialNumber: cleanSerial,
      invoiceNumber: cleanInvoice,
      purchaseDate: purchaseDate ? String(purchaseDate).trim() : new Date().toISOString().split("T")[0],
      validUntil: formattedValidUntil,
      status: "Active Coverage",
      coverage: "Standard 1-Year Comprehensive Manufacturer Warranty",
      registeredAt: new Date().toISOString(),
    };

    // Save to database as a SUPPORT_REQUEST of kind WARRANTY
    await db.supportRequest.create({
      data: {
        kind: "WARRANTY",
        details: warrantyDetails,
      },
    });

    // Send email notification to customercare@xelectron.com
    try {
      await sendEmail({
        to: "customercare@xelectron.com",
        subject: `[New Warranty Registration] ${cleanSerial} - ${warrantyDetails.productModel}`,
        html: `
          <h2>New Warranty Registration Received</h2>
          <p><strong>Customer:</strong> ${warrantyDetails.name}</p>
          <p><strong>Email:</strong> ${warrantyDetails.email}</p>
          <p><strong>Phone:</strong> ${warrantyDetails.phone}</p>
          <p><strong>Product:</strong> ${warrantyDetails.productModel}</p>
          <p><strong>Serial Number:</strong> ${warrantyDetails.serialNumber}</p>
          <p><strong>Invoice Number:</strong> ${warrantyDetails.invoiceNumber}</p>
          <p><strong>Purchase Date:</strong> ${warrantyDetails.purchaseDate}</p>
          <p><strong>Coverage Valid Until:</strong> ${warrantyDetails.validUntil}</p>
        `,
      });
    } catch (e) {
      console.warn("Could not send admin warranty email:", e);
    }

    return NextResponse.json({
      success: true,
      data: warrantyDetails,
    });
  } catch (error) {
    console.error("Warranty registration error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process warranty registration. Please try again." },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query")?.trim();

    if (!query) {
      return NextResponse.json(
        { success: false, error: "Please enter a Serial Number or Invoice Number." },
        { status: 400 }
      );
    }

    const cleanQuery = query.toUpperCase();

    // 1. Search in SupportRequest with kind: "WARRANTY"
    const warrantyRequests = await db.supportRequest.findMany({
      where: { kind: "WARRANTY" },
      orderBy: { createdAt: "desc" },
      take: 300,
    });

    for (const req of warrantyRequests) {
      const details = req.details as any;
      if (!details) continue;

      const serial = String(details.serialNumber || "").toUpperCase();
      const invoice = String(details.invoiceNumber || "").toUpperCase();
      const email = String(details.email || "").toUpperCase();
      const phone = String(details.phone || "").replace(/[^0-9]/g, "");
      const cleanNumericQuery = query.replace(/[^0-9]/g, "");

      if (
        (serial && (serial === cleanQuery || serial.includes(cleanQuery))) ||
        (invoice && (invoice === cleanQuery || invoice.includes(cleanQuery))) ||
        (email && email === cleanQuery) ||
        (cleanNumericQuery.length >= 10 && phone.includes(cleanNumericQuery))
      ) {
        return NextResponse.json({
          success: true,
          found: true,
          data: {
            product: details.productModel || "XElectron Device",
            status: details.status || "Active Coverage",
            serial: details.serialNumber || query,
            invoice: details.invoiceNumber || "N/A",
            validUntil: details.validUntil || "1 Year from Purchase",
            coverage: details.coverage || "Standard 1-Year Comprehensive Manufacturer Warranty",
            customerName: details.name,
          },
        });
      }
    }

    // 2. Search in Orders if query matches order ID or tracking
    try {
      const order = await db.order.findFirst({
        where: {
          OR: [
            { id: { equals: query, mode: "insensitive" } },
            { id: { contains: query, mode: "insensitive" } },
          ],
        },
        include: { items: { include: { product: true } } },
      });

      if (order) {
        const orderDate = new Date(order.createdAt);
        const validUntil = new Date(orderDate);
        validUntil.setFullYear(validUntil.getFullYear() + 1);

        const productName = order.items?.[0]?.product?.name || "XElectron Product";

        return NextResponse.json({
          success: true,
          found: true,
          data: {
            product: productName,
            status: "Active - Verified Purchase",
            serial: `ORD-${order.id.slice(-6).toUpperCase()}`,
            invoice: `INV-${order.id.slice(-6).toUpperCase()}`,
            validUntil: validUntil.toLocaleDateString("en-IN", {
              day: "numeric",
              month: "long",
              year: "numeric",
            }),
            coverage: "Standard 1-Year Manufacturer Warranty",
            customerName: order.customerName,
          },
        });
      }
    } catch {}

    return NextResponse.json({
      success: true,
      found: false,
      message: `No active warranty record found for "${query}". If you recently purchased your device, please submit your registration using the "Register a device" tab above.`,
    });
  } catch (error) {
    console.error("Warranty status check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check warranty status." },
      { status: 500 }
    );
  }
}
