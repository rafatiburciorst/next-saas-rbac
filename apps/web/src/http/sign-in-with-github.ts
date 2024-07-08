import { api } from './api-client'

interface SignInWithGithubRequest {
  code: string
}
interface SignInWithGithubResponse {
  token: string
}

export async function signInWithGithub({ code }: SignInWithGithubRequest) {
  console.log(code)
  const result = await api
    .post('sessions/github', {
      json: {
        code,
      },
    })
    .json<SignInWithGithubResponse>()
  return result
}
