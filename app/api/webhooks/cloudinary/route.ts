// app/api/webhooks/cloudinary/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

// Cloudinary webhook signature verification
function verifyWebhookSignature(
  body: string,
  signature: string,
  timestamp: string,
): boolean {
  const apiSecret =
    process.env.CLOUDINARY_API_SECRET || "qgPLKwlIIRh3dKSRe98Bao5hTXU";

  // Cloudinary sends signature as SHA256 hash of body + timestamp + api_secret
  const expectedSignature = crypto
    .createHash("sha256")
    .update(body + timestamp + apiSecret)
    .digest("hex");

  return signature === expectedSignature;
}

export async function POST(request: Request) {
  try {
    // Get the raw body as text for signature verification
    const bodyText = await request.text();

    // Get signature and timestamp from headers
    const signature = request.headers.get("x-cld-signature") || "";
    const timestamp = request.headers.get("x-cld-timestamp") || "";

    // Verify webhook signature (optional but recommended for production)
    // Uncomment this in production:
    // if (!verifyWebhookSignature(bodyText, signature, timestamp)) {
    //   console.error('Invalid webhook signature');
    //   return new NextResponse('Unauthorized', { status: 401 });
    // }

    // Parse the payload
    const payload = JSON.parse(bodyText);

    console.log("Cloudinary webhook received:", payload);

    // Extract upload notification data
    if (payload.notification_type === "upload") {
      const imageData = {
        url: payload.secure_url || payload.url,
        date: payload.created_at || new Date().toISOString(),
        name: payload.public_id || payload.asset_id,
        format: payload.format,
        width: payload.width,
        height: payload.height,
        bytes: payload.bytes,
        tags: payload.tags || [],
        folder: payload.folder || "",
      };

      console.log("Image uploaded:", imageData);

      // Here you can:
      // 1. Store in database
      // 2. Trigger other webhooks
      // 3. Process the image further
      // 4. Send notifications

      return NextResponse.json({
        status: "success",
        message: "Webhook processed successfully",
        data: imageData,
      });
    }

    // Handle other notification types
    return NextResponse.json({
      status: "ok",
      message: "Webhook received but not processed",
      notification_type: payload.notification_type,
    });
  } catch (error) {
    console.error("Error processing Cloudinary webhook:", error);
    return new NextResponse("Bad Request", { status: 400 });
  }
}

// Optional: Handle GET requests for webhook verification
export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Cloudinary webhook endpoint is active",
  });
}
