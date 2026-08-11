const express=require('express')
const router=express.Router()

const auth=require('../Middleware/Auth')
const authrize=require('../Middleware/Authorize')

const pdfcontroller=require('../Controller/PdfController')

router.post('/pdf',auth,authrize('superadmin','admin','hotel'),pdfcontroller.downloadpdf)


module.exports=router