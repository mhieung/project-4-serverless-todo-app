import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createAttachmentUtils } from '../helpers/attachmentUtils'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')
// TODO: Implement the dataLayer logic

const todosTable: string = process.env.TODOS_TABLE
const bucketName = process.env.ATTACHMENT_S3_BUCKET
const todosCreatedAtIndex = process.env.TODOS_CREATED_AT_INDEX

const todoDocument: DocumentClient = new XAWS.DynamoDB.DocumentClient()

export const TodosAccess = {
  createTodo: async (todo: TodoItem): Promise<TodoItem> => {
    try {
      logger.info('Add a new todo')
      await todoDocument
        .put({
          TableName: todosTable,
          Item: todo
        })
        .promise()
      logger.info(`Added ${todo.name}`)
      return todo
    } catch (error) {
      logger.error(`An error occur: ${error}`)
    }
  },
  updateTodo: async (
    userId: string,
    todoId: string,
    todo: TodoUpdate
  ): Promise<void> => {
    try {
      if (userId) {
        logger.info(`Found todo ${todoId}, ready for update`)
        await todoDocument
          .update({
            TableName: todosTable,
            Key: {
              todoId,
              userId
            },
            UpdateExpression:
              'set #name = :name, #dueDate = :dueDate, #done = :done',
            ExpressionAttributeNames: {
              '#name': 'name',
              '#dueDate': 'dueDate',
              '#done': 'done'
            },
            ExpressionAttributeValues: {
              ':name': todo.name,
              ':dueDate': todo.dueDate,
              ':done': todo.done
            }
          })
          .promise()
        logger.info('Updated successfull ', todo)
      } else throw new Error('Unauthenticated')
    } catch (error) {
      logger.error(`An error occur: ${error}`)
    }
  },
  deleteTodo: async (userId: string, todoId: string): Promise<void> => {
    try {
      if (userId) {
        logger.info(`Delete todo with id ${todoId}`)
        await todoDocument
          .delete({
            TableName: todosTable,
            Key: {
              todoId,
              userId
            }
          })
          .promise()
        logger.info(`Deleted todo with id ${todoId}`)
      } else throw new Error('Unauthenticated')
    } catch (error) {
      logger.error(`An error occur: ${error}`)
    }
  },
  getTodos: async (userId: string): Promise<TodoItem[]> => {
    try {
      if (userId) {
        logger.info('Get all todos')

        const todos = await todoDocument
          .query({
            TableName: todosTable,
            IndexName: todosCreatedAtIndex,
            KeyConditionExpression: '#userId = :userId',
            ExpressionAttributeNames: {
              '#userId': 'userId'
            },
            ExpressionAttributeValues: {
              ':userId': userId
            }
          })
          .promise()
        logger.info(`Successfully queried ${todos.Items}`)

        return todos.Items as TodoItem[]
      } else throw new Error('Unauthenticated')
    } catch (error) {
      logger.error(`An error occur: ${error}`)
    }
  },
  createAttachmentPresignedUrl: async (
    userId: string,
    todoId: string
  ): Promise<string> => {
    const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${todoId}`
    try {
      if (userId) {
        await todoDocument
          .update({
            TableName: todosTable,
            Key: {
              todoId,
              userId
            },
            UpdateExpression: 'set #attachmentUrl = :attachmentUrl',
            ExpressionAttributeNames: {
              '#attachmentUrl': 'attachmentUrl'
            },
            ExpressionAttributeValues: {
              ':attachmentUrl': attachmentUrl
            }
          })
          .promise()
        const attachmentUtil: string = await createAttachmentUtils(todoId)
        logger.info(`Url ${attachmentUtil}`)
        return attachmentUtil
      } else throw new Error('Unauthenticated')
    } catch (error) {
      logger.error(`An error occur: ${error}`)
    }
  }
}
