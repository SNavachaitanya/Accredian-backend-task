const express = require('express');
const { PrismaClient } = require('@prisma/client');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();
const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());

// Create the email transporter with App Password
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,        // Your Gmail address
    pass: process.env.EMAIL_PASSWORD, // Your generated App Password
  },
});

// Function to send a referral email
const sendReferralEmail = async (referrerEmail, refereeEmail) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL,
      to: refereeEmail,
      subject: 'You’ve Been Referred!',
      text: `Hi, you’ve been referred by ${referrerEmail}. Check out our platform!`,
    };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

// REST API Endpoint
app.post('/api/referrals', async (req, res) => {
  const { referrerName, referrerEmail, refereeName, refereeEmail } = req.body;

  if (!referrerName || !referrerEmail || !refereeName || !refereeEmail) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    // Save referral data to the database
    const referral = await prisma.referral.create({
      data: {
        referrerName,
        referrerEmail,
        refereeName,
        refereeEmail,
      },
    });

    // Send email notification
    await sendReferralEmail(referrerEmail, refereeEmail);

    res.status(201).json({ message: 'Referral submitted successfully', referral });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
