import React, { useState } from 'react';
import { Navbar } from '../components/Navbar';
import { Download, FileText, Calendar, RefreshCw, TrendingUp, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import '../pages-css/Admin.css';
import { useAlert } from '../Context/AlertContext';
import Cookies from "js-cookie";

const Admin = () => {
    const token = Cookies.get("token");
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    const { showAlert }  = useAlert();

    const generateReport = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/report/generate`, {
                method: 'POST',
                headers: {
                    authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    startDate: dateRange.startDate,
                    endDate: dateRange.endDate,
                    interval: '6months'
                })
            }); 

            const data = await response.json();
            if (data.success) {
                setReport(data.data);
            } else {
                showAlert('Failed to generate report',"error");
            }
        } catch (error) {
            console.error('Error generating report:', error);
            showAlert('Error generating report',"error");
        } finally {
            setLoading(false);
        }
    };

    const downloadPDF = () => {
        if (!report) return;

        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(20);
        doc.text('Sales Report', 14, 15);
        doc.setFontSize(12);
        doc.text(`Period: ${new Date(report.period.start).toLocaleDateString()} - ${new Date(report.period.end).toLocaleDateString()}`, 14, 25);

        // Summary section
        doc.setFontSize(16);
        doc.text('Summary', 14, 35);
        doc.setFontSize(12);
        const summaryData = [
            ['Total Orders', report.summary.totalOrders],
            ['Total Revenue', `₹${report.summary.totalRevenue}`],
            ['Average Order Value', `₹${report.summary.averageOrderValue}`],
            ['Total Books Sold', report.summary.totalBooksSold],
            ['Unique Customers', report.summary.uniqueCustomers]
        ];
        doc.autoTable({
            startY: 40,
            head: [['Metric', 'Value']],
            body: summaryData,
            theme: 'grid'
        });

        // Payment Methods
        doc.setFontSize(16);
        doc.text('Payment Methods', 14, doc.lastAutoTable.finalY + 10);
        doc.setFontSize(12);
        const paymentData = [
            ['Online Payments', report.summary.paymentMethods.online],
            ['Cash on Delivery', report.summary.paymentMethods.cod]
        ];
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            head: [['Method', 'Count']],
            body: paymentData,
            theme: 'grid'
        });

        // Order Status
        doc.setFontSize(16);
        doc.text('Order Status', 14, doc.lastAutoTable.finalY + 10);
        doc.setFontSize(12);
        const statusData = Object.entries(report.summary.orderStatus).map(([status, count]) => [status, count]);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            head: [['Status', 'Count']],
            body: statusData,
            theme: 'grid'
        });

        // Top Books
        doc.setFontSize(16);
        doc.text('Top Selling Books', 14, doc.lastAutoTable.finalY + 10);
        doc.setFontSize(12);
        const bookData = report.topBooks.map(book => [
            book.name,
            book.author,
            book.sales,
            `₹${book.revenue}`
        ]);
        doc.autoTable({
            startY: doc.lastAutoTable.finalY + 15,
            head: [['Book Name', 'Author', 'Sales', 'Revenue']],
            body: bookData,
            theme: 'grid'
        });

        // Save the PDF
        doc.save('sales-report.pdf');
    };

    return (
        <div className="admin-container">
            <Navbar />
            <div className="admin-content">
                <div className="admin-header">
                    <h1>Admin Dashboard</h1>
                    <div className="report-controls">
                        <div className="date-range">
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                            />
                            <span>to</span>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                            />
                        </div>
                        <button 
                            className="generate-btn"
                            onClick={generateReport}
                            disabled={loading || !dateRange.startDate || !dateRange.endDate}
                        >
                            {loading ? <RefreshCw className="spin" /> : <FileText />}
                            Generate Report
                        </button>
                    </div>
                </div>

                {report && (
                    <div className="report-section">
                        <div className="report-header">
                            <h2>Sales Report</h2>
                            <button className="download-btn" onClick={downloadPDF}>
                                <Download /> Download PDF
                            </button>
                        </div>

                        <div className="summary-cards">
                            <div className="summary-card">
                                <DollarSign className="icon" />
                                <div className="card-content">
                                    <h3>Total Revenue</h3>
                                    <p>₹{report.summary.totalRevenue}</p>
                                </div>
                            </div>
                            <div className="summary-card">
                                <ShoppingCart className="icon" />
                                <div className="card-content">
                                    <h3>Total Orders</h3>
                                    <p>{report.summary.totalOrders}</p>
                                </div>
                            </div>
                            <div className="summary-card">
                                <TrendingUp className="icon" />
                                <div className="card-content">
                                    <h3>Average Order Value</h3>
                                    <p>₹{report.summary.averageOrderValue}</p>
                                </div>
                            </div>
                            <div className="summary-card">
                                <Users className="icon" />
                                <div className="card-content">
                                    <h3>Unique Customers</h3>
                                    <p>{report.summary.uniqueCustomers}</p>
                                </div>
                            </div>
                        </div>

                        <div className="report-grid">
                            <div className="report-card">
                                <h3>Payment Methods</h3>
                                <div className="payment-methods">
                                    <div className="method">
                                        <span>Online Payments</span>
                                        <span>{report.summary.paymentMethods.online}</span>
                                    </div>
                                    <div className="method">
                                        <span>Cash on Delivery</span>
                                        <span>{report.summary.paymentMethods.cod}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="report-card">
                                <h3>Order Status</h3>
                                <div className="order-status">
                                    {Object.entries(report.summary.orderStatus).map(([status, count]) => (
                                        <div key={status} className="status-item">
                                            <span className="status-label">{status}</span>
                                            <span className="status-count">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="report-card full-width">
                                <h3>Top Selling Books</h3>
                                <div className="top-books">
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Book Name</th>
                                                <th>Author</th>
                                                <th>Sales</th>
                                                <th>Revenue</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {report.topBooks.map((book, index) => (
                                                <tr key={index}>
                                                    <td>{book.name}</td>
                                                    <td>{book.author}</td>
                                                    <td>{book.sales}</td>
                                                    <td>₹{book.revenue}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Admin; 