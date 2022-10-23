import express from 'express'
import { createFile } from '../controllers/files'
import multer from 'multer'
import { nanoid } from 'nanoid'

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, 'data/uploads')
  },
  filename: function (_req, _file, cb) {
    cb(null, nanoid())
  }
})
const upload = multer({ storage: storage })

const router = express.Router()

router.route('/').post(upload.single('file'), createFile)
/* router.route('/').get(retrieveFiles) */

export { router as fileRouter }
