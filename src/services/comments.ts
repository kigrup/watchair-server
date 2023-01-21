// @ts-nocheck
import { PCMember, Person, Comment } from '../types'
import { logger } from '../utils/logger'

export const getDomainComments = async (domainId: string): Promise<Review[]> => {
  const comments = await Comment.findAll({
    include: [
      {
        model: PCMember,
        required: true,
        as: 'commentauthor',
        include: [{
          model: Person,
          as: 'person',
          required: true,
          where: {
            domainId: domainId
          }
        }]
      }
    ]
  })

  logger.log('info', `services::comments::getDomainComments: Retrieved all ${comments.length} reviews for domain ${domainId}. `)

  return comments
}

export const createComments = async (comments: CommentAttributes[]): Promise<Comment[]> => {
  const createdComments = await Comment.bulkCreate(comments)

  logger.log('info', `services::comments::createComments: Created ${createdComments.length} comments.`)

  return createdComments
}
