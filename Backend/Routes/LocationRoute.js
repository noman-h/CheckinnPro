const express=require('express')
const router=express.Router()

const statecontroller=require("../Controller/StateController")
const districtcontroller=require("../Controller/DistrictController")
const citycontroller=require("../Controller/CityController")

router.post('/addstate',statecontroller.stateadd)
router.patch('/updatestate',statecontroller.stateupdate)
router.get('/getallstate',statecontroller.statereadall)
router.get('/getonestate/:id',statecontroller.statereadone)
router.patch('/softdeletestate/:id',statecontroller.statesoftdelete)
router.patch('/recoverdeletestate/:id',statecontroller.staterecoverdelete)
router.delete('/deletestate/:id',statecontroller.statedelete)

router.post('/adddistrict',districtcontroller.districtadd)
router.patch('/updatedistrict',districtcontroller.districtupdate)
router.get('/getalldistrict',districtcontroller.districtreadall)
router.get('/getonedistrict/:id',districtcontroller.districtreadone)
router.patch('/softdeletedistrict/:id',districtcontroller.districtsoftdelete)
router.patch('/recoverdeletedistrict/:id',districtcontroller.districtrecoverdelete)
router.delete('/deletedistrict/:id',districtcontroller.districtdelete)

router.post('/addcity',citycontroller.cityadd)
router.patch('/updatecity',citycontroller.cityupdate)
router.get('/getallcity',citycontroller.cityreadall)
router.get('/getonecity/:id',citycontroller.cityreadone)
router.patch('/softdeletecity/:id',citycontroller.citysoftdelete)
router.patch('/recoverdeletecity/:id',citycontroller.cityrecoverdelete)
router.delete('/deletecity/:id',citycontroller.citydelete)


module.exports=router