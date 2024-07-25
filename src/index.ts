import { web } from '@app/web'
import { scheduleJob } from 'node-schedule'
import { cleanUpExpiredToken } from '@tasks/token/clean_up_token.task'

scheduleJob('*/15 * * * *', cleanUpExpiredToken) // run every 15 minutes

const port = Number(process.env.APP_PORT) || 8000
const host = process.env.APP_HOST || 'localhost'

web.listen(port, () => {
  console.log(`Server is running on http://${host}:${port} 🚀`)
})
