import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { FastifyRequest, FastifyReply } from "fastify"
import { hash } from "bcryptjs"
import { RegisterUseCase } from "@/use-cases/register"
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository"
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists"
import { AuthenticateUseCase } from "@/use-cases/authenticate"
import { InvalidCredentialsError } from "@/use-cases/errors/invalid-credentials-error"

export async function authenticate(request: FastifyRequest, reply: FastifyReply) {
    const authenticateBodySchema = z.object({
        email: z.string().email(),
        password: z.string().min(6),
    })

    const { email, password } = authenticateBodySchema.parse(request.body)

    try {
        const UsersRepository = new PrismaUsersRepository()
        const authenticateUseCase = new AuthenticateUseCase(UsersRepository)

        await authenticateUseCase.execute({ email, password })
    } catch (err) {
        if(err instanceof InvalidCredentialsError) {
            return reply.status(400).send({ message: err.message })
        }

        throw err
    }

    return reply.status(200).send()
}