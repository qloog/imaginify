import { redirect } from 'next/navigation'
import { Metadata } from 'next'
import Header from '@/components/shared/Header'
import TransformationForm from '@/components/shared/TransformationForm'
import { transformationTypes } from '@/constants'
import { getUserById } from '@/lib/actions/user.action'
import { auth } from '@clerk/nextjs'
import React from 'react'

export const metadata: Metadata = {
  title: "AI Image Editing Services | Restore, Fill, Remove, Recolor, and Replace Objects",
  description:
    "Discover our comprehensive AI image editing services! Restore old photos, fill in missing parts, remove backgrounds and objects, recolor elements, and seamlessly replace objects. Transform your images with ease using cutting-edge AI technology. Get started now!",
}

const AddTransformationPage = async ({ params: { type } }: SearchParamProps) => {
  const { userId } = auth();
  const transformation = transformationTypes[type];
  
  if (!userId) redirect('/sign-in')

  const user = await getUserById(userId);

  return (
    <>
      <Header 
        title={transformation.title}
        subtitle={transformation.subTitle}
      />

      <section className='mt-10'>
        <TransformationForm 
          action='Add'
          userId={user._id}
          type={transformation.type as TransformationTypeKey}
          creditBalance={user.creditBalance}
        />
      </section>
    </>
  )
}

export default AddTransformationPage