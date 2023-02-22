import { InferGetStaticPropsType } from 'next'
import { Todo as TodoType } from '@/types'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { withSessionSsr } from '@/functions/withSession'
import axios from 'axios'
import dayjs from 'dayjs'
import Head from 'next/head'

const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) throw new Error('API_URL is not defined')

const TodoModal = ({ onSubmit, onClose, ...rest }: TodoModalProps) => {
	const [title, setTitle] = useState(rest.title || '')
	const [description, setDescription] = useState(rest.description || '')
	const [deadline, setDeadline] = useState(rest.deadline || new Date())

	const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		onSubmit(title, deadline, description)
	}

	return (
		<div
			style={{
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				backgroundColor: 'rgba(0, 0, 0, 0.5)',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
			}}
		>
			<form
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '1rem',
					padding: '1rem',
					backgroundColor: 'white',
					borderRadius: '0.5rem',
				}}
				onSubmit={handleSubmitForm}
			>
				<label htmlFor='title'>Title</label>
				<input
					id='title'
					type='text'
					value={title}
					style={{ flex: 1 }}
					required
					onChange={e => setTitle(e.target.value)}
				/>
				<label htmlFor='description'>Description</label>
				<textarea
					id='description'
					value={description}
					style={{ flex: 1, minHeight: '200px', minWidth: '400px' }}
					required
					onChange={e => setDescription(e.target.value)}
				/>
				<label htmlFor='deadline'>Deadline</label>
				<input
					id='deadline'
					type='datetime-local'
					value={dayjs(deadline).format('YYYY-MM-DDTHH:mm')}
					style={{ flex: 1 }}
					required
					onChange={e => setDeadline(new Date(e.target.value))}
				/>

				<div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
					<button style={{ flex: 1 }} type='button' onClick={onClose}>
						Cancel
					</button>
					<button style={{ flex: 1 }} type='submit'>
						Submit
					</button>
				</div>
			</form>
		</div>
	)
}

interface TodoModalProps {
	onSubmit: (title?: string, deadline?: Date, description?: string) => void
	onClose: () => void
	title?: string
	deadline?: Date
	description?: string
}

const Todo = ({ id, deadline, status, title, description }: TodoProps) => {
	const router = useRouter()

	const [showEditModal, setShowEditModal] = useState(false)

	const handleToggleStatus = async () => {
		await axios
			.put(`${API_URL}/api/todos/${id}`, {
				status: status === 'COMPLETED' ? 'NOT_COMPLETED' : 'COMPLETED',
			})
			.then(() => {
				router.reload()
			})
	}

	const handleUpdate = async (
		title?: string,
		deadline?: Date,
		description?: string,
	) => {
		await axios
			.put(`${API_URL}/api/todos/${id}`, {
				title,
				description,
				deadline,
			})
			.then(() => {
				router.reload()
			})
	}

	const handleArchive = async () => {
		await axios
			.put(`${API_URL}/api/todos/${id}`, {
				status: 'ARCHIVED',
			})
			.then(() => {
				router.reload()
			})
	}

	return (
		<>
			<div
				style={{
					display: 'flex',
					flexDirection: 'column',
					border: '1px solid #ccc',
					padding: '1rem',
					gap: '1rem',
					opacity: status === 'COMPLETED' ? 0.3 : 1,
				}}
			>
				<div
					style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}
				>
					<span>{title}</span>
					<span>{description}</span>
					<span>{dayjs(deadline).format('DD/MM/YYYY H:mma')}</span>
				</div>

				<div style={{ display: 'flex', gap: '1rem' }}>
					<button
						style={{ flex: 1 }}
						type='button'
						onClick={handleToggleStatus}
					>
						Mark as {status === 'COMPLETED' ? 'Not Completed' : 'Completed'}
					</button>

					{status === 'COMPLETED' && (
						<button style={{ flex: 1 }} type='button' onClick={handleArchive}>
							Archive
						</button>
					)}

					{status === 'NOT_COMPLETED' && (
						<button
							style={{ flex: 1 }}
							type='button'
							onClick={() => setShowEditModal(true)}
						>
							Edit
						</button>
					)}
				</div>
			</div>

			{showEditModal && (
				<TodoModal
					title={title}
					deadline={deadline}
					description={description}
					onClose={() => setShowEditModal(false)}
					onSubmit={(...data) => handleUpdate(...data)}
				/>
			)}
		</>
	)
}

interface TodoProps extends TodoType {}

export default function Home(
	props: Awaited<InferGetStaticPropsType<typeof getServerSideProps>>,
) {
	const { completedTodos, notCompletedTodos, archivedTodos } = props

	const router = useRouter()

	const [showAddModal, setShowAddModal] = useState(false)

	const handleSubmitTodo = async (
		title?: string,
		deadline?: Date,
		description?: string,
	) => {
		await axios
			.post(`${API_URL}/api/todos`, {
				title,
				deadline,
				description,
			})
			.then(() => {
				router.reload()
			})
	}

	const handleLogout = async () => {
		await axios.post(`${API_URL}/api/auth/logout`).then(() => {
			router.push('/auth')
		})
	}

	return (
		<>
			<Head>
				<title>Todo App</title>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
				<div
					style={{
						display: 'flex',
						justifyContent: 'space-between',
						gap: '2rem',
					}}
				>
					<h1>Ali's Todo App!</h1>
					<button type='button' onClick={handleLogout}>
						Logout
					</button>
				</div>

				<div
					style={{ gap: '0.3rem', display: 'flex', flexDirection: 'column' }}
				>
					<div style={{ display: 'flex', justifyContent: 'space-between' }}>
						<h2>Todo</h2>
						<button type='button' onClick={() => setShowAddModal(val => !val)}>
							Add Todo
						</button>
					</div>

					<div
						style={{ gap: '1rem', display: 'flex', flexDirection: 'column' }}
					>
						{notCompletedTodos.map(todo => (
							<Todo key={todo.id} {...todo} />
						))}
						{completedTodos.map(todo => (
							<Todo key={todo.id} {...todo} />
						))}
					</div>
				</div>
			</main>

			{showAddModal && (
				<TodoModal
					onClose={() => setShowAddModal(false)}
					onSubmit={(...data) => handleSubmitTodo(...data)}
				/>
			)}
		</>
	)
}

export const getServerSideProps = withSessionSsr<{
	completedTodos: TodoType[]
	notCompletedTodos: TodoType[]
	archivedTodos: TodoType[]
}>(async ({ req }) => {
	const loggedIn = !!req.session.user?.id

	if (!loggedIn)
		return {
			redirect: {
				destination: '/auth',
				permanent: false,
			},
			props: { todos: [] },
		}

	const { data } = await axios.get<TodoType[]>(`${API_URL}/api/todos`, {
		headers: { cookie: req.headers.cookie },
	})

	return {
		props: {
			completedTodos: data.filter(todo => todo.status === 'COMPLETED'),
			notCompletedTodos: data.filter(todo => todo.status === 'NOT_COMPLETED'),
			archivedTodos: data.filter(todo => todo.status === 'ARCHIVED'),
		},
	}
})
