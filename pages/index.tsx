import { InferGetStaticPropsType } from 'next'
import { Todo } from '@/components/Todo'
import { TodoModal } from '@/components/TodoModal'
import { TodoType, UpdateTodoType } from '@/types'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { useState } from 'react'
import { withSessionSsr } from '@/functions/withSession'
import axios from 'axios'
import Head from 'next/head'

const API_URL = process.env.NEXT_PUBLIC_API_URL
if (!API_URL) throw new Error('API_URL is not defined')

export default function Home(
	props: Awaited<InferGetStaticPropsType<typeof getServerSideProps>>,
) {
	const { initialData } = props

	const router = useRouter()
	const queryClient = useQueryClient()

	const [showAddModal, setShowAddModal] = useState(false)

	const {
		data: { completedTodos, notCompletedTodos },
		isLoading: todosLoading,
	} = useQuery({
		queryKey: ['todos'],
		queryFn: () =>
			axios.get<TodoType[]>('/api/todos').then(({ data }) => ({
				completedTodos: data.filter(todo => todo.status === 'COMPLETED'),
				notCompletedTodos: data.filter(todo => todo.status === 'NOT_COMPLETED'),
				archivedTodos: data.filter(todo => todo.status === 'ARCHIVED'),
			})),
		initialData,
	})

	const { mutate: handleSubmitTodo, isLoading: handleSubmitTodoLoading } =
		useMutation({
			mutationFn: (todo: UpdateTodoType) => axios.post('/api/todos', todo),
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

type Data = {
	initialData: {
		completedTodos: TodoType[]
		notCompletedTodos: TodoType[]
		archivedTodos: TodoType[]
	}
}

export const getServerSideProps = withSessionSsr<Data>(async ({ req }) => {
	const loggedIn = !!req.session.user?.id

	if (!loggedIn)
		return {
			redirect: { destination: '/auth', permanent: false },
			props: { todos: [] },
		}

	const { data } = await axios.get<TodoType[]>(`${API_URL}/api/todos`, {
		headers: { cookie: req.headers.cookie },
	})

	return {
		props: {
			initialData: {
				completedTodos: data.filter(todo => todo.status === 'COMPLETED'),
				notCompletedTodos: data.filter(todo => todo.status === 'NOT_COMPLETED'),
				archivedTodos: data.filter(todo => todo.status === 'ARCHIVED'),
			},
		},
	}
})
