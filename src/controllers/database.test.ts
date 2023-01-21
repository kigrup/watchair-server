import { app } from '../app'
import supertest from 'supertest'

describe('test database fully clearing database', () => {
  it('should clear database', async () => {
    const response = await supertest(app)
      .post('/api/v1/database/sync')
      .send({ force: true })
      .expect(200)

    expect(response.body).toMatchObject({ success: true })
  })
})
