// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { login } from '@/functions/authentication'
import { PrismaClient } from '@prisma/client'
import type { NextApiRequest, NextApiResponse } from 'next'

const database = new PrismaClient()

type Data = string

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>,
) {
	if (!req.body?.email || !req.body?.password)
		return res.status(400).send('Bad Request')

	const { email, password } = req.body

	const user = await database.user.create({
		data: { email, password },
	})

	login(user.id, res)

	return res.status(200).send('Registered')
}
