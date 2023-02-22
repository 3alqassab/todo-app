import { UpdateTodoType } from '@/types'
import { useState } from 'react'
import dayjs from 'dayjs'

export const TodoModal = ({
	onSubmit,
	onClose,
	loading,
	...rest
}: TodoModalProps) => {
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
	onSubmit: (data: UpdateTodoType) => void
	onClose: () => void
	title?: string
	deadline?: Date
	description?: string
	loading?: boolean
}
