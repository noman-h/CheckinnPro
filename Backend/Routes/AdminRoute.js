const express=require('express')
const router=express.Router()

const AdminController=require('../Controller/AdminController')

const auth=require('../Middleware/Auth')
const authrize=require('../Middleware/Authorize')

router.patch('/addadmin',AdminController.adminadd)

router.get('/getcheckone/:id',AdminController.admincheckone)

router.post('/updateadmin',AdminController.adminupdate)

router.post('/directaddadmin',auth,authrize('superadmin'),AdminController.directadminadd)

router.get('/getalladmins',auth,authrize('superadmin'),AdminController.adminreadall)

router.get('/getoneadmin/:id',auth,authrize('superadmin'),AdminController.adminreadone)


router.patch('/softdeleteadmin/:id',auth,authrize('superadmin'),AdminController.adminsoftdelete)

router.patch('/recoverdeleteadmin/:id',auth,authrize('superadmin'),AdminController.adminrecoverdelete)

router.delete('/deleteadmin/:id',auth,authrize('superadmin'),AdminController.admindelete)

router.patch('/approveadmin',auth,authrize('superadmin'),AdminController.adminapprove)

router.patch('/rejectadmin',auth,authrize('superadmin'),AdminController.adminreject)

router.post('/adminemailotpsend',AdminController.emailotpsend)
router.patch('/adminotpsend',AdminController.updateotpsend)
router.patch('/adminotpverify',AdminController.updateotpverify)

module.exports=router