import { UnauthorizedError } from '@/_errors/unauthorized-error.js'
import { auth } from '@/http/middlewares/auth.js'
import { prisma } from '@/lib/prisma.js'
import { getUserPermissions } from '@/utils/get-user-permissions.js'
import { roleSchema } from '@saas/auth'
import type { FastifyInstance } from 'fastify'
import type { ZodTypeProvider } from 'fastify-type-provider-zod'
import { z } from 'zod'

export async function updateMember(app: FastifyInstance) {
  app
    .withTypeProvider<ZodTypeProvider>()
    .register(auth)
    .put(
      '/organizations/:slug/members/:memberId',
      {
        schema: {
          tags: ['members'],
          summary: 'Update a member role',
          security: [{ bearerAuth: [] }],
          params: z.object({
            slug: z.string(),
            memberId: z.string().uuid(),
          }),
          body: z.object({
            role: roleSchema,
          }),
          response: {
            204: z.null(),
          },
        },
      },
      async (request, reply) => {
        const { slug, memberId } = request.params
        const userId = await request.getCurrentUserId()
        const { membership, organization } =
          await request.getUserMembership(slug)

        const { cannot } = getUserPermissions(userId, membership.role)

        if (cannot('update', 'User')) {
          throw new UnauthorizedError(
            `You're not allowed to update this member`,
          )
        }

        const { role } = request.body

        await prisma.member.update({
          where: {
            id: memberId,
            organizationId: organization.id,
          },
          data: {
            role,
          },
        })

        return reply.status(204).send()
      },
    )
}
