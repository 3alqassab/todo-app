import { NextApiRequest, NextApiResponse } from 'next'
import { setCookie } from 'nookies'
import jwt from 'jsonwebtoken'

const API_SECRET = process.env.API_SECRET

if (!API_SECRET) throw new Error('API_SECRET is not defined!')

export const login = (id: string, res: NextApiResponse) => {
	const token = jwt.sign({ id }, API_SECRET)

	setCookie({ res }, 'token', token, {
		maxAge: 30 * 24 * 60 * 60,
		path: '/',
	})
}

export const getUserId = (res: NextApiRequest) => {
	const token = res.headers.cookie?.split('token=')[1].split(';')[0]

	if (!token) return null

	const decodedToken = jwt.verify(token, API_SECRET) as { id: string }

	return decodedToken.id
}
