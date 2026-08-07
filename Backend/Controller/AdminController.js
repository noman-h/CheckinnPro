const admins = require("../Model/AdminModel");
const cities = require("../Model/CityModel");
const users = require("../Model/UserModel");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const mongoose = require("mongoose");

const { uploadimage } = require("../Utils/fileupload");
const moment = require("moment");

const HtmlTemplate = require("../Utils/HtmlTemplate");
const sendmail = require("../Utils/Helper");
const AdminModel = require("../Model/AdminModel");
exports.adminadd = async (req, res) => {
  try {
    const {ownername, owneremail, ownerphone, address, cityId } =
      req.body;
  
    
    if (!(ownername && owneremail && ownerphone && address && cityId)) {
      return res.status(404).json({ message: "all keys are required" });
    }
    const existing = await admins.findOne({ owneremail,approveStatus:"approved" });
    if (existing) {
      return res.status(409).json({ message: "admin already exist" });
    }

    let urlprofile = null;
    let urlaadharfront = null;
    let urlaadharback = null;
    if (req.files) {
      const uploaddata = await uploadimage(req.files);
      urlprofile = uploaddata[0].url;
      urlaadharfront = uploaddata[1].url;
      urlaadharback = uploaddata[2].url;
    }

    const checkid = uuidv4();
    const emailid = await sendmail.mailsend(
      owneremail,
      "status checkid",
      HtmlTemplate.hotelCheckIdTemplate(ownername, checkid),
    );

    if (emailid) {
      const data = req.body;

      const response = await admins.findOneAndUpdate({owneremail},{
        ...data,
        checkid,
        profileImage: urlprofile,
        aadhaarFront: urlaadharfront,
        aadhaarBack: urlaadharback,
      });

      return res.status(201).json({ message: "ownerdetail requested successfully" });
    }

    return res
      .status(400)
      .json({ message: "admin not added error occured retry" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error", err });
  }
};

exports.adminupdate = async (req, res) => {
  try {
    const { _id, ownername, owneremail, ownerphone, address, cityId } =
      req.body;
    console.log(req.body);
    
      
    if (!(_id && ownername && owneremail && ownerphone && address && cityId)) {
      return res.status(404).json({ message: "all keys are required" });
    }

    let urlprofile = null;
    let urlaadharfront = null;
    let urlaadharback = null;
    if (req.files) {
      const uploaddata = await uploadimage(req.files);
      urlprofile = uploaddata[0].url;
      urlaadharfront = uploaddata[1].url;
      urlaadharback = uploaddata[2].url;
    }
    const admindata = await admins.findById(_id);
    if (!admindata)
      return res.status(404).json({ message: "admindata not found" });

    const data = req.body;
    const response = await admins.findByIdAndUpdate(_id, {
      ...data,
      otp:null,
      profileImage: urlprofile,
      aadhaarFront: urlaadharfront,
      aadhaarBack: urlaadharback,
    });
    return res.status(201).json({ message: "ownerdetail updated successfully" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error", err });
  }
};

exports.adminreadall = async (req, res) => {
  try {
    const response = await admins.find().populate("cityId");
    return res.status(200).json({ response });
  } catch (err) {

    return res.status(500).json({ message: "internal server error" });
  }
};

exports.adminreadone = async (req, res) => {
  try {
    const id = req.params.id;
    const response = await admins.findOne({ _id: id }).populate("cityId");
    return res.status(200).json({ response });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.admincheckone = async (req, res) => {
  try {
    const checkid = req.params.id;
    const response = await admins.findOne({ checkid }).populate("cityId");
    return res.status(200).json({ response });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.admindelete = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).json({ message: "id not found" });
    }

    const response = await admins.findByIdAndDelete(id);
    return res.status(200).json({ message: "deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.adminsoftdelete = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).json({ message: "id not found" });
    }

    const response = await admins.findByIdAndUpdate(id, {
      activeStatus: false,
    });
    return res.status(200).json({ message: "temporary deleted" });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.adminrecoverdelete = async (req, res) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(404).json({ message: "id not found" });
    }

    const response = await admins.findByIdAndUpdate(id, { activeStatus: true });
    return res.status(200).json({ message: "restored deleted" });
  } catch (err) {
    return res.status(500).json({ message: "internal server error" });
  }
};

const password =uuidv4()
exports.adminapprove = async (req, res) => {
  try {
    const { _id, ownername, owneremail } = req.body;

    if (!_id) {
      return res.status(404).json({ message: "id not found" });
    }

    const ownerdetail = await admins.findOne({ _id });
    if (!ownerdetail) return res.status(404).json({ message: "id not found" });

    const saltrounds = 10;
    const salt = bcrypt.genSaltSync(saltrounds);
    const hashpass = bcrypt.hashSync(password, salt);

    const user = new users({
      name: ownername,
      email: owneremail,
      password: hashpass,
      role: "admin",
    });

    await user.save();

    const response = await admins.findByIdAndUpdate(_id, {
      approveStatus: "approved",
      activeStatus: true,
    });

    const emailid = await sendmail.mailsend(
      ownerdetail.owneremail,
      "owner approved",
      HtmlTemplate.hotelApprovalTemplate(
        ownerdetail.ownername,
        ownerdetail.owneremail,
        password,
      ),
    );

    return res.status(200).json({ message: "approval updated" });
  } catch (err) {
    console.log(err);
    
    return res.status(500).json({ message: "internal server error" });
  }
};

exports.adminreject = async (req, res) => {
  try {
    const { _id, ownername, owneremail, reason } = req.body;

    if (!_id) {
      return res.status(404).json({ message: "id not found" });
    }

    const ownerdetail = await admins.findOne({ _id });
    if (!ownerdetail) return res.status(404).json({ message: "id not found" });

    const emailid = await sendmail.mailsend(
      owneremail,
      "owner rejected",
      HtmlTemplate.hotelRejectedTemplate(ownername, reason),
    );

    const response = await admins.findByIdAndUpdate(_id, {
      approveStatus: "rejected",
      activeStatus: false,
    });
    return res.status(200).json({ message: "approval updated" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error" });
  }
};

exports.emailotpsend = async (req, res) => {
  try {
    const { email } = req.body;
   
    if (!email) {      
      return res.status(404).json({ message: "all keys are required" });
    }




    const otpgen = require("../Utils/otpgen");
    const otp = otpgen();

    const existing = await admins.findOne({ owneremail:email });
    if (!existing) {
         const admin=new AdminModel({owneremail:email,
        otp: otp,
        expiretime: moment().add(10, "minutes")})
    const saveotp =await admin.save({validateBeforeSave:false})
    }
    else{
       const saveotp = await admins.findOneAndUpdate(
      { owneremail: email },
      {
        otp: otp,
        expiretime: moment().add(10, "minutes"),
      },
    );
    }
   

    const mailid = await sendmail.mailsend(
      email,
      "otp for update form",
      HtmlTemplate.otptemplate(email, otp),
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
    const { email } = req.body;

    if (!email) {
      return res.status(404).json({ message: "all keys are required" });
    }

    const ownerdetail = await admins.findOne({ owneremail: email });

    if (!ownerdetail) {
      return res.status(404).json({ message: "ownerdetail not found" });
    }

    const otpgen = require("../Utils/otpgen");
    const otp = otpgen();
    const saveotp = await admins.findOneAndUpdate(
      { owneremail: email },
      {
        otp: otp,
        expiretime: moment().add(10, "minutes"),
      },
    );

    const mailid = await sendmail.mailsend(
      email,
      "otp for update form",
      HtmlTemplate.otptemplate(ownerdetail.ownername, otp),
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

exports.updateotpverify = async (req, res) => {
  try {
    const { email, otp } = req.body;
   console.log(req.body);
   
    if (!(email && otp)) {
      return res.status(404).json({ message: "all keys are required" });
    }

    const ownerdetail = await admins.findOne({ owneremail: email });

    if (!ownerdetail) {
      return res.status(404).json({ message: "ownerdetail not found" });
    }

    if (
      Number(otp) === ownerdetail.otp &&
      moment().isSameOrBefore(ownerdetail.expiretime)
    ) {
      await admins.findOneAndUpdate(
        { owneremail: email },
        { otp: "", expiretime: "" },
      );
      return res.status(200).json({ message: "Code verify" });
    } else if (ownerdetail.otp !== Number(otp)) {
      return res.status(401).json({ message: "wrong code" });
    } else {
      await admins.findOneAndUpdate(
        { owneremail: email },
        { otp: "", expiretime: "" },
      );
      return res.status(403).json({ message: "Code expire" });
    }
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error" });
  }
};



exports.directadminadd = async (req, res) => {
  try {
    const {ownername, owneremail, ownerphone, address, cityId } =
      req.body;
   
    
    if (!(ownername && owneremail && ownerphone && address && cityId)) {
      return res.status(404).json({ message: "all keys are required" });
    }
    const existing = await admins.findOne({ owneremail });
    if (existing) {
      return res.status(409).json({ message: "admin already exist" });
    }

    let urlprofile = null;
    let urlaadharfront = null;
    let urlaadharback = null;
    if (req.files) {
      const uploaddata = await uploadimage(req.files);
      urlprofile = uploaddata[0].url;
      urlaadharfront = uploaddata[1].url;
      urlaadharback = uploaddata[2].url;
    }


    const emailid = await sendmail.mailsend(
      owneremail,
      "owner approved",
      HtmlTemplate.hotelApprovalTemplate(
        ownername,
        owneremail,
        password,
      ),
    );

    if (emailid) {
      const data = req.body;

      const response = await admins.create({
        ...data,
        profileImage: urlprofile,
        aadhaarFront: urlaadharfront,
        aadhaarBack: urlaadharback,
        approveStatus: "approved",
        activeStatus: true
      });

      const saltrounds = 10;
    const salt = bcrypt.genSaltSync(saltrounds);
    const hashpass = bcrypt.hashSync(password, salt);

    const user = new users({
      name: ownername,
      email: owneremail,
      password: hashpass,
      role: "admin",
    });

    await user.save();

    return res.status(201).json({ message: "admin added successfully" });
    }

    return res
      .status(400)
      .json({ message: "admin not added error occured retry" });
  } catch (err) {
    console.log(err);

    return res.status(500).json({ message: "internal server error", err });
  }
};