import React, { useState } from 'react';
import { Link } from "react-router-dom";
import "../pages-css/AboutUs.css";// External CSS file

const AboutUs = () => {
  return (
    <div className="about-us-container">
      <footer className="about-us-footer">
        <div className="about-us-header">
          <h1>FINDBOOKS</h1>
        </div>

        <div className="about-us-sections">
          <div className="about-us-section">
            <h2>Why People Like Us!</h2>
            <p>
              Welcome to FindBooks, your one-stop destination for buying and selling books! whether you're looking for
              brand-new releases, second-hand textbooks, or rare finds, we make it easy for book lovers to connect and
              exchange knowledge.
            </p>
            {/* <button className="read-more-btn">Read More</button> */}
          </div>

          <div className="about-us-section shop">
            <h2>Shop Info</h2>
            <ul>
              <li><Link to="/aboutus">About Us</Link></li>
              <li><Link to="/contactus">Contact Us</Link></li>
              <li><Link to="/privacypolicy">Privacy Policy</Link></li>
              <li><Link to="/termsandconditions">Terms & Condition</Link></li>
              <li><Link to="/returnpolicy">Return Policy</Link></li>
              <li><Link to="/faqs">FAQs & Help</Link></li>
            </ul>
          </div>

          <div className="about-us-section shop">
            <h2>Account</h2>
            <ul>
              <li><Link to="/profile">My Account</Link></li>
              <li><Link to="/cart">Shopping Cart</Link></li>
              <li><Link to="/Orders">Order History</Link></li>
              <li><Link to="/Sellorders">Selling Order History</Link></li>
            </ul>
          </div>

          <div className="about-us-section">
            <h2>Contact</h2>
            <ul>
              <li>Address: Shahpur,Ahmedabad</li>
              <li>Email: findbooksonlinewebsite@gmail.com</li>
              <li>Mobile: 7046691783</li>
              <li>Payment Accepted</li>
            </ul>
          </div>
        </div>

        <div className="about-us-footer-bottom">
          <p>
            © <strong>FindBooks</strong>, All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AboutUs;

