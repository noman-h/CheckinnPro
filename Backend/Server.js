require('dotenv').config()
const express=require('express')
const cors=require('cors')
const mongoose=require('mongoose')
const fileUpload = require("express-fileupload");



const app=express()

app.use(cors())
app.use(express.json())

app.use(fileUpload())
app.use(express.urlencoded({extended:true}))

mongoose.connect(process.env.url).then((res)=>
    console.log('connected to mongodb'))
.catch((err)=> console.log(err))

const UserRoute=require('./Routes/UserRoute')
app.use('/user',UserRoute)

const LocationRoute=require('./Routes/LocationRoute')
app.use('/location',LocationRoute)

const HotelRoute=require('./Routes/HotelRoute')
app.use('/hotel',HotelRoute)

const AdminRoute=require('./Routes/AdminRoute')
app.use('/admin',AdminRoute)

const CoupanRoute=require('./Routes/CoupanRoute')
app.use('/coupan',CoupanRoute)

const RoomRoute=require('./Routes/RoomRoute')
app.use('/room',RoomRoute)

const BookRoute=require('./Routes/BookingRoute')
app.use('/booking',BookRoute)

const TempbookRoute=require('./Routes/TempbookRoute')
app.use('/tempbook',TempbookRoute)

const ReviewRoute=require('./Routes/ReviewRoute')
app.use('/review',ReviewRoute)


const {bookingcancelschedule}=require('./Utils/Cronbookingcancel')
bookingcancelschedule()



app.listen(process.env.port,()=>{
    console.log('running server port',process.env.port)
})