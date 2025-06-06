import React, { useState } from "react";
import "../pages-css/ResellerPaymentForm.css";
import { useNavigate, useLocation } from "react-router-dom";
import { useAlert } from "../Context/AlertContext";
import { deliveryChargesArray } from "./Useraddress";
import Cookies from "js-cookie";

export const ResellerPaymentForm = () => {
  const token = Cookies.get("token");
  const [paymentMethod, setPaymentMethod] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { bookData, UserRole } = location.state || {};
  const { showAlert } = useAlert();

  const [formData, setFormData] = useState({
    address: "",
    upi_id: "",
    bank_acc_no: "",
    ifsc_code: "",
    Pincode: "",
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};
    if (formData.address.trim().length < 10) {
      newErrors.address = "Address must be at least 10 characters.";
    }
    if (!/^[0-9]{6}$/.test(formData.Pincode)) {
      newErrors.Pincode = "Pincode must be exactly 6 digits.";
    }
    if (!paymentMethod) {
      showAlert("Please select a payment method.", "error");
      return false;
    }
    if (paymentMethod === "UPI" && !/^[\w.-]+@[a-zA-Z]+$/.test(formData.upi_id)) {
      newErrors.upi_id = "Invalid UPI ID format.";
    }
    if (paymentMethod === "Banking Details") {
      if (!/^[0-9]{9,18}$/.test(formData.bank_acc_no)) {
        newErrors.bank_acc_no = "Bank account number must be 9 to 18 digits.";
      }
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(formData.ifsc_code)) {
        newErrors.ifsc_code = "Invalid IFSC code format.";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate pincode delivery area
    const isPincodeValid = deliveryChargesArray.some(
      (item) => item.pincode === formData.Pincode
    );

    if (!isPincodeValid) {
      showAlert("Book will not collect on this location. Please enter a valid Pincode.", "error");
      return;
    }

    if (!validateForm()) return;

    // Prepare FormData for book submission (including image)
    const formDataToSend = new FormData();
    for (const key in bookData) {
      // Handle image file specifically (as file)
      if (key === "image" && bookData.image instanceof File) {
        formDataToSend.append("image", bookData.image);
      } else {
        formDataToSend.append(key, bookData[key]);
      }
    }

    try {
      // POST book data to API
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/${UserRole}/Book`, {
        method: "POST",
        body: formDataToSend,
        credentials: "include",
        headers: {
          authorization: `Bearer ${token}`,
          // Remove Content-Type header to let browser set it to multipart/form-data with boundary
          // "Content-Type": "application/json",
        },
      });

      const json = await response.json();

      if (json.book?._id) {
        const bookid = json.book._id;

        // Now POST payment form data with bookid
        const paymentResponse = await fetch(`${import.meta.env.VITE_BACK_URL}/api/ResellerPaymentForm`, {
          method: "POST",
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...formData, bookid }),
          credentials: "include",
        });

        const paymentJson = await paymentResponse.json();

        if (paymentJson.data) {
          showAlert("Data added successfully, please check terms & conditions", "success");
          navigate("/SellOrders");
        } else {
          showAlert("Failed to save payment details", "error");
        }
      } else {
        showAlert(json.message || "Book not added", "error");
      }
    } catch (error) {
      console.error("Error occurred during submission:", error);
      showAlert("An error occurred while adding the book.", "error");
    }
  };

  if (!bookData) {
    return <p>No book data found. Please fill the book form first.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="payment-details-form">
      <h2>Payment Details Form</h2>

      <label>Address</label>
      <input type="text" name="address" value={formData.address} onChange={handleChange} />
      {errors.address && <span className="error-message">{errors.address}</span>}

      <label>Pincode</label>
      <input type="text" name="Pincode" value={formData.Pincode} onChange={handleChange} />
      {errors.Pincode && <span className="error-message">{errors.Pincode}</span>}

      <label>Payment Receive Method</label>
      <select
        className="payment-method"
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
      >
        <option value="">Select Payment Method</option>
        <option value="UPI">UPI</option>
        <option value="Banking Details">Banking Details</option>
      </select>

      {paymentMethod === "UPI" && (
        <>
          <label>UPI ID</label>
          <input type="text" name="upi_id" value={formData.upi_id} onChange={handleChange} />
          {errors.upi_id && <span className="error-message">{errors.upi_id}</span>}
        </>
      )}

      {paymentMethod === "Banking Details" && (
        <>
          <label>Bank Account Number</label>
          <input
            type="text"
            name="bank_acc_no"
            value={formData.bank_acc_no}
            onChange={handleChange}
          />
          {errors.bank_acc_no && <span className="error-message">{errors.bank_acc_no}</span>}

          <label>IFSC Code</label>
          <input type="text" name="ifsc_code" value={formData.ifsc_code} onChange={handleChange} />
          {errors.ifsc_code && <span className="error-message">{errors.ifsc_code}</span>}
        </>
      )}

      <button type="submit" className="resellsubmit-btn">Submit</button>
    </form>
  );
};
