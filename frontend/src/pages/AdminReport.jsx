import React, { useState } from "react";
import "../pages-css/AdminReport.css";
import {exportToCSV} from "../utils/exportToCSV"

export const AdminReport = () => {
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    category: "",
    condition: "",
  });

  const [reportData, setReportData] = useState([]);

  // Sample function to fetch report data (replace with API call)
  const generateReport = () => {
    const sampleData = [
      { id: 1, title: "Book A", category: "Fiction", condition: "New", sales: 120 },
      { id: 2, title: "Book B", category: "Science", condition: "Resell", sales: 85 },
    ];
    setReportData(sampleData);
  };

  return (
    <div className="admin-report">
      <h2>Generate Sales Report</h2>

      <div className="filters">
        <label>Start Date:</label>
        <input
          type="date"
          value={filters.startDate}
          onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
        />

        <label>End Date:</label>
        <input
          type="date"
          value={filters.endDate}
          onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
        />

        <label>Category:</label>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
        >
          <option value="">All</option>
          <option value="Fiction">Fiction</option>
          <option value="Science">Science</option>
          <option value="History">History</option>
        </select>

        <label>Condition:</label>
        <select
          value={filters.condition}
          onChange={(e) => setFilters({ ...filters, condition: e.target.value })}
        >
          <option value="">All</option>
          <option value="New">New</option>
          <option value="Resell">Resell</option>
        </select>

        <button onClick={generateReport}>Generate Report</button>
      </div>

      <div className="report-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Condition</th>
              <th>Sales</th>
            </tr>
          </thead>
          <tbody>
            {reportData.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td>{item.title}</td>
                <td>{item.category}</td>
                <td>{item.condition}</td>
                <td>{item.sales}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {reportData.length > 0 && (
        <button className="download-btn" onClick={() => exportToCSV(reportData)}>
          Download CSV
        </button>
      )}
    </div>
  );
};

