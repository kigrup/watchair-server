import express from 'express'
import formidable from 'formidable'
import fs from 'fs'
import crypto from 'crypto'
import { readXLSX } from './services/excel'

const app = express()
app.use(express.json())

const PORT = 3000

app.get('/ping', (_req, res) => {
  console.log('Incoming connection...')
  console.log(__dirname)
  res.send('WatChair')
})

app.get('/upload', (_req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.write('<form action="/api/fileupload" method="post" enctype="multipart/form-data">')
  res.write('<input type="file" name="filetoupload"><br>')
  res.write('<input type="submit">')
  res.write('</form>')
  return res.end()
})

app.get('/load', (_req, res) => {
  const path = `${__dirname.replace('\\', '/')}/data/uploads`
  const files = fs.readdirSync(path)
  res.writeHead(200, { 'Content-Type': 'text/html' })
  files.forEach(file => {
    console.log(file)
    if (file.endsWith('.xlsx')) {
      res.write(`<a href="load/${file}">${file}</a><br>`)
    }
  })
  return res.end()
})

app.get('/load/:filename', (req, res) => {
  const filename = req.params.filename
  if (filename.includes('.xlsx')) {
    readXLSX(`${__dirname.replace('\\', '/')}/data/uploads/${filename}`).then((workbook) => {
      res.json(workbook.getWorksheet('Authors').getColumn(3).values)
    }).catch(error => {
      console.error(error)
    })
  } else {
    res.send('Not an xlsx file')
  }
})

app.post('/api/fileupload', (req, res) => {
  const form = new formidable.IncomingForm()
  form.parse(req, function (err, _fields, files) {
    if (err != null) throw err
    if (!Array.isArray(files.filetoupload)) {
      const oldpath = files.filetoupload.filepath
      const originalname = files.filetoupload.originalFilename != null ? files.filetoupload.originalFilename : 'uploadedfile'
      const extension = originalname.substring(originalname.indexOf('.'))
      const newpath = `${__dirname.replace('\\', '/')}/data/uploads/${crypto.randomUUID()}${extension}`
      fs.rename(oldpath, newpath, function (err) {
        if (err != null) throw err
        res.write('File uploaded and moved!')
        res.end()
      })
    }
    res.write('File uploaded!')
    res.end()
  })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log('hello')
})
