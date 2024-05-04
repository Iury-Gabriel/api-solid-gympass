import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { FastifyRequest, FastifyReply } from "fastify"
import { hash } from "bcryptjs"
import { RegisterUseCase } from "@/use-cases/register"
import { PrismaUsersRepository } from "@/repositories/prisma/prisma-users-repository"
import { UserAlreadyExistsError } from "@/use-cases/errors/user-already-exists"

export async function register(request: FastifyRequest, reply: FastifyReply) {
    const registerBodySchema = z.object({
        name: z.string(),
        email: z.string().email(),
        password: z.string().min(6),
    })

    const { name, email, password } = registerBodySchema.parse(request.body)

    try {
        const UsersRepository = new PrismaUsersRepository()
        const registerUseCase = new RegisterUseCase(UsersRepository)

        await registerUseCase.execute({ name, email, password })
    } catch (err) {
        if(err instanceof UserAlreadyExistsError) {
            return reply.status(409).send({ message: err.message })
        }

        return reply.status(500).send() // Todo Fix Me
    }

    return reply.status(201).send()
}