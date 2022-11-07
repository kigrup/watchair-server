import express from 'express'
import { getDomainsHandler, createDomainHandler, createFileHandler, getDomainHandler } from '../controllers/domains'
import multer from 'multer'
import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { getFileExtension } from '../utils/string'

const ALLOWED_EXTENSIONS = ['.xlsx', '.xls']

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, 'data/uploads')
  },
  filename: function (_req, file, cb) {
    const extension: string | null = getFileExtension(file.originalname)

    const newFileName: string = `${nanoid()}${extension === null ? '' : extension}`
    cb(null, newFileName)
  }
})
const upload = multer({
  storage: storage,
  fileFilter (_req, file, callback) {
    console.log(`routes::domains: Received file form: ${inspect(file, { depth: 1 })}`)
    const fileExtension: string | null = getFileExtension(file.originalname)
    if (fileExtension === null) {
      console.log('routes::domains: File filtered! Name has no file extension.')
      callback(null, false)
    } else if (ALLOWED_EXTENSIONS.includes(fileExtension)) {
      callback(null, true)
    } else {
      console.log('routes::domains: File filtered! Extension not allowed.')
      callback(null, false)
    }
  }
})

const router = express.Router()

router.route('/')
  .get(getDomainsHandler)
  .post(createDomainHandler)
router.route('/:domainId').get(getDomainHandler)
router.route('/:domainId/files').post(upload.single('file'), createFileHandler)

export { router as domainRouter }
