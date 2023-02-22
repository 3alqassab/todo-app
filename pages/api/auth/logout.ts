import { withSessionRoute } from '@/functions/withSession'
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = string

async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
	req.session.destroy()

	return res.status(200).send('Logged out')
}

export default withSessionRoute(handler)
