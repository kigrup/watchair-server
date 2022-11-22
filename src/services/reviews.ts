import { Review } from '../types'

export const getReviews = async (_domainId: string): Promise<Review[]> => {
  const reviews: Review[] = await Review.findAll()

  console.log(`services::reviews::getReviews: Retrieved all ${reviews.length} reviews. `)

  return reviews
}

export const createReviews = async (reviews: any): Promise<Review[]> => {
  console.log('services::reviews::createReviews: Bulk creating reviews...')

  const createdReviews: Review[] = []
  // createdReviews = await Review.bulkCreate(reviews)
  for (let i = 0; i < reviews.length; i++) {
    const review = reviews[i]
    console.log('servies::reviews::createReviews: creating review:')
    console.log(review)
    const createdReview: Review = await Review.create(review)
    createdReviews.push(createdReview)
  }

  console.log('services::reviews::createReviews: Done bulk creating reviews')

  return createdReviews
}
