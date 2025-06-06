import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../pages-css/ResellDeliveryDetail.css";
import { useAlert } from "../Context/AlertContext";
import Cookies from "js-cookie";

export const ResellDeliveryDetail = () => {
    const token = Cookies.get("token");
    const navigate = useNavigate();
    const location = useLocation();
    const [otp, setOtp] = useState("");
    const [step, setStep] = useState(1);
    const [timer, setTimer] = useState(60);
    const [otpSent, setOtpSent] = useState(false);
    const [verified, setVerified] = useState(false);
    const [deliveryCompleted, setDeliveryCompleted] = useState(false);
    const { showAlert } = useAlert();

    const { resellerdata = {}, books = [], reselluser = [] } = location.state || {};
    const userdetail = reselluser.find((u) => u._id === resellerdata.User_id._id) || {};
    const booksdetail = books.find((p) => p._id === resellerdata.Book_id);
    const email = userdetail.Email || "";

    useEffect(() => {
        let countdown;
        if (otpSent && timer > 0) {
            countdown = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        } else if (timer === 0) {
            clearInterval(countdown);
            setOtpSent(false);
        }
        return () => clearInterval(countdown);
    }, [otpSent, timer]);

    const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    const handleSendOtp = async () => {
        if (!isValidEmail(email)) {
            showAlert("Please enter a valid email address.","error");
            return;
        }

        try {
            const res = await fetch(`${import.meta.env.VITE_BACK_URL}/api/${"reselldelivery"}/forgot-password`, {
                method: "POST",
                headers: {
                    authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }, body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setStep(2);
                setOtpSent(true);
                setTimer(60);
            } else {
                showAlert("Failed to send OTP. Please try again.","error");
            }
        } catch (error) {
            showAlert("Error sending OTP. Check your internet connection.","error");
        }
    };

    const handleVerifyOtp = async () => {
        try {
            const res = await fetch(`${import.meta.env.VITE_BACK_URL}/api/verify-otp`, {
                method: "POST",
                headers: {
                    authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }, body: JSON.stringify({ email, otp }),
            });

            if (res.ok) {
                setVerified(true);
                setStep(3);
            } else {
                showAlert("Invalid OTP. Please try again.","error");
            }
        } catch (error) {
            showAlert("Error verifying OTP. Please check your connection.","error");
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;

        try {
            const res = await fetch(`${import.meta.env.VITE_BACK_URL}/api/resend-otp`, {
                method: "POST",
                headers: {
                    authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                }, body: JSON.stringify({ email }),
            });

            if (res.ok) {
                setOtpSent(true);
                setTimer(60);
            } else {
                showAlert("Failed to resend OTP. Try again.","error");
            }
        } catch (error) {
            showAlert("Error resending OTP.","error");
        }
    };

    const updateOrderStatus = async (resellerid, newStatus) => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/${newStatus}/SellOrders`, {
                    method: 'PUT',
                    headers: {
                        authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },                    body: JSON.stringify({ resellerid: resellerid, bookid: booksdetail._id }),
                    credentials: 'include',
                });


                if (response.ok) {
                    addpaymentdata();
                }
                setDeliveryCompleted(true);

            } catch (error) {
                console.error("Error fetching Sell Order data:", error);
            }
    };
    
    const addpaymentdata = async() => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/${"debit"}/codpayment`, {
                method: "POST",
                headers: {
                    authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    order_id: resellerdata._id,
                    payment_method: "COD",
                    payment_status: "Completed",
                    total_payment: booksdetail.Price,
                }),
                credentials: "include",
            });
        }
        catch (error) {
            console.error("Error store paymentdata:", error);
        }
    }

        return (
            <div className="delivery-process-container">
                <h1>Delivery Process</h1>

                <div className="order-details">
                    <h2>Customer Details</h2>
                    <p><strong>Customer Name:</strong> {userdetail.First_name ? `${userdetail.First_name} ${userdetail.Last_name}` : "N/A"}</p>
                    <p><strong>Phone No:</strong> {userdetail.Phone_no || "N/A"}</p>
                    <p><strong>Email Id:</strong> {userdetail.Email || "N/A"}</p>
                </div>

                <div className="order-details">
                    <h2>Order Details</h2>
                    <p><strong>Book ID:</strong> {booksdetail.BookName || "N/A"}</p>
                    <p><strong>Status:</strong> {resellerdata.Resell_Status || "N/A"}</p>
                    <p><strong>Amount:</strong> {booksdetail.Price || "0.00"}</p>
                    <p><strong>Book Condition :</strong> {booksdetail.Condition || "0.00"}</p>
                </div>

                <div className="order-details">
                    <h2>Payment Details</h2>
                    {resellerdata.upi_id === "" ?
                        (<>
                            <p><strong>  Bank Account No :</strong> {resellerdata.bank_acc_no}</p>
                            <p><strong>  IFSC Code :</strong> {resellerdata.ifsc_code}</p>
                        </>) :
                        <p><strong> UPI ID :</strong> {resellerdata.upi_id}</p>
                    }
                </div>

                {!deliveryCompleted ? (
                    <div className="otp-section">
                        <h2>OTP Verification</h2>
                        <p>OTP Sent to Customer Email: {email || "N/A"}</p>

                        {step === 1 && (
                            <button onClick={handleSendOtp} disabled={!isValidEmail(email)} className="submit-button">
                                Send OTP
                            </button>
                        )}

                        {step === 2 && !verified && (
                            <div className="otp-container">
                                <p className="otp-label">Enter OTP</p>
                                <input
                                    type="text"
                                    className="otp-input"
                                    placeholder="Enter OTP"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                                {/* {otpSent && timer > 0 && <p>OTP expires in: {timer}s</p>} */}
                                <div>
                                    <button className="submit-button" onClick={handleVerifyOtp}>Verify OTP</button>
                                    <button className="submit-button" onClick={handleResendOtp} disabled={timer > 0}>
                                        Resend OTP {timer > 0 && `(${timer}s)`}
                                    </button>
                                </div>
                            </div>
                        )}

                        {verified && (
                            <div className="otp-success">
                                <p className="success-message">OTP Verified Successfully!</p>
                                <button className="submit-button" onClick={() => updateOrderStatus(resellerdata._id, "Collected")}>
                                    Book Collected
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="delivery-confirmation">
                            <h2>Book Collected Successfully</h2>
                    </div>
                )}
            </div>
        );
    };
