"use server";

import { configureLemonSqueezy } from '@/config/lemonsqueezy'
import { createCheckout } from '@lemonsqueezy/lemonsqueezy.js'
import { auth } from '@clerk/nextjs'
import { getUserById } from './user.action'
import { redirect } from 'next/navigation';

/**
 * This action will create a checkout on Lemon Squeezy.
 */
export async function getCheckoutURL(variantId: number, credits: number, plan: string, embed = false) {
  configureLemonSqueezy()

  const { userId } = auth()

  if (!userId) {
    throw new Error('User is not authenticated.')
  }

  const user = await getUserById(userId);

  const checkout = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    variantId,
    {
      checkoutOptions: {
        embed,
        media: false,
        logo: !embed,
      },
      checkoutData: {
        email: user.email ?? undefined,
        custom: {
          user_id: String(user._id),
          credits: String(credits),
          plan: plan,
        },
      },
      productOptions: {
        enabledVariants: [variantId],
        redirectUrl: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
        receiptButtonText: 'Go to Profile',
        receiptThankYouNote: 'Thank you for signing up to AIGC Studio!',
      },
    }
  )

  console.log('=====Check URL=====', checkout.data?.data.attributes.url)

  return checkout.data?.data.attributes.url;
}