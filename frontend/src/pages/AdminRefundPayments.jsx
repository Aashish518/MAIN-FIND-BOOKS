import React, { useEffect, useState } from "react";
import { AdminRoute } from "./AdminDashboard";
import "../pages-css/AdminRefundPayments.css";
import Cookies from "js-cookie";

const AdminRefundPayments = () => {
    const token = Cookies.get("token");
    const [refundPayments, setRefundPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchRefundPayments = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/refundpayment`, {
                    credentials: "include",
                    headers: {
                        authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                });
                const data = await response.json();

                if (data && data.refundPayment && Array.isArray(data.refundPayment)) {
                    setRefundPayments(data.refundPayment);
                } else {
                    setRefundPayments([]);
                }
            } catch (error) {
                alert("Failed to fetch refund payments. Please try again later.");
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        fetchRefundPayments();
    }, []);

    const filteredPayments = refundPayments.filter((item) => {
        const query = searchQuery.toLowerCase();
        return (
            (item.payment_id && item.payment_id.toLowerCase().includes(query)) ||
            (item.refund_status && item.refund_status.toLowerCase().includes(query)) ||
            (item.order_status && item.order_status.toLowerCase().includes(query)) ||
            (item.bank_account_number && item.bank_account_number.toLowerCase().includes(query)) ||
            (item.ifsc_code && item.ifsc_code.toLowerCase().includes(query))
        );
    });

    return (
        <AdminRoute>
            <br />
            <div className="payments-container">
                <h2>Refund Payments</h2>
                <input
                    type="text"
                    placeholder="Search refund payments..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="refundsearch-input"
                    style={{ marginBottom: "1rem", padding: "0.5rem", width: "100%", maxWidth: "400px" }}
                />

                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <div className="table-wrapper">
                        <table className="payments-table">
                            <thead>
                                <tr>
                                    <th>Payment ID</th>
                                    <th>Refund Date</th>
                                    <th>Refund Status</th>
                                    <th>Order Status</th>
                                    <th>Bank Account Number</th>
                                    <th>IFSC Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" style={{ textAlign: "center" }}>
                                            No refund payments found.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredPayments.map((item) => (
                                        <tr key={item._id}>
                                            <td>{item.payment_id}</td>
                                            <td>{item.refund_date ? new Date(item.refund_date).toLocaleDateString() : "N/A"}</td>
                                            <td>{item.refund_status}</td>
                                            <td>{item.order_status || "N/A"}</td>
                                            <td>{item.bank_account_number || "N/A"}</td>
                                            <td>{item.ifsc_code || "N/A"}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminRoute>
    );
};

export default AdminRefundPayments;
