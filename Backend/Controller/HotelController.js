const hotels = require('../Model/HotelModel')
const cities = require('../Model/CityModel')
const users = require('../Model/UserModel')
const admins = require('../Model/AdminModel')
const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require("uuid");
const mongoose = require('mongoose')
const { uploadimage } = require('../Utils/FileUpload')
const moment = require('moment')
const xlsx = require('xlsx')



const htmltemplate = require('../Utils/HtmlTemplate')
const sendmail = require('../Utils/helper')
const HotelModel = require('../Model/HotelModel')
exports.hotladd = async (req, res) => {
  try {
    const { hotelName, description, Address, CityId, pricePerNight, totalRooms, hotelEmail, hotelPhone, admin_id } = req.body


    if (!(hotelName && description && Address && CityId && pricePerNight && totalRooms && hotelEmail && hotelPhone && admin_id)) {
      return res.status(404).json({ message: "all keys are required" })
    }
    const existing = await hotels.findOne({ hotelEmail, approveStatus: "approved" })
    if (existing) {
      console.log(existing);

      return res.status(409).json({ message: "hotel already exist" })
    }

    let url = null;
    if (req.files) {
      const uploaddata = await uploadimage(req.files);
      url = uploaddata[0].url;
    }

    const checkid = uuidv4()
    const emailid = await sendmail.mailsend(hotelEmail, "status checkid", htmltemplate.hotelCheckIdTemplate(hotelName, checkid))
    if (emailid) {
      const data = req.body

      const admin = await admins.findOne({ owneremail: admin_id })

      const response = await hotels.findOneAndUpdate({ hotelEmail }, { ...data, checkid, images: url, admin_id: admin._id })
      return res.status(201).json({ message: "hotel requested successfully" })
    }

    return res.status(400).json({ message: "hotel not added error occured retry" })

  }
  catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error", err })
  }
}

exports.hotelupdate = async (req, res) => {
  try {
    const { _id, hotelName, description, Address, CityId, pricePerNight, totalRooms, hotelEmail, hotelPhone } = req.body

    if (!(hotelName && description && Address && CityId && pricePerNight && totalRooms && hotelEmail && hotelPhone)) {
      return res.status(404).json({ message: "all keys are required" })
    }


    let url = null;
    if (req.files) {
      const uploaddata = await uploadimage(req.files);
      url = uploaddata[0].url;
    }
    const statedata = await hotels.findById(_id)

    const data = req.body
    const response = await hotels.findByIdAndUpdate(_id, { ...data, images: url })
    return res.status(201).json({ message: "hotel updated successfully" })
  }
  catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error", err })
  }
}

exports.hotelreadall = async (req, res) => {
  try {
    const { search, sort, status, skip, limit } = req.query;
    const searchVal = search || "";

    let matchQuery = {};
    if (status === "active") {
      matchQuery.activeStatus = true;
    } else if (status === "inactive") {
      matchQuery.activeStatus = false;
      matchQuery.approveStatus = "approved";
    } else if (status === "pending") {
      matchQuery.approveStatus = "pending";
    } else if (status === "rejected") {
      matchQuery.approveStatus = "rejected";
    }

    if (searchVal) {
      const matchingCities = await cities.find({
        cityname: { $regex: searchVal, $options: 'i' }
      }).select('_id');
      const cityIds = matchingCities.map(c => c._id);

      matchQuery.$or = [
        { hotelName: { $regex: searchVal, $options: 'i' } },
        { hotelEmail: { $regex: searchVal, $options: 'i' } },
        { Address: { $regex: searchVal, $options: 'i' } },
        { CityId: { $in: cityIds } }
      ];
    }

    let sorting = null;
    if (sort === "az") sorting = { hotelName: 1 };
    else if (sort === "za") sorting = { hotelName: -1 };
    else if (sort === "newest") sorting = { createdAt: -1 };
    else if (sort === "oldest") sorting = { createdAt: 1 };

    const totalcount = await hotels.countDocuments(matchQuery);

    let query = hotels.find(matchQuery).populate('CityId').populate('admin_id');
    if (sorting) query = query.sort(sorting);
    else query = query.sort({ createdAt: -1 });

    if (skip) query = query.skip(parseInt(skip));
    if (limit) query = query.limit(parseInt(limit));

    const response = await query;
    return res.status(200).json({ response, totalcount });
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ message: "internal server error" })
  }
}


