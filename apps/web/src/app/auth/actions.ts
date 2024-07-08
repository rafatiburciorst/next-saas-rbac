'use server'

import { redirect } from 'next/navigation'

export async function signInWithGitHub() {
  const gitHubSignInUrl = new URL('login/oauth/authorize', 'https://github.com')
  gitHubSignInUrl.searchParams.set('client_id', 'Ov23liOFdHKDGfT3SU4j')
  gitHubSignInUrl.searchParams.set(
    'redirect_uri',
    'http://localhost:3000/api/auth/callback',
  )
  gitHubSignInUrl.searchParams.set('scope', 'user')

  redirect(gitHubSignInUrl.toString())
}
