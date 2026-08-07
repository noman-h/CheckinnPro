const express=require('express')
const router=express.Router()

const AdminController=require('../Controller/AdminController')

router.patch('/addadmin',AdminController.adminadd)
router.post('/directaddadmin',AdminController.directadminadd)
router.post('/updateadmin',AdminController.adminupdate)
router.get('/getalladmins',AdminController.adminreadall)
router.get('/getoneadmin/:id',AdminController.adminreadone)
router.get('/getcheckone/:id',AdminController.admincheckone)
router.patch('/softdeleteadmin/:id',AdminController.adminsoftdelete)
router.patch('/recoverdeleteadmin/:id',AdminController.adminrecoverdelete)
router.delete('/deleteadmin/:id',AdminController.admindelete)
router.patch('/approveadmin',AdminController.adminapprove)
router.patch('/rejectadmin',AdminController.adminreject)
router.post('/adminemailotpsend',AdminController.emailotpsend)
router.patch('/adminotpsend',AdminController.updateotpsend)
router.patch('/adminotpverify',AdminController.updateotpverify)

module.exports=router