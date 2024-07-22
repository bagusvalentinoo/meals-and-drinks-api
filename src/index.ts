import { web } from '@app/web'

const port = Number(process.env.APP_PORT) || 8000
const host = process.env.APP_HOST || 'localhost'

web.listen(port, () => {
  console.log(`Server is running on http://${host}:${port} 🚀`)
})
