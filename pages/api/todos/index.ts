// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { getUserId } from '@/functions/authentication'
import { Prisma, PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const database = new PrismaClient()

type Data =
	| Prisma.TodoMinAggregateOutputType
	| string
	| Prisma.TodoMinAggregateOutputType[]

const handleGet = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
	const id = getUserId(req)
	if (!id) return res.status(401).send('Unauthorized')

	const todos = await database.todo.findMany({
		where: { userId: id },
		orderBy: { deadline: 'asc' },
	})

	return res.status(200).json(todos)
}

const handlePost = async (req: NextApiRequest, res: NextApiResponse<Data>) => {
	if (!req.body?.title || !req.body?.deadline)
		return res.status(400).send('Bad Request')

	const id = getUserId(req)
	if (!id) return res.status(401).send('Unauthorized')

	const { title, deadline, description } = req.body

	const todo = await database.todo.create({
		data: { title, deadline, description, user: { connect: { id } } },
	})

	return res.status(201).json(todo)
}

export default function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>,
) {
	switch (req.method) {
		case 'GET':
			return handleGet(req, res)
		case 'POST':
			return handlePost(req, res)
		default:
			return res.status(405).send('Method Not Allowed')
	}
}
