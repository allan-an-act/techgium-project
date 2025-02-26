const nodemailer = require('nodemailer');
const {db, users, BulkUser, Company,Vendor,Email,router}=require("./company");
const USER_EMAIL = "lalpradhapking@gmail.com";
const USER_PASSWORD = "jdzq eagj tkme qhop";
const VENDOR_EMAIL = "22d127@psgitech.ac.in"; 

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: USER_EMAIL,
        pass: USER_PASSWORD
    }
});

const sendEmail = (recipient, subject, body) => {
    const mailOptions = {
        from: USER_EMAIL,
        to: recipient,
        subject: subject,
        text: body
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`Failed to send email: ${error}`);
        } else {
            console.log(`Email sent successfully to ${recipient}: ${info.response}`);
        }
    });
};

const submitVendor = (req, res) => {
    const { date, time1, time2, time3, email } = req.body;

    if (!email || !date || !time1 || !time2 || !time3) {
        return res.status(400).json({ message: "Error: All fields are required!" });
    }

    const emailBody = `Dear User,\n\nThe vendor has proposed the following date and time slots:\n\n📅 
    Date: ${date}\n🕒 Time 1: ${time1}\n🕒 Time 2: ${time2}\n🕒 Time 3: ${time3}\n\n
    The vendor will be available during these times for pickup of e-waste.
    The vendor may show up to pick up e-waste to the given timings which may vary by a maximum of 30 minutes .Hope you corporate with us.Thank you.`;

    sendEmail(email, "Order Confirmation Required", emailBody);

    res.json({ message: `Notification sent to ${email} for confirmation!` });
};


const confirmOrder = async (req, res) => {
    const { date, time1, time2, time3, email } = req.body;

    if (!email || !date || !time1 || !time2 || !time3) {
        return res.status(400).json({ message: "Error: All fields are required!" });
    }

    try {
        // Update the status of the user with the given email
        const result = await users.updateMany(
            { gmail: email }, // Find user by email
            { $set: { status: "Pickup" } }, // Update status
            { returnDocument: "after" }
        );
        console.log("Updated User:", result);
        if (result.matchedCount === 0) {
            return res.status(404).json({ message: "No user found with this email" });
        }

        // Send Confirmation Email
        const emailBody = `✅ Your order is confirmed!\n\nA notification has been sent to both the vendor and the customer.
        \n📅 Date: ${date}\n🕒 Time 1: ${time1}\n🕒 Time 2: ${time2}\n🕒 Time 3: ${time3}\n\nStatus: Your order is confirmed! Status updated to Pickup.`;

        sendEmail(email, "Order Confirmed", emailBody);
        sendEmail(VENDOR_EMAIL, "Order Confirmed", emailBody);

        res.json({ message: "Your order is confirmed! Status updated to Pickup." });

    } catch (error) {
        console.error("Database update error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

module.exports = { submitVendor, confirmOrder };
