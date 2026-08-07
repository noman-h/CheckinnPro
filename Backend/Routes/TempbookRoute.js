const express=require('express')
const router=express.Router()

const Tempcontroller=require('../Controller/TempbookingController')

router.post('/tempbookings',Tempcontroller.tempbooking)
router.get('/gettempbooking/:roomId',Tempcontroller.gettempbooking)


module.exports=router