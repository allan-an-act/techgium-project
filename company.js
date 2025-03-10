const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const multer = require("multer");
const path = require("path");

const router = express.Router();
mongoose.connect("mongodb://127.0.0.1:27017/main_database", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.once("open", () => console.log("MongoDB Connected Successfully"));

db.on("error", (err) => console.error("MongoDB Connection Error:", err));

const storage = multer.diskStorage({
  destination: "public/uploads/",
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

//individual user

const userSchema=new mongoose.Schema({
    
    name:String,
    address:String,
    gmail:String,
    state:String,
    district:String,
    city:String,
    ewasteType: String,  // Renamed to avoid hyphen issues
    quantity: Number,    // Use Number instead of Integer
    mobile: String,
    status: { type: String, default: "Pending" }
  
})

const users=mongoose.model("data",userSchema)

router.post('/post',async (req,res)=>{
  try{
    const {name,address,gmail,state,district,city,ewasteType,quantity,mobile}= req.body
    const user=new users({
      name,address,gmail,state,district,city,ewasteType,quantity,mobile
    })
    await user.save()
    console.log(user)
    await user.save();
    // return res.json({ redirectUrl: `/demoo_next?email=${email}`, message: "Email already exists" });
    res.redirect(`/demoo_next?email=${gmail}`);
  }catch(error){
    res.status(500).send("Error saving data");
  }
})


// Bulk User Schema
const bulkUserSchema = new mongoose.Schema({
  companyName: String,
  companyAddress: String,
  name: String,
  gmail: String,
  state: String,
  district: String,
  city: String,
  ewasteType: String,
  quantity: Number,
  mobile: Number,
  status: { type: String, default: "Pending" }
});

const BulkUser = mongoose.model("BulkUsers", bulkUserSchema);

router.post('/bulk_next', async (req, res) => {
  try {
    const { companyName, companyAddress, name, gmail, state, district, city, ewasteType, quantity, mobile } = req.body;
    const bulk = new BulkUser({ companyName, companyAddress, name,gmail, state, district, city, ewasteType, quantity, mobile });
    await bulk.save();
    console.log(bulk);
    res.redirect('/bulk_next');
  } catch (error) {
    res.status(500).send(`Error saving data: ${error.message}`);
  }
});


// Company user
const companySchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  company_name: String,
  company_address: String,
  md_name: String,
  md_address: String,
  md_phone: String,
  company_phone: String,
  start_year: Number,
  certification_number: String,
  certification_document: String,
});

const Company = mongoose.model("Company", companySchema);

// router.post('/postC',async (req,res)=>{
//   const {username,email,password,company_name,company_address,md_name,md_phone,company_phone,start_year,certification_number,certification_document}= req.body
//   const company=new Company({
//     username,email,password,company_name,company_address,md_name,md_phone,company_phone,start_year,certification_number,certification_document
//   })
//   await company.save()
//   console.log(company)
//   res.send("form submission successful")
// })


router.post("/show_details", upload.single("certification_document"), async (req, res) => {
  try {
    const { user, email, pass, cpass, company_name, company_address, md_name, md_address, md_phone, company_phone, start_year, certification_number } = req.body;

    if (pass !== cpass) {
      return res.status(400).json({ success: false, message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(pass, 10);

    const companyData = new Company({
      username: user,
      email,
      password: hashedPassword,
      company_name,
      company_address,
      md_name,
      md_address,
      md_phone,
      company_phone,
      start_year,
      certification_number,
      certification_document: req.file ? `uploads/${req.file.filename}` : "",
    });

    await companyData.save();
    // res.json({ success: true, message: "Company details saved successfully!", redirect: "/admin_dashboard" });
    res.redirect("/show_details");

  } catch (error) {
    res.status(500).json({ success: false, message: "Error saving data", error: error.message });
  }
});

//Vendor dashboard
const vendorSchema=new mongoose.Schema({
  vendor_name: String,
  phone_number: String,
  email: String,
  username:String,
  password: String,
  address: String,
  district:String,
  city:String,
  state: String,
  photo:String 
})

const Vendor=mongoose.model("vendors",vendorSchema)
router.post("/postVendor",upload.single("photo"), async (req, res) => {
  try {
    const { vendor_name, phone_number, email, username, pass, address, district, city, state } = req.body;
    const hashedPassword = await bcrypt.hash(pass, 10);
    const newVendor = new Vendor({
      vendor_name,
      phone_number,
      email,
      username,
      password: hashedPassword, // Store hashed password in a real application
      address,
      district,
      city,
      state,
      photo: req.file ? `uploads/${req.file.filename}` : "", // Handling file upload
    });

    await newVendor.save();
    console.log(newVendor);
    res.send("Vendor form submission successful");
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving vendor data");
  }
});


// Email Schema
const emailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  dateAdded: { type: Date, default: Date.now },
});

const Email = mongoose.model("emails", emailSchema);

// Route to store emails
router.post("/storeEmail", async (req, res) => {
  console.log(req.body)
  try {
    const { email } = req.body;
    console.log(req.body)
    if (!email) {
      console.log("Email is missing");
      return res.status(400).json({ message: "Email is required" });
    }
    // Check if email already exists
    const existingEmail = await Email.findOne({ email });
    if (existingEmail) {
      return res.json({ redirectUrl: `/demoo_next?email=${email}`, message: "Email already exists" });
    }

    const newEmail = new Email({ email });
    await newEmail.save();
    return res.json({ redirectUrl: "/individual_user_form", message: "New email stored successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error storing email", error: error.message });
  }
});


// BULK Email Schema
const bulkemailSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  dateAdded: { type: Date, default: Date.now },
});

const bulk_Email = mongoose.models.bulkEmails || mongoose.model("bulkEmails", bulkemailSchema);

// Route to store emails
router.post("/storebulkEmail", async (req, res) => {
  console.log(req.body)
  try {
    const { email } = req.body;
    console.log(req.body)
    if (!email) {
      console.log("Email is missing");
      return res.status(400).json({ message: "Email is required" });
    }
    // Check if email already exists
    const existingEmail = await bulk_Email.findOne({ email });
    if (existingEmail) {
      return res.json({ redirectUrl: `/bulk_next?email=${email}`, message: "Email already exists" });
      
    }

    const newEmail = new bulk_Email({ email });
    await newEmail.save();
    return res.json({ redirectUrl: `/bulk_user_form?email=${email}`, message: "New email stored successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error storing email", error: error.message });
  }
});

const amountSchema = new mongoose.Schema({
  bulkUserId: { type: mongoose.Schema.Types.ObjectId, required: true },
  amount: { type: Number, required: true },
  enteredBy: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status:{type:String,default:"Pending"},
});

// ✅ Ensure the model is always available
const AmountModel = mongoose.models.Amount || mongoose.model("Amount", amountSchema);


async function storeAmountEntry({ bulkUserId, amount, enteredBy }) {
  try {
      console.log("🔹 Storing entry for:", { bulkUserId, amount, enteredBy });

      const newAmountEntry = new AmountModel({
          bulkUserId: new mongoose.Types.ObjectId(bulkUserId),
          amount: parseFloat(amount),
          enteredBy,
      });

      const result = await newAmountEntry.save();
      console.log("✅ Amount entry saved:", result);
      return result;
  } catch (error) {
      console.error("❌ Error storing amount entry:", error);
      throw error;
  }
}


module.exports = { db, users, BulkUser, Company, Vendor, Email,bulk_Email, AmountModel,storeAmountEntry, router };
