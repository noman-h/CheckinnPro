const cron=require('node-cron')
const bookings=require('../Model/BookingModel')


exports.bookingcancelschedule=()=>{
  cron.schedule("0 0 * * *", async () => {
    try {
      
      const result = await bookings.updateMany(
        {
          bookingstatus: "pending",
          checkIn: { $lt: new Date()},
        },
        { $set: { bookingstatus: "cancelled" } }
      );

  console.log(result);
    } catch (err) {
        console.log(err);
        
      console.error("error occured", err.message);
    }
  });
}
