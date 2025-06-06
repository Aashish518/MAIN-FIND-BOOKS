const express = require('express');
const router = express.Router();
const RefundPayment = require('../Schema/RefundPayment');
const Payment = require("../Schema/Payment")

// Create a new refund payment
router.post('/refundpayment', async (req, res) => {
  try {
    const { payment_id, refund_date, refund_status, refund_method, reason, bank_account_number, ifsc_code } = req.body;

    if (!payment_id || !refund_status) {
      return res.status(400).json({ message: 'payment_id and refund_status are required' });
    }

    const refundPayment = new RefundPayment({
      payment_id,
      refund_date,
      refund_status,
      refund_method,
      reason,
      bank_account_number,
      ifsc_code
    });

    const savedRefundPayment = await refundPayment.save();
    res.status(201).json(savedRefundPayment);
  } catch (error) {
    console.error('Error creating refund payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Update refund payment by id
router.put('/refundpayment/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_id, refund_date, refund_status, refund_method, reason, bank_account_number, ifsc_code } = req.body;

    const updateData = {
      payment_id,
      refund_date,
      refund_status,
      refund_method,
      reason,
      bank_account_number,
      ifsc_code
    };

    const updatedRefundPayment = await RefundPayment.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedRefundPayment) {
      return res.status(404).json({ message: 'Refund payment not found' });
    }
    res.json(updatedRefundPayment);
  } catch (error) {
    console.error('Error updating refund payment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get refund payment(s)
router.get('/refundpayment', async (req, res) => {
  try {
      const refundPayment = await RefundPayment.find();
      if (!refundPayment) {
        return res.status(404).json({ message: 'Refund payment not found' });
      }

      const razorpay = await Payment.findById(refundPayment.payment_id);
       if (!razorpay) {
        return res.status(404).json({ message: 'Refund payment not found' });
      }

      const razorpay_id = razorpay.payment_id;

      res.json({refundPayment : refundPayment,razorpay_id : razorpay_id});
  } catch (error) {
    console.error('Error fetching refund payment(s):', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
