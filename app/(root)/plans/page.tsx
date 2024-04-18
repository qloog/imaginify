import Image from "next/image";
import { redirect } from "next/navigation";
import { Metadata } from 'next';
import { SignedIn, auth } from "@clerk/nextjs";

import Header from "@/components/shared/Header";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { RocketIcon } from "@radix-ui/react-icons"

import { plans } from "@/constants";
import { getUserById } from "@/lib/actions/user.action";
import Checkout from "@/components/shared/CheckoutLemon";

export const metadata: Metadata = {
  title: "AI Image Enhancement Plans | Choose the Perfect Plan for Your Photos",
  description:
    "Explore our range of AI image enhancement plans tailored to meet your needs! Select the ideal plan to enhance your photos with ease. Find the perfect balance of features and affordability to elevate your images to new heights. Get started now!",
}

const Credits = async () => {
  const { userId } = auth();

  if (!userId) redirect("/sign-in");

  const user = await getUserById(userId);

  return (
    <>
      <Header
        title="Buy Credits"
        subtitle="Choose a credit package that suits your needs!"
      />

      <section>
        <Alert className='mt-5'>
          <RocketIcon className="h-4 w-4" />
          <AlertTitle>Warm reminder: 1 Credit = 1 Image</AlertTitle>
          <AlertDescription>
            
          </AlertDescription>
        </Alert>
        <ul className="credits-list">
          {plans.map((plan) => (
            <li key={plan.name} className="credits-item">
              <div className="flex-center flex-col gap-3">
                <Image src={plan.icon} alt="check" width={50} height={50} />
                <p className="p-20-semibold mt-2 text-purple-500">
                  {plan.name}
                </p>
                <p className="h1-semibold text-dark-600">${plan.price}</p>
                <p className="p-16-regular">{plan.credits} Credits</p>
              </div>

              {/* Inclusions */}
              <ul className="flex flex-col gap-5 py-9">
                {plan.inclusions.map((inclusion) => (
                  <li
                    key={plan.name + inclusion.label}
                    className="flex items-center gap-4"
                  >
                    <Image
                      src={`/assets/icons/${
                        inclusion.isIncluded ? "check.svg" : "cross.svg"
                      }`}
                      alt="check"
                      width={24}
                      height={24}
                    />
                    <p className="p-16-regular">{inclusion.label}</p>
                  </li>
                ))}
              </ul>

              {plan.name === "Free" ? (
                <Button variant="outline" className="credits-btn">
                  Free Consumable
                </Button>
              ) : (
                <SignedIn>
                  <Checkout
                    variant_id={Number(plan.lemon_variant_id)}
                    plan={plan.name}
                    amount={plan.price}
                    credits={plan.credits}
                    buyerId={user._id}
                  />
                </SignedIn>
              )}
            </li>
          ))}
        </ul>
      </section>
    </>
  );
};

export default Credits;