exports.hotelreadadminall = async (req, res) => {
  try {

    const { search, sort, status, skip, limit } = req.query
    const searchVal = search || ""

    const { adminemail } = req.params

    const admin = await admins.findOne({ owneremail: adminemail })
    if (!admin) {
      return res.status(404).json({ message: "admin not found" })
    }

    let sorting = null;
    if (sort === "az") sorting = { hotelName: 1 }
    else if (sort === "za") sorting = { hotelName: -1 }
    else if (sort === "newest") sorting = { createdAt: -1 }
    else if (sort === "oldest") sorting = { createdAt: 1 }

    let cityIds = [];
    if (searchVal) {
      const matchingCities = await cities.find({
        cityname: { $regex: searchVal, $options: 'i' }
      }).select('_id');
      cityIds = matchingCities.map(c => c._id);
    }

    const matchQuery = {
      admin_id: admin._id,
      approveStatus: "approved",
      activeStatus: (status === "active" ? true : false),
      ...(searchVal ? {
        $or: [
          { hotelName: { $regex: searchVal, $options: 'i' } },
          { hotelEmail: { $regex: searchVal, $options: 'i' } },
          { Address: { $regex: searchVal, $options: 'i' } },
          { CityId: { $in: cityIds } }
        ]
      } : {})
    }

    const totalcount = await hotels.countDocuments(matchQuery)

    let query = hotels.find(matchQuery).populate('CityId').populate('admin_id')
    if (sorting) query = query.sort(sorting)
    if (skip) query = query.skip(parseInt(skip))
    if (limit) query = query.limit(parseInt(limit))

    const response = await query
    return res.status(200).json({ response, totalcount })
  }
  catch (err) {
    console.log(err);
    return res.status(500).json({ message: "internal server error" })
  }
}


exports.hotelreadadminopt = async (req, res) => {
  console.log(req.params);
  
  try {

    const {adminemail}  = req.params
    
    
    const admin = await admins.findOne({owneremail: adminemail })
    if (!admin) {
      return res.status(404).json({ message: "admin not found" })
    }

    const response = await hotels.find({
      admin_id: admin._id,
      approveStatus: "approved",
      activeStatus: true,
    }, { hotelName: 1 })
    console.log(response);

    return res.status(200).json({ response })
  }
  catch (err) {
    return res.status(500).json({ message: "internal server error" })
  }
}

exports.hotelreadone = async (req, res) => {
  try {
    const id = req.params.id
    const response = await hotels.findOne({ _id: id }).populate("CityId").populate('admin_id')
    return res.status(200).json({ response })
  }
  catch (err) {
    return res.status(500).json({ message: "internal server error" })
  }
}

exports.hotelcheckone = async (req, res) => {
  try {
    const checkid = req.params.id
    const response = await hotels.findOne({ checkid }).populate("CityId")
    return res.status(200).json({ response })
  }
  catch (err) {
    return res.status(500).json({ message: "internal server error" })
  }
}

exports.hoteldelete = async (req, res) => {
  try {
    const id = req.params.id

    if (!id) {
      return res.status(404).json({ message: "id not found" })
    }

    const response = await hotels.findByIdAndDelete(id)
    return res.status(200).json({ message: "deleted successfully" })
  }
  catch (err) {
    return res.status(500).json({ message: "internal server error" })
  }
}

exports.hotelsoftdelete = async (req, res) => {
  try {
    const id = req.params.id

    if (!id) {
      return res.status(404).json({ message: "id not found" })
    }

    const response = await hotels.findByIdAndUpdate(id, { activeStatus: false })
    return res.status(200).json({ message: "temporary deleted" })
  }
  catch (err) {
    return res.status(500).json({ message: "internal server error" })
  }
}

exports.hotelrecoverdelete = async (req, res) => {
  try {
    const id = req.params.id

    if (!id) {
      return res.status(404).json({ message: "id not found" })
    }

    const response = await hotels.findByIdAndUpdate(id, { activeStatus: true })
    return res.status(200).json({ message: "restored deleted" })
  }
  catch (err) {
    return res.status(500).json({ message: "internal server error" })
  }
}




