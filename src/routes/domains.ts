import express from 'express'
import { getDomainsHandler, createDomainHandler, createFileHandler } from '../controllers/domains'
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

router.route('/').get(getDomainsHandler)
router.route('/').post(createDomainHandler)
router.route('/files').post(upload.single('file'), createFileHandler)

export { router as domainRouter }
