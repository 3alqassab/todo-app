// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'

type Data = string

export default async function handler(
	req: NextApiRequest,
	res: NextApiResponse<Data>,
) {
	res.setHeader(
		'Set-Cookie',
		'sid=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;',
	)

	return res.status(200).send('Logged out')
}
