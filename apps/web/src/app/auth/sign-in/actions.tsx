'use server'

import { signInWithPassword } from '@/http/sign-in-with-password'
import { HTTPError } from 'ky'
import { z } from 'zod'
import { cookies } from 'next/headers'

const signSchema = z.object({
  email: z.string().email({ message: 'Please provide a valid email address.' }),
  password: z.string({ message: 'Please, provide a valid password.' }).min(1),
})

export async function signInWithEmailAndPassword(data: FormData) {
  const result = signSchema.safeParse(Object.fromEntries(data))

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    return { success: false, message: null, errors }
  }

  const { email, password } = result.data

  // await new Promise((resolve) => setTimeout(resolve, 2000))

  try {
    const { token } = await signInWithPassword({
      email,
      password,
    })

    cookies().set('token', token, {
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    })
  } catch (error) {
    if (error instanceof HTTPError) {
      const { message } = await error.response.json()
      return { success: false, message, errors: null }
    }

    console.error(error)
    return {
      success: false,
      message: 'Unaxpected error, try again in a few minutes',
      errors: null,
    }
  }

  return { success: true, message: null, errors: null }
}
