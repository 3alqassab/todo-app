import { useRouter } from 'next/router'
import { useState } from 'react'
import axios from 'axios'
import Head from 'next/head'

export default function Login() {
	const router = useRouter()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const [error, setError] = useState('')

	const handleLogin = async () => {
		setError('')
		await axios
			.post('http://localhost:3000/api/auth/login', {
				email,
				password,
			})
			.then(() => router.push('/'))
			.catch(() => setError('Invalid credentials'))
	}

	const handleRegister = async () => {
		setError('')
		await axios
			.post('http://localhost:3000/api/auth/register', {
				email,
				password,
			})
			.then(() => router.push('/'))
	}

	return (
		<>
			<Head>
				<title>Todo App</title>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
				<input
					type='email'
					placeholder='Email'
					value={email}
					onChange={e => setEmail(e.target.value)}
				/>

				<input
					type='password'
					placeholder='Password'
					value={password}
					onChange={e => setPassword(e.target.value)}
				/>

				<div style={{ display: 'flex', gap: '2rem' }}>
					<button style={{ flex: 1 }} type='button' onClick={handleLogin}>
						Login
					</button>

					<button style={{ flex: 1 }} type='button' onClick={handleRegister}>
						Register
					</button>
				</div>

				{!!error && (
					<p
						style={{ color: '#b00020', fontWeight: 'bold', fontSize: '0.8rem' }}
					>
						{error}
					</p>
				)}
			</main>
		</>
	)
}
