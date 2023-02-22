import { useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useState } from 'react'
import axios from 'axios'
import Head from 'next/head'

export default function Login() {
	const router = useRouter()

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')

	const [error, setError] = useState('')

	const { mutate: handleLogin, isLoading: handleLoginLoading } = useMutation({
		mutationFn: () => axios.post('/api/auth/login', { email, password }),
		onSuccess: () => router.push('/'),
		onError: () => setError('Invalid credentials'),
	})

	const { mutate: handleRegister, isLoading: handleRegisterLoading } =
		useMutation({
			mutationFn: () => axios.post('/api/auth/register', { email, password }),
			onSuccess: () => router.push('/'),
			onError: () => setError('User already exists'),
		})

	const isLoading = handleLoginLoading || handleRegisterLoading

	return (
		<>
			<Head>
				<title>Todo App</title>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className='flex h-screen w-screen items-center justify-center'>
				<div className='flex flex-col gap-4 overflow-hidden rounded-md shadow-lg'>
					<div className='flex flex-col gap-2 p-4'>
						<label htmlFor='email'>Email</label>
						<input
							id='email'
							type='email'
							placeholder='Email'
							className='mb-6 rounded-lg border-2 p-2'
							value={email}
							disabled={isLoading}
							onChange={e => setEmail(e.target.value)}
						/>

						<label htmlFor='password'>Password</label>
						<input
							id='password'
							type='password'
							placeholder='Password'
							className='rounded-lg border-2 p-2'
							value={password}
							disabled={isLoading}
							onChange={e => setPassword(e.target.value)}
						/>
					</div>

					{!!error && (
						<p className='px-2 text-sm font-bold text-red-500'>{error}</p>
					)}

					<div className='flex h-12'>
						<button
							className='flex-1 bg-green-200'
							type='button'
							disabled={isLoading}
							onClick={() => handleLogin()}
						>
							Login
						</button>

						<button
							className='flex-1 bg-yellow-200'
							type='button'
							disabled={isLoading}
							onClick={() => handleRegister()}
						>
							Register
						</button>
					</div>
				</div>
			</main>
		</>
	)
}
