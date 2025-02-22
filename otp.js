const nodemailer = require("nodemailer");

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "lalpradhapking@gmail.com",
    pass: "jdzq eagj tkme qhop",
  },
});

// Generate and Send OTP
const sendOtp = (req, res) => {
  const { email } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const mailOptions = {
    from: "lalpradhapking@gmail.com",
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is: ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return res.status(500).send("Error in sending OTP.");
    }
    res.json({ otp });
  });
};

module.exports = { sendOtp };
