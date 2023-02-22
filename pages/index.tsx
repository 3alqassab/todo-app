import { InferGetStaticPropsType } from 'next'
import { Todo as TodoType, UpdateTodo } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { withSessionSsr } from '@/functions/withSession'
import axios from 'axios'
import dayjs from 'dayjs'
import Head from 'next/head'

const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) throw new Error('API_URL is not defined')

const TodoModal = ({ onSubmit, onClose, loading, ...rest }: TodoModalProps) => {
	const [title, setTitle] = useState(rest.title || '')
	const [description, setDescription] = useState(rest.description || '')
	const [deadline, setDeadline] = useState(rest.deadline || new Date())

	const handleSubmitForm = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		onSubmit({ title, deadline, description })
	}

	return (
		<div className='absolute top-0 left-0 right-0 bottom-0 z-10 flex items-center justify-center bg-opacity-50 backdrop-blur-sm'>
			<form
				className='flex flex-col gap-4 rounded-md bg-white p-4 shadow-lg'
				onSubmit={handleSubmitForm}
			>
				<label htmlFor='title'>Title</label>
				<input
					id='title'
					type='text'
					value={title}
					className='mb-6 flex-1 rounded-lg border-2 p-2'
					required
					onChange={e => setTitle(e.target.value)}
				/>

				<label htmlFor='description'>Description</label>
				<textarea
					id='description'
					value={description}
					cols={30}
					className='mb-6 flex-1 rounded-lg border-2 p-2'
					rows={10}
					onChange={e => setDescription(e.target.value)}
				/>

				<label htmlFor='deadline'>Deadline</label>
				<input
					id='deadline'
					type='datetime-local'
					value={dayjs(deadline).format('YYYY-MM-DDTHH:mm')}
					className='mb-6 flex-1 rounded-lg border-2 p-2'
					required
					onChange={e => setDeadline(new Date(e.target.value))}
				/>

				<div className='mt-4 flex gap-4'>
					<button
						className='flex-1'
						disabled={loading}
						type='button'
						onClick={onClose}
					>
						Cancel
					</button>

					<button className='flex-1' disabled={loading} type='submit'>
						Submit
					</button>
				</div>
			</form>
		</div>
	)
}

interface TodoModalProps {
	onSubmit: (data: UpdateTodo) => void
	onClose: () => void
	title?: string
	deadline?: Date
	description?: string
	loading?: boolean
}

const Todo = ({ id, deadline, status, title, description }: TodoProps) => {
	const queryClient = useQueryClient()

	const [showEditModal, setShowEditModal] = useState(false)

	const { mutate: handleToggleStatus, isLoading: handleRegisterLoading } =
		useMutation({
			mutationFn: () =>
				axios.put(`/api/todos/${id}`, {
					status: status === 'COMPLETED' ? 'NOT_COMPLETED' : 'COMPLETED',
				}),
			onSuccess: () => queryClient.invalidateQueries(['todos']),
		})

	const { mutate: handleUpdate, isLoading: handleUpdateLoading } = useMutation({
		mutationFn: (todo: UpdateTodo) => axios.put(`/api/todos/${id}`, todo),
		onSuccess: () => queryClient.invalidateQueries(['todos']),
	})

	const { mutate: handleArchive, isLoading: handleArchiveLoading } =
		useMutation({
			mutationFn: () =>
				axios.put(`/api/todos/${id}`, {
					status: 'ARCHIVED',
				}),
			onSuccess: () => queryClient.invalidateQueries(['todos']),
		})

	const isLoading =
		handleRegisterLoading || handleUpdateLoading || handleArchiveLoading

	const isCompleted = status === 'COMPLETED'

	return (
		<>
			<div className='flex gap-4 rounded-md border border-gray-300'>
				<div
					className={`flex flex-1 flex-col gap-2 p-4 ${
						isCompleted ? 'opacity-40' : ''
					}`}
				>
					<span
						className={`flex items-center gap-2 break-all ${
							isCompleted ? 'line-through' : ''
						}`}
					>
						<i className='fa-solid fa-heading' />
						{title}
					</span>

					{!!description && (
						<span
							className={`flex items-center gap-2 break-all ${
								isCompleted ? 'line-through' : ''
							}`}
						>
							<i className='fa-regular fa-file-lines' /> {description}
						</span>
					)}

					<span
						className={`flex items-center gap-2 ${
							isCompleted ? 'line-through' : ''
						}`}
					>
						<i className='fa-regular fa-clock' />
						{dayjs(deadline).format('DD/MM/YYYY h:mma')}
					</span>
				</div>

				<div className='flex w-20 flex-col'>
					<button
						className={`flex-1
          ${isCompleted ? 'bg-red-200' : 'bg-green-200'}`}
						type='button'
						disabled={isLoading}
						onClick={() => handleToggleStatus()}
					>
						<i
							className={`fa-solid ${
								isCompleted ? 'fa-rotate-left' : 'fa-check'
							}`}
						></i>
					</button>

					{isCompleted && (
						<button
							className='flex-1 bg-orange-200'
							type='button'
							disabled={isLoading}
							onClick={() => handleArchive()}
						>
							<i className='fa-regular fa-folder' />
						</button>
					)}

					{!isCompleted && (
						<button
							className='flex-1 bg-yellow-200'
							type='button'
							disabled={isLoading}
							onClick={() => setShowEditModal(true)}
						>
							<i className='fa-regular fa-pen-to-square' />
						</button>
					)}
				</div>
			</div>

			{showEditModal && (
				<TodoModal
					title={title}
					deadline={deadline}
					description={description}
					loading={isLoading}
					onClose={() => setShowEditModal(false)}
					onSubmit={data => handleUpdate(data)}
				/>
			)}
		</>
	)
}

