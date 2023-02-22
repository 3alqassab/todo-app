import { TodoModal } from './TodoModal'
import { UpdateTodoType } from '@/types'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import axios from 'axios'
import dayjs from 'dayjs'

export const Todo = ({
	id,
	deadline,
	status,
	title,
	description,
}: UpdateTodoType) => {
	const queryClient = useQueryClient()

	const [showEditModal, setShowEditModal] = useState(false)

	const isCompleted = status === 'COMPLETED'

	const { mutate: handleToggleStatus, isLoading: handleRegisterLoading } =
		useMutation({
			mutationFn: () =>
				axios.put(`/api/todos/${id}`, {
					status: isCompleted ? 'NOT_COMPLETED' : 'COMPLETED',
				}),
			onSuccess: () => queryClient.invalidateQueries(['todos']),
		})

	const { mutate: handleUpdate, isLoading: handleUpdateLoading } = useMutation({
		mutationFn: (todo: UpdateTodoType) => axios.put(`/api/todos/${id}`, todo),
		onSuccess: () => {
			queryClient.invalidateQueries(['todos'])
			setShowEditModal(false)
		},
	})

	const { mutate: handleArchive, isLoading: handleArchiveLoading } =
		useMutation({
			mutationFn: () => axios.put(`/api/todos/${id}`, { status: 'ARCHIVED' }),
			onSuccess: () => queryClient.invalidateQueries(['todos']),
		})

	const isLoading =
		handleRegisterLoading || handleUpdateLoading || handleArchiveLoading

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
