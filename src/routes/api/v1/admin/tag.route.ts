import { Router } from 'express'
import { TagController } from '@controllers/admin/tag.controller'

export const tagRouter = Router()

tagRouter.get('/', TagController.index)
tagRouter.post('/', TagController.store)
tagRouter.get('/:id', TagController.show)
tagRouter.put('/:id', TagController.update)
tagRouter.delete('/:id', TagController.destroySingle)
tagRouter.delete('/', TagController.destroyBatch)
