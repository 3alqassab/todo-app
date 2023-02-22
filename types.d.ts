export interface TodoType {
	id: string
	deadline: Date
	status: string
	title: string
	description: string
}

export interface UpdateTodoType {
	id?: string
	deadline?: Date
	status?: string
	title?: string
	description?: string
}
