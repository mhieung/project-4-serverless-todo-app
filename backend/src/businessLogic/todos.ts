import { TodosAccess } from '../dataLayer/todosAcess'
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'

// TODO: Implement businessLogic
const logger = createLogger('bizniz logic')

export const createTodo = async (
  request: CreateTodoRequest,
  userId: string
) => {
  try {
    if (request) {
      logger.info('Adding a new todo')
      const todoId = uuid.v4()
      return await TodosAccess.createTodo({
        userId: userId,
        todoId: todoId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: null,
        ...request
      })
    } else throw new Error('no requests')
  } catch (error) {
    logger.error(`An error occur: ${error}`)
  }
}

export const getTodosForUser = async (userId: string): Promise<TodoItem[]> => {
  return await TodosAccess.getTodos(userId)
}

export const updateTodo = async (
  userId: string,
  todoId: string,
  request: UpdateTodoRequest
): Promise<void> => {
  return await TodosAccess.updateTodo(userId, todoId, request)
}

export const deleteTodo = async (
  userId: string,
  todoId: string
): Promise<void> => {
  return await TodosAccess.deleteTodo(userId, todoId)
}

export const createAttachmentPresignedUrl = async (
  userId: string,
  todoId: string
): Promise<string> => {
  return await TodosAccess.createAttachmentPresignedUrl(userId, todoId)
}