interface TodoProps extends TodoType {}

export default function Home(
	props: Awaited<InferGetStaticPropsType<typeof getServerSideProps>>,
) {
	const router = useRouter()
	const queryClient = useQueryClient()

	const [showAddModal, setShowAddModal] = useState(false)

	const {
		data: { completedTodos, notCompletedTodos },
		isLoading: todosLoading,
	} = useQuery(
		['todos'],
		() =>
			axios.get<TodoType[]>('/api/todos').then(({ data }) => ({
				completedTodos: data.filter(
					(todo: TodoType) => todo.status === 'COMPLETED',
				),
				notCompletedTodos: data.filter(
					(todo: TodoType) => todo.status === 'NOT_COMPLETED',
				),
				archivedTodos: data.filter(
					(todo: TodoType) => todo.status === 'ARCHIVED',
				),
			})),
		{
			initialData: {
				completedTodos: props.completedTodos,
				notCompletedTodos: props.notCompletedTodos,
				archivedTodos: props.archivedTodos,
			},
		},
	)

	const { mutate: handleSubmitTodo, isLoading: handleSubmitTodoLoading } =
		useMutation({
			mutationFn: (todo: UpdateTodo) => axios.post('/api/todos', todo),
			onSuccess: () => queryClient.invalidateQueries(['todos']),
		})

	const { mutate: handleLogout, isLoading: handleLogoutLoading } = useMutation({
		mutationFn: () => axios.post('/api/auth/logout'),
		onSuccess: () => router.push('/auth'),
	})

	if (todosLoading) return <div>Loading...</div>

	return (
		<>
			<Head>
				<title>Todo App</title>
				<meta name='viewport' content='width=device-width, initial-scale=1' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main className='flex flex-col gap-8 p-8'>
				<div className='flex justify-between gap-8'>
					<div className='flex gap-4'>
						<h1 className='text-3xl'>Ali's Todo App!</h1>

						<button type='button' onClick={() => setShowAddModal(val => !val)}>
							<i className='fa-solid fa-plus' /> Add Todo
						</button>
					</div>

					<button
						type='button'
						disabled={handleLogoutLoading}
						onClick={() => handleLogout()}
					>
						<i className='fa-solid fa-arrow-right-from-bracket' /> Logout
					</button>
				</div>

				<div className='flex flex-col gap-4'>
					{notCompletedTodos.map(todo => (
						<Todo key={todo.id} {...todo} />
					))}
					{completedTodos.map(todo => (
						<Todo key={todo.id} {...todo} />
					))}
				</div>
			</main>

			{showAddModal && (
				<TodoModal
					loading={handleSubmitTodoLoading}
					onClose={() => setShowAddModal(false)}
					onSubmit={data => handleSubmitTodo(data)}
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
