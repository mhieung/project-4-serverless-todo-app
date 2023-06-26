import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'

// TODO: Implement the fileStogare logic
const XAWS = AWSXRay.captureAWS(AWS)
const bucketName: string = process.env.ATTACHMENT_S3_BUCKET
const expires: number = parseInt(process.env.SIGNED_URL_EXPIRATION)

export const createAttachmentUtils = async (
  todoId: string
): Promise<string> => {
  const s3 = new XAWS.S3({ signatureVersion: 'v4' })
  return s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: todoId,
    Expires: expires
  })
}
