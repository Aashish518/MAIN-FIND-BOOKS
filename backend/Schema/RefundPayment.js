const mongoose = require('mongoose');
const { Schema } = mongoose;

const refundPaymentSchema = new Schema({
  payment_id: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  refund_date: {
    type: Date,
  },
  refund_status: {
    type: String,
    required: true,
    enum: ['Pending', 'Completed', 'Failed']
  },
  refund_method: {
    type: String
  },
  reason: {
    type: String
  },
  bank_account_number: {
    type: String
  },
  ifsc_code: {
    type: String
  }
});

const RefundPayment = mongoose.model('RefundPayment', refundPaymentSchema);

module.exports = RefundPayment;
