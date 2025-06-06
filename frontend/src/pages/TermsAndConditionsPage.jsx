import React from 'react';
import Layout from '../components/Layout';
import '../pages-css/TermsAndConditionsPage.css'; // Import the CSS file

const TermsAndConditionsPage = () => {
    return (
        <Layout>
            <div className="terms-and-conditions-page">
                <h1>Terms and Conditions</h1>
                <p>By using our service, you agree to the following terms:</p>
                <ul>
                    <li>You are responsible for maintaining the confidentiality of your account.</li>
                    <li>You agree to provide accurate and complete information.</li>
                    <li>seller need to pay 10% of books price to us as a platform charge</li>
                    <li>We reserve the right to terminate your account if you violate these terms.</li>
                    <li>if a resell book not purchased in 30 days after adding in website than book automatically removed from 
                        the website , you also re-add it , in this 30 days period if you sell your book outside than you need to 
                        pay 10% of the book price to us , if anyone can buy your book</li>
                </ul>
            </div>
        </Layout>
    );
};

export default TermsAndConditionsPage; 