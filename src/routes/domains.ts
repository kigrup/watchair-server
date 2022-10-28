import express from 'express'
import { getDomains, createDomain, createFile } from '../controllers/domains'
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

router.route('/').get(getDomains)
router.route('/').post(createDomain)
router.route('/files').post(upload.single('file'), createFile)

export { router as domainRouter }