const password = uuidv4()
exports.hotelapprove = async (req, res) => {

  try {
    const { _id, hotelName, hotelEmail } = req.body

    if (!(_id)) {
      return res.status(404).json({ message: "id not found" })
    }

    const hoteldetail = await hotels.findOne({ _id })
    if (!hoteldetail) return res.status(404).json({ message: "id not found" })



    const saltrounds = 10;
    const salt = bcrypt.genSaltSync(saltrounds)
    const hashpass = bcrypt.hashSync(password, salt)

    const user = new users({
      name: hotelName,
      email: hotelEmail,
      password: hashpass,
      role: "hotel"
    });

    await user.save();


    const response = await hotels.findByIdAndUpdate(_id, { approveStatus: "approved", activeStatus: true })

    const emailid = await sendmail.mailsend(hoteldetail.hotelEmail, "hotel approved", htmltemplate.hotelApprovalTemplate(hoteldetail.hotelName, hoteldetail.hotelEmail, password))


    return res.status(200).json({ message: "approval updated" })
  }
  catch (err) {


    return res.status(500).json({ message: "internal server error" })
  }

}

exports.hotelreject = async (req, res) => {
  try {
    const { _id, hotelName, hotelEmail, reason } = req.body

    if (!(_id)) {
      return res.status(404).json({ message: "id not found" })
    }

    const hoteldetail = await hotels.findOne({ _id })
    if (!hoteldetail) return res.status(404).json({ message: "id not found" })


    const emailid = await sendmail.mailsend(hotelEmail, "hotel rejected", htmltemplate.hotelRejectedTemplate(hotelName, reason))


    const response = await hotels.findByIdAndUpdate(_id, { approveStatus: "rejected", activeStatus: false })
    return res.status(200).json({ message: "approval updated" })
  }
  catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error" })
  }
}

exports.emailotpsend = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(404).json({ message: "all keys are required" });
    }




    const otpgen = require("../Utils/otpgen");
    const otp = otpgen();

    const existing = await admins.findOne({ owneremail: email });
    if (!existing) {
      const admin = new HotelModel({
        hotelEmail: email,
        otp: otp,
        expiretime: moment().add(10, "minutes")
      })
      const saveotp = await admin.save({ validateBeforeSave: false })
    }
    else {
      const saveotp = await admins.findOneAndUpdate(
        { hotelEmail: email },
        {
          otp: otp,
          expiretime: moment().add(10, "minutes"),
        },
      );
    }


    const mailid = await sendmail.mailsend(
      email,
      "otp for update form",
      htmltemplate.otptemplate(email, otp),
    );

    if (mailid) {
      return res.status(200).json({ message: "mail send successfully" });
    } else {
      return res.status(400).json({ message: "mail send failed" });
    }
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error" });
  }
};

exports.updateotpsend = async (req, res) => {
  try {
    const { email } = req.body

    if (!(email)) {
      return res.status(404).json({ message: "all keys are required" })
    }

    const hotel = await hotels.findOne({ hotelEmail: email })

    if (!hotel) {
      return res.status(404).json({ message: "hotel not found" })
    }

    const otpgen = require('../Utils/otpgen')
    const otp = otpgen()
    const saveotp = await hotels.findOneAndUpdate({ hotelEmail: email }, {
      otp: otp,
      expiretime: moment().add(10, 'minutes')
    })


    const mailid = await sendmail.mailsend(email, 'otp for update form', htmltemplate.otptemplate(hotel.hotelName, otp))

    if (mailid) {
      return res.status(200).json({ message: "mail send successfully" })
    }
    else {
      return res.status(400).json({ message: "mail send failed" })
    }

  }
  catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error" })
  }
}

exports.updateotpverify = async (req, res) => {


  try {
    const { email, otp } = req.body

    if (!(email && otp)) {
      return res.status(404).json({ message: "all keys are required" })
    }

    const hotel = await hotels.findOne({ hotelEmail: email })


    if (!hotel) {
      return res.status(404).json({ message: "hotel not found" })
    }

    if (Number(otp) === hotel.otp && moment().isSameOrBefore(hotel.expiretime)) {
      await hotels.findOneAndUpdate({ hotelEmail: email }, { otp: "", expiretime: "" });
      return res.status(200).json({ message: "Code verify" });
    }
    else if (hotel.otp !== Number(otp)) {
      return res.status(400).json({ message: "wrong code" });
    }
    else {
      await hotels.findOneAndUpdate({ hotelEmail: email }, { otp: "", expiretime: "" });
      return res.status(403).json({ message: "Code expire" });
    }
  }
  catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error" })
  }
}



