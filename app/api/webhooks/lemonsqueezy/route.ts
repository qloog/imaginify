import { createTransaction } from '@/lib/actions/transaction.action';
import { webhookHasMeta } from '@/lib/lemonsqueezy';
import crypto from "crypto";
import { LogSnag, TrackOptions } from 'logsnag';
import { any } from 'zod';

// see: https://docs.lemonsqueezy.com/guides/tutorials/webhooks-logsnag
//      https://github.com/lmsqueezy/nextjs-billing/blob/main/src/app/api/webhook/route.ts
//      https://github.com/lmsqueezy/logsnag-nextjs

const logsnag = new LogSnag({
  token: String(process.env.LOGSNAG_TOKEN),
  project: String(process.env.LOGSNAG_PROJECT)
});

export async function POST(request: Request) {
  if (!process.env.LEMONSQUEEZY_WEBHOOK_SECRET) {
    return new Response("Lemon Squeezy Webhook Secret not set in .env", {
      status: 500,
    });
  }

  // First, make sure the request is from Lemon Squeezy.
  const rawBody = await request.text();
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;

  const hmac = crypto.createHmac("sha256", secret);
  const digest = Buffer.from(hmac.update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(request.headers.get("X-Signature") ?? "", "utf8");

  if (!crypto.timingSafeEqual(digest, signature)) {
    return new Response("Invalid signature", { status: 400 });
  }

  const data = JSON.parse(rawBody) as any;

  // https://docs.lemonsqueezy.com/guides/developer-guide/webhooks#example-webhook-data
  const eventName = data['meta']['event_name']
  const userId = data['meta']['custom_data']['user_id']
  const obj = data['data']['attributes']
  const objId = data['data']['id']

  if (eventName) {
 
    let eventData: TrackOptions;

    switch (eventName) {
        case 'order_created':

            eventData = {
                channel: process.env.LOGSNAG_CHANNEL!,
                event: "New order",
                user_id: userId ?? obj['customer_id'],
                description: `${obj['first_order_item']['product_name']} (${obj['first_order_item']['variant_name']})\n${obj['subtotal_formatted']} (\+${obj['tax_formatted']} tax)\nOrder #${obj['order_number']} • ${obj['user_email']} • ${obj['user_name']}\n[View order](https://app.lemonsqueezy.com/orders/${obj['identifier']})`,
                icon: "💳",
                notify: true,
                tags: {
                    email: obj['user_email'],
                    'customer-id': obj['customer_id']
                },
                parser: "markdown"
            }

             // Send to LogSnag
             await logsnag.track(eventData)

            // Create transaction
            const transaction = {
              paymentMethod: 'lemon_squeezy',
              stripeId: objId,
              amount: Number(obj['total']) ? Number(obj['total']) / 100 : 0,
              plan: data['meta']['custom_data']?.plan || "",
              credits: Number(data['meta']['custom_data']?.credits) || 0,
              buyerId: userId || "",
              createdAt: new Date(),
            };
        
            const newTransaction = await createTransaction(transaction);
            
            break;
    }

    return new Response("OK", { status: 200 });
  }

  return new Response("Data invalid", { status: 400 });
}