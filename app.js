const express = require("express");
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");
const bcrypt = require("bcrypt");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require("body-parser");
const { submitVendor, confirmOrder } = require('./submit');
const {sendOtp}=require("./otp");
const {db, users, BulkUser, Company,Vendor,Email,bulk_Email, AmountModel,storeAmountEntry,router}=require("./company");
const app = express();
const PORT = 3000;
const { ObjectId } = require('mongodb');

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'home.html'));
});

app.get('/admin_dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_dashboard.html'));
});

app.get('/bulk_user_form', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'bulk_user_form.html'));
});

app.get('/company_details_form', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'company_details_form.html'));
});

app.get('/confirmation', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'confirmation.html'));
});

app.get('/individual_user_form', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'individual_user_form.html'));
});

// app.get('/login', (req, res) => {
//     res.sendFile(path.join(__dirname, 'views', 'login.html'));
// });

app.get('/notification', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'notification.html'));
});

app.get('/IN_otp_verification', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'IN_otp_verification.html'));
});

app.get('/BU_otp_verification', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'BU_otp_verification.html'));
});

app.get('/select_time', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'select_time.html'));
});

app.get('/set_date_time', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'set_date_time.html'));
});

app.get('/show_details', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'show_details.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'signup.html'));
});

app.get('/vendor_details', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'vendor_details.html'));
});

app.get('/verification', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'verification.html'));
});

app.get('/login_page_vendor', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login_page_vendor.html'));
});

app.get('/login_company', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'login_company.html'));
});

app.get('/admin_login-xyzabc123', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'admin_login-xyzabc123.html'));
});

app.get('/BU_verification', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'BU_verification.html'));
});

app.get('/IN_verification', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'IN_verification.html'));
});

app.get('/demoo_next', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'demoo_next.html'));
});

app.get('/wait', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'wait.html'));
});

app.get('/order', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'order.html'));
});
app.get('/order_conf', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'order_conf.html'));
});

app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'map.html'));
});

app.get('/bulk_next', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'bulk_next.html'));
});

app.get('/notice', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'notice.html'));
});
app.get('/track', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'track.html'));
});

app.get('/report', (req, res) => {
    res.sendFile(path.join(__dirname, 'views', 'report.html'));
});

// Middleware
app.use(express.static("public")); 
app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
app.use(cors({ origin: "http://localhost:3000" }));
app.use(bodyParser.json());
app.post("/sendOtp", sendOtp);
// Serve HTML Pages
app.use(express.static(path.join(__dirname, 'views')));
app.use("/", router);


app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find user in MongoDB
        const user = await Company.findOne({ username });

        if (!user) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid password" });
        }

        // On successful login, send success response with email
        res.json({ success: true, email: user.email });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
});


app.post("/vlogin", async (req, res) => {
    try {
        const { vendor_name, password } = req.body;

        if (!vendor_name || !password) {
            return res.status(400).json({ success: false, message: "Vendor name and password are required" });
        }

        // Find vendor in MongoDB (case-insensitive)
        const vendor = await Vendor.findOne({ vendor_name: new RegExp(`^${vendor_name}$`, "i") });

        console.log("Vendor found:", vendor);

        if (!vendor) {
            return res.status(400).json({ success: false, message: "User not found" });
        }

        // Compare entered password with stored hashed password
        const isMatch = await bcrypt.compare(password, vendor.password);
        console.log("Password match:", isMatch);

        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid password" });
        }

        res.json({ success: true, message: "Login successful",email:vendor.email,redirect: "/order" });

    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
});

