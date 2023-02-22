export interface Todo {
	id: string
	deadline: Date
	status: string
	title: string
	description: string
}

export interface UpdateTodo {
	deadline?: Date
	status?: string
	title?: string
	description?: string
}
