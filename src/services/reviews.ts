import { logger } from '../utils/logger'
import { PCMember, Person, Review, ReviewScore } from '../types'

export const getDomainReviews = async (domainId: string): Promise<Review[]> => {
  const reviews = await Review.findAll({
    include: [
      {
        model: PCMember,
        as: 'reviewer',
        required: true,
        include: [{
          model: Person,
          as: 'person',
          required: true,
          where: {
            domainId: domainId
          }
        }]
      },
      {
        model: ReviewScore,
        as: 'reviewScore'
      }
    ]
  })

  logger.log('info', `services::reviews::getReviews: Retrieved all ${reviews.length} reviews for domain ${domainId}. `)

  return reviews
}

export const createReviews = async (reviews: any): Promise<Review[]> => {
  logger.log('info', 'services::reviews::createReviews: Bulk creating reviews...')

  const createdReviews: Review[] = []
  // createdReviews = await Review.bulkCreate(reviews)
  for (let i = 0; i < reviews.length; i++) {
    const review = reviews[i]
    logger.log('info', 'servies::reviews::createReviews: creating review:')
    logger.log('info', review)
    const createdReview: Review = await Review.create(review)
    createdReviews.push(createdReview)
  }

  logger.log('info', 'services::reviews::createReviews: Done bulk creating reviews')

  return createdReviews
}
