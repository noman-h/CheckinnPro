const express=require('express')
const router=express.Router()

const usercontroller=require('../Controller/UserController')
const auth=require('../Middleware/Auth')

router.post('/singup',usercontroller.singup)
router.post('/login',usercontroller.login)
router.patch('/resetpass',auth,usercontroller.resetpass)
router.patch('/forgetotpsend',usercontroller.forgetotpsend)
router.patch('/forgetotpverify',usercontroller.forgetotpverify)
router.patch('/forgetpass',usercontroller.forgetpass)
router.post('/changetheme',auth,usercontroller.changetheme)

module.exports=router