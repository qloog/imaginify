"use client";

import { loadStripe } from "@stripe/stripe-js";
import { useEffect } from "react";

import { useToast } from "@/components/ui/use-toast";
import { checkoutCredits } from "@/lib/actions/transaction.action";

import { Button } from "../ui/button";
import { getCheckoutURL } from '@/lib/actions/lemonsqueezy.action';
import { redirect } from 'next/navigation';

const Checkout = ({
  variant_id,
  plan,
  amount,
  credits,
  buyerId,
}: {
  variant_id: number,
  plan: string;
  amount: number;
  credits: number;
  buyerId: string;
}) => {
  const { toast } = useToast();

  useEffect(() => {
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      toast({
        title: "Order placed!",
        description: "You will receive an email confirmation",
        duration: 5000,
        className: "success-toast",
      });
    }

    if (query.get("canceled")) {
      toast({
        title: "Order canceled!",
        description: "Continue to shop around and checkout when you're ready",
        duration: 5000,
        className: "error-toast",
      });
    }
  }, []);

  const onCheckout = async () => {
    // const transaction = {
    //   plan,
    //   amount,
    //   credits,
    //   buyerId,
    // };

    const checkoutURL = await getCheckoutURL(variant_id, credits, plan);

    redirect(checkoutURL!);
  };

  return (
    <form action={onCheckout} method="POST">
      <section>
        <Button
          type="submit"
          role="link"
          className="w-full rounded-full bg-purple-gradient bg-cover"
        >
          Buy Credit
        </Button>
      </section>
    </form>
  );
};

export default Checkout;