exports.directhoteladd = async (req, res) => {
  try {

    const { hotelName, description, Address, CityId, pricePerNight, totalRooms, hotelEmail, hotelPhone, admin_id } = req.body


    if (!(hotelName && description && Address && CityId && pricePerNight && totalRooms && hotelEmail && hotelPhone && admin_id)) {
      return res.status(404).json({ message: "all keys are required" })
    }

    const existing = await hotels.findOne({ hotelEmail })
    if (existing) {
      console.log(existing);

      return res.status(409).json({ message: "hotel already exist" })
    }

    let url = null;
    if (req.files) {
      const uploaddata = await uploadimage(req.files);
      url = uploaddata[0].url;
    }

    const emailid = await sendmail.mailsend(hotelEmail, "hotel approved", htmltemplate.hotelApprovalTemplate(hotelName, hotelEmail, password))

    //  dvfbdvdsfevfbd


    if (emailid) {
      const data = req.body;

      const response = await hotels.create(
        {
          ...data,
          images: url,
          admin_id: admin_id,
          approveStatus: "approved",
          activeStatus: true
        })

      const saltrounds = 10;
      const salt = bcrypt.genSaltSync(saltrounds);
      const hashpass = bcrypt.hashSync(password, salt);

      const user = new users({
        name: hotelName,
        email: hotelEmail,
        password: hashpass,
        role: "hotel",
      });

      await user.save();

      return res.status(201).json({ message: "Hotel added successfully" });
    }

    return res
      .status(400)
      .json({ message: "hotel not added error occured retry" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error", err });
  }
};

exports.hotelbulkimport = async (req, res) => {
    try {
        const { CityId } = req.body;
        const { adminEmail } = req.body; // or fetch via auth token

        if (!CityId) {
            return res.status(400).json({ message: "CityId is required" });
        }

        if (!req.files || !req.files.file) {
            return res.status(400).json({ message: "No file uploaded" });
        }

        // we might not have adminEmail in body if we assume current admin
        // Let's rely on admin email from the request if sent, or token.
        // We can just use the admin_id from the user email.
        const admin = await admins.findOne({ owneremail: adminEmail });
        if (!admin) {
           return res.status(404).json({ message: "Admin not found" });
        }

        const file = req.files.file;
        const workbook = xlsx.read(file.data, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = xlsx.utils.sheet_to_json(sheet);

        if (!jsonData || jsonData.length === 0) {
            return res.status(400).json({ message: "File is empty or invalid format" });
        }

        const validHotels = [];
        const errors = [];

        for (let i = 0; i < jsonData.length; i++) {
            const row = jsonData[i];
            const { hotelName, description, Address, pricePerNight, totalRooms, hotelEmail, hotelPhone } = row;

            if (!hotelName || !description || !Address || !pricePerNight || !totalRooms || !hotelEmail || !hotelPhone) {
                errors.push(`Row ${i + 2}: Missing required fields`);
                continue;
            }

            const existing = await hotels.findOne({ hotelEmail });
            if (existing) {
                errors.push(`Row ${i + 2}: Hotel with email ${hotelEmail} already exists`);
                continue;
            }

            validHotels.push({
                hotelName: String(hotelName),
                description: String(description),
                Address: String(Address),
                CityId,
                pricePerNight: Number(pricePerNight),
                totalRooms: Number(totalRooms),
                hotelEmail: String(hotelEmail),
                hotelPhone: String(hotelPhone),
                admin_id: admin._id,
                approveStatus: "approved",
                activeStatus: true
            });
        }

        if (validHotels.length > 0) {
            await hotels.insertMany(validHotels);
        }

        return res.status(200).json({
            message: "Bulk import completed",
            imported: validHotels.length,
            errors: errors
        });

    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: "Internal server error" });
    }
}
