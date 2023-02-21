// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getUserId } from '@/functions/authentication'
import { Prisma, PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const database = new PrismaClient()

type Data =
	| Prisma.TodoMinAggregateOutputType
	| string
	| Prisma.TodoMinAggregateOutputType[]

const handlePut = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
	const { todoId } = req.query

	if (!todoId) return res.status(400).send('Bad Request')

	const userId = getUserId(req)
	if (!userId) return res.status(401).send('Unauthorized')

	const { title, status, deadline, description } = req.body

	const todo = await database.todo.findUniqueOrThrow({
		where: { id: todoId as string },
	})

	if (todo.userId !== userId) return res.status(401).send('Unauthorized')

	if (status === 'ARCHIVED' && todo.status !== 'COMPLETED') {
		return res.status(400).send('Bad Request')
	}

	const newTodo = await database.todo.update({
		where: { id: todoId as string },
		data: { title, status, deadline, description },
	})

	return res.status(201).json(newTodo)
}

const handleDelete = async (
	req: NextApiRequest,
	res: NextApiResponse<Data>,
) => {
	const { todoId } = req.query

	if (!todoId) return res.status(400).send('Bad Request')

	const userId = getUserId(req)
	if (!userId) return res.status(401).send('Unauthorized')

	const todo = await database.todo.findUniqueOrThrow({
		where: { id: todoId as string },
	})

	if (todo.userId !== userId) return res.status(401).send('Unauthorized')

	await database.todo.delete({ where: { id: todoId as string } })

	return res.status(201).json(todo)
}

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>,
) {
	switch (req.method) {
		case 'PUT':
			return handlePut(req, res)
		case 'DELETE':
			return handleDelete(req, res)
		default:
			return res.status(405).send('Method Not Allowed')
	}
}