app.get("/getUser", async (req, res) => {
    const gmail = req.query.email;
    console.log(gmail);
    if (!gmail) {
        console.log("Error: Email is required");
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        console.log("Fetching user with email:", gmail);
        const user = await users.findOne({ gmail });
        console.log("User Document:", user);
        if (!user) {
            console.log("User not found:", gmail);
            return res.status(404).json({ error: "User not found" });
        }

        const responseData = {
            name: user.name,
            address: user.address,
            city: user.city,
            state: user.state,
            ewaste: [{ type: user.ewasteType, quantity: user.quantity }], // Wrap in an array
            // pendingRequests: user.pendingRequests || [],
        }
        console.log("✅ User found:", user);
        res.json(responseData);
    } catch (err) {
        console.error("Database Query Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});


app.get("/getBulkUser", async (req, res) => {
    const gmail = req.query.email;
    console.log(gmail);
    if (!gmail) {
        console.log("Error: Email is required");
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        console.log("Fetching user with email:", gmail);
        const user = await BulkUser.findOne({ gmail });

        if (!user) {
            console.log("User not found:", gmail);
            return res.status(404).json({ error: "User not found" });
        }

        const responseData = {
            name: user.companyName,
            address: user.companyAddress,
            city: user.city,
            state: user.state,
            ewaste: [{ type: user.ewasteType, quantity: user.quantity }], // Wrap in an array
            // pendingRequests: user.pendingRequests || [],
        }
        console.log("✅ User found:", user);
        res.json(responseData);
    } catch (err) {
        console.error("Database Query Error:", err);
        res.status(500).json({ error: "Server error" });
    }
});

app.get("/getBulk", async (req, res) => {
    try {
        const email = req.query.email;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const userData = await BulkUser.findOne({ gmail: email });

        if (!userData) {
            return res.status(404).json({ error: "User not found" });
        }

        // Find pending requests related to the user's company
        const companyRequests = await BulkUser.find({ gmail: email, status: "Pending" });

        res.json({
            companyName: userData.companyName,
            companyAddress: userData.companyAddress,
            name: userData.name,
            city: userData.city,
            state: userData.state,
            district: userData.district,
            mobile: userData.mobile,
            gmail: userData.email,
            pendingRequests: companyRequests,
            id:userData._id.toString(), // Now properly defined
        });
    } catch (error) {
        console.error("Error fetching user data:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.get("/orders", async (req, res) => {
    try {
        const orders = await users.find();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: "Error fetching orders" });
    }
});


app.post("/confirm-order/:id", async (req, res) => {
    try {
        const order = await users.findByIdAndUpdate(req.params.id, { status: "Confirmed" }, { new: true });
        
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: "Error confirming order" });
    }
});

router.get("/get_bulk_details", async (req, res) => {
    try {
      const bulkUsers = await BulkUser.find(); // Fetch all bulk users from MongoDB
      console.log("Bulk user data:", bulkUsers); 
      res.json(bulkUsers);
    } catch (error) {
      console.error("Error fetching bulk users:", error);
      res.status(500).json({ message: "Error fetching bulk user details", error: error.message });
    }
  });
  app.put("/reject/:orderId", async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const updatedOrder = await users.findOneAndUpdate(
            { _id: orderId }, // Find order by its unique ID
            { status: "Rejected" }, // Set status to "Rejected"
            { new: true } // Return updated order
        );

        if (!updatedOrder) {
            return res.status(404).json({ error: "Order not found" });
        }

        res.json({ message: "Order rejected successfully", order: updatedOrder });
    } catch (error) {
        console.error("Error rejecting order:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/updateOrder", async (req, res) => {
    try {
      const { orderId, address, gmail } = req.body;
  
      if (!orderId) {
        return res.status(400).json({ message: "Order ID is required" });
      }
  
      // Find and update the order
      const order = await users.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
  
      // Update only provided fields
      if (address) order.address = address;
      if (gmail) order.gmail = gmail;
  
      // Set status to "Confirmed"
      order.status = "Confirmed";
  
      await order.save(); // Save updated data
      
      res.json({ success: true, message: "Order confirmed", order });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error updating order", error: error.message });
    }
  });
  
  
//BULK
app.put('/confirm_order/:id', async (req, res) => {
    try {
        await BulkUser.findByIdAndUpdate(req.params.id, { status: "Confirmed" });
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// ✅ Fetch confirmed orders
app.get('/get_confirmed_orders', async (req, res) => {
    try {
        const confirmedOrders = await BulkUser.find({ status: "Confirmed" });
        res.json(confirmedOrders);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

app.get('/get_amount/:id', async (req, res) => {
    try {
        const bulkUserId = req.params.id;
        const amountEntry = await AmountModel.findOne({ bulkUserId });

        if (!amountEntry) {
            return res.status(404).json({ message: "Amount not found" });
        }

        res.json(amountEntry);
    } catch (error) {
        console.error("Error fetching amount:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

app.get("/getEwasteRequests", async (req, res) => {
    const gmail = req.query.email;
    if (!gmail) return res.status(400).json({ error: "Email is required" });

    try {
        console.log("Fetching from DB for:", gmail);
        const requests = await users.find({ gmail });

        console.log("DB Response:", requests); // Log data from DB
        res.json(requests);
    } catch (error) {
        console.error("Database Error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.post("/addEwaste", async (req, res) => {
    try {
        console.log("Received request body:", req.body); // Log incoming data

        const newRequest = new users(req.body);
        await newRequest.save();

        res.status(201).json({ message: "E-Waste request added successfully!" });
    } catch (error) {
        console.error("Error saving request:", error); // Log error to console
        res.status(500).json({ message: "Error adding request", error: error.message });
    }
});

app.post('/submit_vendor', submitVendor);
app.post('/confirm_order', confirmOrder);


app.get("/get_confirmed_orders", async (req, res) => {
    try {
        const confirmedOrders = await BulkUser.find({ status: "Confirmed" }); // Fetch only confirmed orders
        res.json(confirmedOrders);
    } catch (error) {
        console.error("Error fetching confirmed orders:", error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// Route to confirm an order

app.post("/confirm_order_conf", async (req, res) => {
    try {
        console.log("🔹 Received order confirmation request:", req.body);
        console.log("📩 Received Data:", JSON.stringify(req.body, null, 2));
        const { bulkUserId, amount, enteredBy } = req.body;
        if (!bulkUserId || !amount || !enteredBy) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        const result = await storeAmountEntry({ bulkUserId, amount, enteredBy });

        console.log("✅ Order confirmed:", result);
        res.json({ success: true, message: "Order confirmed and amount added successfully", data: result });
    } catch (error) {
        console.error("❌ Error in confirm_order:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
});
// app.post("/confirm_order_upd", async (req, res) => {
//     try {
//         const { bulkUserId, amount, enteredBy } = req.body;

//         if (!bulkUserId || !amount) {
//             return res.status(400).json({ success: false, message: "Missing required fields" });
//         }

//         const updatedOrder = await BulkUser.findByIdAndUpdate(
//             bulkUserId,
//             { amount, status: "Confirmed" }, // Update the amount and status
//             { new: true }
//         );

//         if (!updatedOrder) {
//             return res.status(404).json({ success: false, message: "Order not found" });
//         }

//         res.json({ success: true, message: "Order confirmed successfully!", order: updatedOrder });
//     } catch (error) {
//         console.error("Error confirming order:", error);
//         res.status(500).json({ success: false, message: "Internal Server Error" });
//     }
// });
app.get("/getPendingRequests", async (req, res) => {
    try {
        const userId = req.query.userId;
        console.log("Received userId:", userId);

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Convert userId string to MongoDB ObjectId
        const objectId = new mongoose.Types.ObjectId(userId);

        // Fetch pending requests
        const pendingRequests = await AmountModel.find({ bulkUserId: objectId, status: "Pending" });

        if (!pendingRequests || pendingRequests.length === 0) {
            return res.status(404).json({ error: "No pending requests found." });
        }

        res.json(pendingRequests);
    } catch (error) {
        console.error("Error fetching pending requests:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});


app.get("/get_company_username", async (req, res) => {
    const { email } = req.query;
    if (!email) {
        return res.status(400).json({ error: "Email is required" });
    }

    try {
        const company = await Company.findOne({ email: email }); // Search company by email
        if (company) {
            console.log("Found company", company.company_name);
            res.json({ username: company.company_name});
        } else {
            res.status(404).json({ error: "Company not found" });
        }
    } catch (error) {
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
