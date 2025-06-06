import React, { useState, useEffect } from "react";
import { Navbar } from "../components/Navbar";
import "../pages-css/SellOrder.css";
import { ProfileMenu } from "../components/ProfileMenu";
import { Package, Calendar, CreditCard, Truck, XCircle } from "lucide-react";
import Load from "../components/Load";
import { useAlert } from "../Context/AlertContext";
import Cookies from "js-cookie";

export const SellOrders = () => {
  const token = Cookies.get("token");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reseller, setReseller] = useState([]);
  const { showAlert } = useAlert();


  console.log(books, reseller)
  useEffect(() => {
    const getSellOrder = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/SellOrders`, {
          credentials: "include",
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        const json = await response.json();
        const books = Array.isArray(json.books) ? json.books : [];
        const resellerdata = Array.isArray(json.resellerdata) ? json.resellerdata : [];
        setBooks(books);
        setReseller(resellerdata)
      } catch (error) {
        console.error("Error fetching SellOrder data:", error);
      } finally {
        setLoading(false);
      }
    };

    getSellOrder();
  }, []);


  const updatestatus = async (resellerid, bookid) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/Book`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }, body: JSON.stringify({ bookId: bookid }),
        credentials: 'include',
      });

      if (response.ok) {
        setBooks([]);
      }else{
        showAlert("book not deleted");
      }

    } catch (error) {
      console.error("Error updating quantity:", error);
      showAlert("An error occurred while updating the quantity","error");
    }

setTimeout(async ()=> {
    try{
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/ResellerPaymentForm/${resellerid}`, {
        method: 'DELETE',
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }, body: JSON.stringify({ resellerid: resellerid }),
        credentials: 'include',
      });

      if (response.ok) {
        setReseller([]);
        showAlert ("your sellorder removed","success");
      }else{
        showAlert("reseller not deleted");
      }

    } catch (error) {
      console.error("Error updating quantity:", error);
      showAlert("An error occurred while updating the quantity","error");
    }
    
},1000)
  }

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const dateObj = new Date(isoDate);
    return `${dateObj.getDate().toString().padStart(2, "0")}-${(dateObj.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${dateObj.getFullYear()}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "sold":
        return "status-sold";
      case "pending":
        return "status-pending";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-default";
    }
  };

  if (loading) {
    return <Load />;
  }

  return (
    <>
      <Navbar />
      <div className="sell-orders-container">
        <ProfileMenu />
        <div className="sell-orders-page">
          <div className="sell-orders-header">
            <h1>My Sell Orders</h1>
            <p className="sell-orders-subtitle">Track and manage your book sales</p>
          </div>
          <div className="sell-orders-list">
            {reseller && reseller.length > 0 ? (
              reseller.map((reseller) => (
                <div key={reseller._id} className="sell-order-card">
                  <div className="order-header">
                    <div className="order-info">
                      {books
                        .filter((data) => reseller.Book_id === data._id)
                        .map((bookdata) => (
                          <div key={bookdata._id}>
                            <div className="order-date">
                              <span>Created At</span>
                              <Calendar size={20} />
                              <span>{bookdata.createdAt ? formatDate(bookdata.createdAt) : "N/A"}</span><br></br>
                              <span>Update Date</span>
                              <Calendar size={20} />
                              <span>{bookdata.updatedAt ? formatDate(bookdata.updatedAt) : "N/A"}</span>
                            </div>
                          </div>
                        ))
                      }
                    </div>
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                    <Truck size={20} />
                    <span>{reseller.Resell_Status || "Pending"}</span>
                  </div>


                  <div className="order-books">
                    <h3>Book Details</h3>
                    {books
                      .filter((data) => reseller.Book_id === data._id)
                      .map((bookdata) => (
                        <div key={bookdata._id}>
                          <div className="book-list">
                            <div className="book-card">
                              <div className="book-image">
                                <img
                                  src={`${bookdata.BookImageURL}`}
                                  alt={bookdata.BookName}
                                />
                              </div>
                              <div className="book-details">
                                <h4>{bookdata.BookName}</h4>
                                <p className="book-price">₹{bookdata.Price}</p>
                                <p className="book-quantity">Quantity: {bookdata.Quantity || 1}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))
                    }
                    <br/>
                    <p>Reseller Address: {reseller.address}</p>
                    <br/>
                    {reseller.Resell_Status === "Pending" ? (
                      <button onClick={() => updatestatus(reseller._id, reseller.Book_id)}>
                        Cancel Sell Book
                      </button>
                    ) : ""}
                  </div>
                </div>
              ))
            ) : (
              <div className="no-orders">
                <Package size={48} />
                <h2>No Sell Orders Yet</h2>
                <p>Start selling books to see your orders here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

}; 