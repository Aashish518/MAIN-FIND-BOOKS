import React, { useEffect, useState } from "react";
import "../pages-css/ManageReseller.css";
import Cookies from "js-cookie";

const ManageResellers = () => {
    const token = Cookies.get("token");
    const [resellers, setResellers] = useState([]);
    const [search, setSearch] = useState("");
    const [filteredReseller, setFilteredReseller] = useState([]);

    useEffect(() => {
        fetchResellers();
    }, []);

    const fetchResellers = async () => {
        try {
            const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/resellerbook`, {
                headers: {
                    authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
            });
            const data = await response.json();
            setResellers(data.resellers);
        } catch (error) {
            console.error("Error fetching resellers:", error);
        }
    };

    useEffect(() => {
        if (search.trim() === "") {
            setFilteredReseller(resellers);
        } else {
            setFilteredReseller(
                resellers.filter((reseller) =>
                    reseller.User_id?.First_name.toLowerCase().includes(search.toLowerCase()) ||
                    reseller.User_id?.Last_name.toLowerCase().includes(search.toLowerCase())
                )
            );
        }
    }, [search, resellers]);

    return (
        <div className="resellers-page">
            <h2 className="title">Manage Resellers</h2>
            <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="search-bar"
            />
            <div className="resellers-card">
                <table className="resellers-table">
                    <thead>
                        <tr>
                            <th>Reseller Name</th>
                            <th>Book ID</th>
                            <th>Address</th>
                            <th>UPI ID</th>
                            <th>Bank Account No</th>
                            <th>IFSC Code</th>
                            <th>Status</th>
                            <th>Delivery User ID</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredReseller.map((reseller) => (
                            <tr key={reseller._id}>
                                <td>
                                    {reseller.User_id
                                        ? `${reseller.User_id.First_name} ${reseller.User_id.Last_name}`
                                        : "N/A"}
                                </td>
                                <td>{reseller.Book_id}</td>
                                <td>{reseller.address}</td>
                                <td>{reseller.upi_id || "N/A"}</td>
                                <td>{reseller.bank_acc_no || "N/A"}</td>
                                <td>{reseller.ifsc_code || "N/A"}</td>
                                <td>{reseller.Resell_Status}</td>
                                <td>{reseller.Delivery_User_id || "N/A"}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ManageResellers;
