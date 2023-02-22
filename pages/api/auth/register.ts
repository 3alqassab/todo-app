import { PrismaClient } from '@prisma/client'
import { withSessionRoute } from '@/functions/withSession'
import type { NextApiRequest, NextApiResponse } from 'next'

const database = new PrismaClient()

type Data = string

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	if (!req.body?.email || !req.body?.password)
		return res.status(400).send('Bad Request')

	const { email, password } = req.body

	const user = await database.user.create({
		data: { email, password },
	})

	req.session.user = { id: user.id }
	await req.session.save()

	return res.status(200).send('Registered')
}

export default withSessionRoute(handler)
