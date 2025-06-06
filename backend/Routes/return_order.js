const express = require('express');
require('dotenv').config();
const router = express.Router();
const nodemailer = require('nodemailer');
const ReturnOrder = require('../Schema/ReturnOrder');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
// POST endpoint to create a new return order with image upload
const multer = require('multer');
const path = require('path');
const Order = require('../Schema/Order');
const User = require('../Schema/User');

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: { user: process.env.MY_EMAIL, pass: process.env.EMAIL_PASSWORD }
});


cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configure multer for file uploads
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'uploads',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  },
});

const upload = multer({ storage: storage });

router.post('/returnorder', upload.single("image"), async (req, res) => {
  try {
    console.log('Received file:', req.file);
    const { order_id, reason, additional_info } = req.body;

    if (!order_id || !reason) {
      return res.status(400).json({ message: 'order_id and reason are required' });
    }
    

    const newReturnOrder = new ReturnOrder({
      order_id,
      reason,
      additional_info,
      image_url: req.file.path
    });

    const savedReturnOrder = await newReturnOrder.save();
    res.status(201).json(savedReturnOrder);
  } catch (error) {
    console.error('Error creating return order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GET endpoint to get return orders filtered by order_id and include user first and last name
router.get('/returnorder', async (req, res) => {
  try {
    const { order_id } = req.query;
    let query = {};
    if (order_id) {
      query.order_id = order_id;
    }
    // Find return orders matching query
    const returnOrders = await ReturnOrder.find(query).sort({ createdAt: -1 });

    // For each return order, fetch user details from Order schema
    const enrichedReturnOrders = await Promise.all(
      returnOrders.map(async (returnOrder) => {
        const order = await Order.findOne({ _id: returnOrder.order_id });
        let userFirstName = '';
        let userLastName = '';
        if (order) {
          const user = await User.findOne({ _id: order.User_id });
          if (user) {
            userFirstName = user.First_name || '';
            userLastName = user.Last_name || '';
          }
        }
        return {
          ...returnOrder.toObject(),
          userFirstName,
          userLastName,
        };
      })
    );

    res.json(enrichedReturnOrders);
  } catch (error) {
    console.error('Error fetching return orders:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//return order email for approve or reject the return request
router.put('/returnorder/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedReturnOrder = await ReturnOrder.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedReturnOrder) {
      return res.status(404).json({ message: 'Return order not found' });
    }

    // Fetch order and user details for email
    const order = await Order.findOne({ _id: updatedReturnOrder.order_id });
    if (!order) {
      console.error('Order not found for return order:', updatedReturnOrder._id);
      return res.status(404).json({ message: 'Order not found' });
    }

    const user = await User.findOne({ _id: order.User_id });
    if (!user || !user.Email) {
      console.error('User not found or email missing for order:', order._id);
      return res.status(404).json({ message: 'User not found or email missing' });
    }

    // Compose email based on status
    let subject = '';
    let text = '';

    if (status === 'Approved') {
      subject = 'Your return order has been approved';
      text = `Hello ${user.First_name || ''},

Your return order for order ID ${order._id} has been approved.your book can be collected in 1 or 2 days.

Thank you for using FindBooks!

Best regards,
FindBooks Team`;

      // Update the Order's Order_Status to "return-pending" when return order is approved
      await Order.findByIdAndUpdate(order._id, { Order_Status: "return-pending" });

    } else if (status === 'Rejected') {
      subject = 'Your return order has been rejected';
      text = `Hello ${user.First_name || ''},

We regret to inform you that your return order for order ID ${order._id} has been rejected.

If you have any questions, please contact our support team.

Thank you for using FindBooks!

Best regards,
FindBooks Team`;
    }

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.MY_EMAIL.trim(),
        to: user.Email,
        subject,
        text,
      });
      console.log(`Return order status email sent to ${user.Email} for status ${status}`);
    } catch (emailError) {
      console.error('Error sending return order status email:', emailError);
    }

    res.json(updatedReturnOrder);
  } catch (error) {
    console.error('Error updating return order status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

