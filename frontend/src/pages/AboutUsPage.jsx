import React from 'react';
import Layout from '../components/Layout';
import '../pages-css/AboutUsPage.css'; // Import the CSS file

const AboutUsPage = () => {
    return (
        <Layout>
            <div className="about-us-page">
                <h1>About Us</h1>
                <p>Welcome to FindBooks, your one-stop destination for buying and selling books! We are dedicated to providing a seamless experience for book lovers.</p>
                <p>Our mission is to connect readers with their favorite books, whether they are brand-new releases, second-hand textbooks, or rare finds.</p>
                <p>With a user-friendly interface and a vast collection of books, we make it easy for you to find and purchase the books you love.</p>
                <p>Thank you for choosing FindBooks!</p>
            </div>
        </Layout>
    );
};

export default AboutUsPage; 