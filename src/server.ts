import { sequelize } from './types'
import { app } from './app'

const PORT = 42525

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  sequelize.sync({ force: true })
    .then(() => {
      console.log('Sequelize db synced')
    })
    .catch((error) => {
      console.log('Sequelize db failed to sync:')
      console.log(error)
    })
})
