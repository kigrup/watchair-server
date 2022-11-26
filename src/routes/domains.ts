import express from 'express'
import { getDomainsHandler, createDomainHandler, createFileHandler, getDomainHandler, getPersonsHandler, deleteDomainHandler, getReviewsHandler, getMetricsHandler } from '../controllers/domains'
import multer from 'multer'
import { nanoid } from 'nanoid'
import { inspect } from 'util'
import { getFileExtension } from '../utils/string'
import { getJobHandler, getJobsHandler } from '../controllers/jobs'

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

router.route('/:domainId')
  .get(getDomainHandler)
  .delete(deleteDomainHandler)

router.route('/:domainId/files').post(upload.single('file'), createFileHandler)

router.route('/:domainId/jobs').get(getJobsHandler)
router.route('/:domainId/jobs/:jobId').get(getJobHandler)

router.route('/:domainId/persons').get(getPersonsHandler)

router.route('/:domainId/reviews').get(getReviewsHandler)

router.route('/:domainId/metrics').get(getMetricsHandler)

export { router as domainsRouter }
