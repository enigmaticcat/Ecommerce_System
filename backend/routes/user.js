import express from 'express'
import * as userController from '../controllers/user'

const router = express.Router()

router.use(verifyToken)
router.get('/get-current', userController.getCurrent)
router.put('/',userController.updateUserController);

export default router