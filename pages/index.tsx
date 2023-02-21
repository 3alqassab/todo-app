import { InferGetStaticPropsType, NextPageContext } from 'next'
import { useRouter } from 'next/router'
import { useState } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'
import Head from 'next/head'

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

				<div
					style={{
						display: 'flex',
						gap: '1rem',
						marginTop: '1rem',
					}}
				>
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
			.put(`/api/todos/${id}`, {
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
			.put(`/api/todos/${id}`, {
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
			.put(`/api/todos/${id}`, {
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
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						gap: '0.4rem',
					}}
				>
					<span>{title}</span>
					<span>{description}</span>
					<span>{dayjs(deadline).format('DD/MM/YYYY H:mma')}</span>
				</div>

				<div
					style={{
						display: 'flex',
						gap: '1rem',
					}}
				>
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

interface TodoProps {
	id: string
	deadline: Date
	status: string
	title: string
	description: string
}

export const getServerSideProps = async ({ req, res }: NextPageContext) => {
	const { data } = await axios.get('http://localhost:3000/api/todos', {
		headers: { cookie: req?.headers.cookie },
	})

	return {
		props: { todos: data as TodoProps[] },
	}
}

export default function Home(
	props: InferGetStaticPropsType<typeof getServerSideProps>,
) {
	const { todos } = props
	const router = useRouter()

	const [showAddModal, setShowAddModal] = useState(false)

	const handleSubmitTodo = async (
		title?: string,
		deadline?: Date,
		description?: string,
	) => {
		await axios
			.post('/api/todos', {
				title,
				deadline,
				description,
			})
			.then(() => {
				router.reload()
			})
	}

	return (
		<>
			<Head>
				<title>Todo App</title>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/favicon.ico' />
			</Head>
			<main
				style={{
					display: 'flex',
					flexDirection: 'column',
					gap: '2rem',
				}}
			>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: '1fr 1fr',
						gap: '2rem',
					}}
				>
					<div
						style={{ gap: '0.3rem', display: 'flex', flexDirection: 'column' }}
					>
						<div style={{ display: 'flex', justifyContent: 'space-between' }}>
							<h2>Todo</h2>
							<button
								type='button'
								onClick={() => setShowAddModal(val => !val)}
							>
								Add Todo
							</button>
						</div>

						<div
							style={{ gap: '1rem', display: 'flex', flexDirection: 'column' }}
						>
							{todos
								.filter(todo => todo.status === 'NOT_COMPLETED')
								.map(todo => (
									<Todo key={todo.id} {...todo} />
								))}
						</div>
					</div>

					<div
						style={{ gap: '0.3rem', display: 'flex', flexDirection: 'column' }}
					>
						<h2>Done</h2>
						<div
							style={{ gap: '1rem', display: 'flex', flexDirection: 'column' }}
						>
							{todos
								.filter(todo => todo.status === 'COMPLETED')
								.map(todo => (
									<Todo key={todo.id} {...todo} />
								))}
						</div>
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
