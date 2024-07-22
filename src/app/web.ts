import express, { type Request } from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import morgan from 'morgan'
import path from 'path'
import { apiRouter as apiRouterV1 } from '@routes/v1'
import { errorMiddleware } from '@middlewares/error.middleware'

export const web = express()

web.use(express.static(path.join(__dirname, '../../public')))

morgan.token('body', (req: Request) => JSON.stringify(req.body))

web.use(
  morgan(':method :url :status :res[content-length] - :response-time ms :body')
)

const corsOptions: cors.CorsOptions = {
  origin: '*',
  exposedHeaders: ['Content-Disposition'],
  credentials: true
}

web.use(cors(corsOptions))
web.use(bodyParser.json())
web.use(bodyParser.urlencoded({ extended: true }))
web.use('/api/v1', apiRouterV1)
web.use(errorMiddleware)
