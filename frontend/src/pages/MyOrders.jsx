import React, { useEffect, useState } from "react";
import { Navbar } from "../components/Navbar";
import "../pages-css/MyOrders.css";
import { ProfileMenu } from "../components/ProfileMenu";
import { Package, Calendar, CreditCard, Truck } from "lucide-react";
import Load from "../components/Load";
import { useAlert } from "../Context/AlertContext";
import ReturnOrderForm from "../components/ReturnOrderForm";
import Cookies from "js-cookie";

export const MyOrders = () => {
  const token = Cookies.get("token");
  const [order, setOrder] = useState([]);
  const [book, setBook] = useState([]);
  const [resellerEntries, setResellerEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showAlert } = useAlert();
  const [returnmessage, setReturnmessage] = useState("");
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState(null);

  useEffect(() => {
    const fetchCarts = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/Order`, {
          credentials: "include",
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const json = await response.json();
        const newOrders = Array.isArray(json.orders) ? json.orders : [];
        const newBooks = Array.isArray(json.books) ? json.books : [];
        setOrder(newOrders);
        setBook(newBooks);
      } catch (error) {
        console.error("Error fetching order data:", error);
      }
    };

    const fetchResellerEntries = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/SellOrders`, {
          credentials: "include",
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        if (response.ok) {
          const data = await response.json();
          setResellerEntries(data.resellerdata || []);
        }
      } catch (error) {
        console.error("Error fetching reseller entries:", error);
      }
    };

    Promise.all([fetchCarts(), fetchResellerEntries()]).finally(() => setLoading(false));
  }, []);

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_BACK_URL}/api/${orderId}/Order`,
        {
          method: "PUT",
          headers: {
            authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ status: newStatus }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update order status");
      }

      setOrder((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, Order_Status: newStatus } : order
        )
      );

      if (newStatus === "Cancelled") {
        const cancelledOrder = order.find(o => o._id === orderId);
        if (cancelledOrder) {
          const hasResellerBook = cancelledOrder.books.some(bookItem => {
            const matchedBook = book.find(b => b._id === bookItem.book_id);
            return matchedBook?.Isoldbook === true;
          });
          if (hasResellerBook) {
            for (const bookItem of cancelledOrder.books) {
              const matchedBook = book.find(b => b._id === bookItem.book_id);
              if (matchedBook?.Isoldbook === true) {
                const resellerEntry = resellerEntries.find(
                  (reseller) =>
                    reseller.Book_id === matchedBook._id &&
                    reseller.User_id === cancelledOrder.User_id
                );
                if (resellerEntry) {
                  try {
                    const resellerResponse = await fetch(
                      `${import.meta.env.VITE_BACK_URL}/api/Pending/SellOrders`,
                      {
                        method: "PUT",
                        headers: {
                          authorization: `Bearer ${token}`,
                          "Content-Type": "application/json",
                        },
                        credentials: "include",
                        body: JSON.stringify({
                          resellerid: resellerEntry._id,
                          bookid: matchedBook._id,
                        }),
                      }
                    );
                    if (!resellerResponse.ok) {
                      console.error(
                        "Failed to update reseller status for book",
                        matchedBook._id
                      );
                    }
                  } catch (error) {
                    console.error("Error updating reseller status:", error);
                  }
                }
                try {
                  const cancelEmailResponse = await fetch(
                    `${import.meta.env.VITE_BACK_URL}/cancel-seller-email/${matchedBook._id}`,
                    {
                      method: "GET",
                      credentials: "include",
                      headers: {
                        authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                      },
                    }
                  );
                  if (!cancelEmailResponse.ok) {
                    console.error(
                      "Failed to send cancellation email for book",
                      matchedBook._id
                    );
                  }
                } catch (error) {
                  console.error("Error sending cancellation email:", error);
                }
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Error updating order status:", error);
      showAlert("Failed to update order status. Please try again.", "error");
    }
    if (newStatus === "Return") {
      setReturnmessage("your order return , received in 2 day");
    }
  };

  const handleReturnClick = (orderId) => {
    setSelectedOrderId(orderId);
    setShowReturnForm(true);
  };

  const handleReturnCancel = () => {
    setSelectedOrderId(null);
    setShowReturnForm(false);
  };

 const handleReturnSubmit = async (formData) => {
  try {
    const response = await fetch(
      `${import.meta.env.VITE_BACK_URL}/api/returnorder`,
      {
        method: "POST",
        credentials: "include",
        body: formData,
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to submit return request");
    }

    const orderId = formData.get('order_id');

    // Update order status to 'return-request'
    const statusUpdateResponse = await fetch(
      `${import.meta.env.VITE_BACK_URL}/api/${orderId}/Order`,
      {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ status: "return-request" }),
      }
    );

    if (!statusUpdateResponse.ok) {
      throw new Error("Failed to update order status to return-request");
    }

    setReturnmessage("Your return request has been submitted successfully.");
    setShowReturnForm(false);

    // Reload the page to fetch updated orders and status from backend
    window.location.reload();

  } catch (error) {
    console.error("Error submitting return request:", error);
    showAlert("Failed to submit return request. Please try again.", "error");
  }
};

  const formatDate = (isoDate) => {
    if (!isoDate) return "";
    const dateObj = new Date(isoDate);
    return `${dateObj.getDate().toString().padStart(2, "0")}-${(dateObj.getMonth() + 1)
      .toString()
      .padStart(2, "0")}-${dateObj.getFullYear()}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Shipped":
        return "status-shipped";
      case "Pending":
        return "status-pending";
      case "Cancelled":
        return "status-cancelled";
      case "Delivered":
        return "status-delivered";
      default:
        return "status-default";
    }
  };

  if (loading) {
    return <Load />;
  }

  if (showReturnForm && selectedOrderId) {
    return (
      <>
        <Navbar />
        <div className="orders-container">
          <ReturnOrderForm
            orderId={selectedOrderId}
            onCancel={handleReturnCancel}
            onSubmit={handleReturnSubmit}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="orders-container">
        <ProfileMenu />
        <div className="orders-page">
          <div className="orders-header">
            <h1>My Orders</h1>
            <p className="orders-subtitle">Track and manage your orders</p>
          </div>
          <div className="orders-list">
            {order.length > 0 ? (
              order
                .slice()
                .reverse()
                .map((orderItem) => (
                  <div key={orderItem._id} className="order-card">
                    <div className="order-header">
                      <div className="order-info">
                        <div className="order-date">
                          <Calendar size={20} />
                          <span>{formatDate(orderItem.Order_Date)}</span>
                        </div>
                        <div className="order-amount">
                          <CreditCard size={20} />
                          <span>₹{orderItem.Total_Amount}</span>
                        </div>
                        {orderItem.Delivery_Date && (
                          <div className="delivery-date">
                            <Calendar size={20} />
                            <span>Delivered on: {formatDate(orderItem.Delivery_Date)}</span>
                          </div>
                        )}
                      </div>
                      <div className={`order-status ${getStatusColor(orderItem.Order_Status)}`}>
                        <Truck size={20} />
                        <span>{orderItem.Order_Status}</span>
                      </div>
                    </div>
                    <div className="order-books">
                      <h3>Ordered Books : {orderItem.books.length}</h3>
                      <div className="book-list">
                        {book
                          .filter(
                            (bookItem, index, self) =>
                              orderItem.books.some(
                                (orderBook) => orderBook.book_id === bookItem._id
                              ) &&
                              index ===
                              self.findIndex((b) => b._id === bookItem._id)
                          )
                          .map((bookItem) => {
                            const matchedBook = orderItem.books.find(
                              (orderBook) => orderBook.book_id === bookItem._id
                            );

                            return (
                              <div key={bookItem._id} className="book-card">
                                <div className="book-image">
                                  <img
                                    src={`${bookItem.BookImageURL}`}
                                    alt={bookItem.BookName}
                                  />
                                </div>
                                <div className="book-details">
                                  <h4>{bookItem.BookName}</h4>
                                  <p className="book-price">₹{bookItem.Price}</p>
                                  {matchedBook && (
                                    <p className="book-quantity">
                                      Quantity: {matchedBook.book_quantity}
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                    {orderItem.Order_Status === "Pending" && (
                      <button onClick={() => updateOrderStatus(orderItem._id, "Cancelled")}>
                        Cancel Order
                      </button>
                    )}

                    {orderItem.Order_Status === "Delivered" &&
                      orderItem.books.every(bookdata => {
                        const matchedBook = book.find(b => b._id === bookdata.book_id);
                        return matchedBook?.Isoldbook === false;
                      }) && (
                        <button onClick={() => handleReturnClick(orderItem._id)}>
                          Return Order
                        </button>
                      )}

                    {orderItem.Order_Status === "return-pending" && (
                      <p style={{ color: "orange" }}>
                        Your return request is accepted. Check your email for confirmation.
                      </p>
                    )}

                    {orderItem.Order_Status === "return-request" && (
                      <p style={{ color: "green" }}>
                        Your return book request was sent successfully.
                      </p>
                    )}

                    {orderItem.Order_Status === "return-rejected" && (
                      <p style={{ color: "green" }}>
                        Your return book request Rejected.
                      </p>
                    )}
                    
                    {orderItem.Order_Status === "Returned" && (
                    <p></p>
                    )}
                    <h2 style={{ color: "red" }}>{returnmessage}</h2>
                  </div>
                ))
            ) : (
              <div className="no-orders">
                <Package size={48} />
                <h2>No Orders Yet</h2>
                <p>Start shopping to see your orders here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};
