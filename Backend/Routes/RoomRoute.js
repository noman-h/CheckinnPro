const express=require('express')
const router=express.Router()

const Roomcontroller=require('../Controller/RoomController')

router.post('/addroom',Roomcontroller.roomadd)
router.patch('/updateroom',Roomcontroller.roomupdate)
router.get('/getallrooms',Roomcontroller.roomreadall)
router.get('/getallhotelrooms/:hotelEmail',Roomcontroller.roomreadhotelall)
router.get('/getalladminhotelrooms/:adminemail',Roomcontroller.roomreadadminhotelall)
router.get('/getoneroom/:id',Roomcontroller.roomreadone)
router.patch('/softdeleteroom/:id',Roomcontroller.roomsoftdelete)
router.patch('/recoverdeleteroom/:id',Roomcontroller.roomrecoverdelete)
router.delete('/deleteroom/:id',Roomcontroller.roomdelete)

module.exports=router