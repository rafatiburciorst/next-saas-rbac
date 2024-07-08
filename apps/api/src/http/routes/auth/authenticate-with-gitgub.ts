import { BadRequestError } from '@/_errors/bad-request-error'
import { prisma } from '@/lib/prisma'
import { env } from '@saas/env'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function authenticateWithGithub(app: FastifyInstance) {
  app.withTypeProvider<ZodTypeProvider>().post(
    '/sessions/github',
    {
      schema: {
        tags: ['auth'],
        summary: 'Authenticate with email & password',
        body: z.object({
          code: z.string(),
        }),
        response: {
          201: z.object({
            token: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { code } = request.body
      console.log('TOKEN', code)
      const githubOauthUrl = new URL(
        'https://github.com/login/oauth/access_token',
      )
      githubOauthUrl.searchParams.set('client_id', env.GITHUB_OUTH_CLIENT_ID)
      githubOauthUrl.searchParams.set(
        'client_secret',
        env.GITHUB_OUTH_CLIENT_SECRET,
      )
      githubOauthUrl.searchParams.set(
        'redirect_uri',
        env.GITHUB_OUTH_REDIRECT_URI,
      )
      githubOauthUrl.searchParams.set('code', code)

      const githubAccessTokenResponse = await fetch(githubOauthUrl, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
        },
      })

      const githubAccessTokenData = await githubAccessTokenResponse.json()

      const { access_token: gitgubAccessToken } = z
        .object({
          access_token: z.string(),
          token_type: z.literal('bearer'),
          scope: z.string(),
        })
        .parse(githubAccessTokenData)

      const gitgubUserResponse = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${gitgubAccessToken}`,
        },
      })

      const gitgubUserData = await gitgubUserResponse.json()
      // https://github.com/login/oauth/authorize?client_id=Ov23liOFdHKDGfT3SU4j&redirect_uri=http://localhost:3000/api/auth/callback&scope=user:email
      // console.log(gitgubUserData)

      const {
        id: githubId,
        name,
        email,
        avatar_url: avatarUrl,
      } = z
        .object({
          id: z.number().int().transform(String),
          avatar_url: z.string().url(),
          name: z.string().nullable(),
          email: z.string().nullable(),
        })
        .parse(gitgubUserData)

      if (!email) {
        throw new BadRequestError(
          'Your Github account must have an email to authenticate',
        )
      }

      let user = await prisma.user.findUnique({
        where: { email },
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            name,
            email,
            avatarUrl,
          },
        })
      }

      let account = await prisma.account.findUnique({
        where: {
          provider_userId: {
            provider: 'GITHUB',
            userId: user.id,
          },
        },
      })

      if (!account) {
        account = await prisma.account.create({
          data: {
            provider: 'GITHUB',
            providerAccountId: githubId,
            userId: user.id,
          },
        })
      }

      const token = await reply.jwtSign(
        {
          sub: user.id,
        },
        {
          sign: {
            expiresIn: '7d',
          },
        },
      )

      return reply.status(201).send({ token })
    },
  )
}
