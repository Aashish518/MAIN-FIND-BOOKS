import React from 'react';
import Layout from '../components/Layout';
import '../pages-css/FAQsPage.css'; // Import the CSS file

const FAQsPage = () => {
    return (
        <Layout>
            <div className="faqs-page">
                <h1>FAQs</h1>
                <p>Here are some frequently asked questions:</p>
                <ul>
                    <li><strong>How do I place an order?</strong> You can place an order by selecting the books you want and proceeding to checkout.</li>
                    <li><strong>What payment methods do you accept?</strong> We accept all major Offline as well as Online payment using Razorpay Gateway</li>
                    <li><strong>How long does shipping take?</strong> Shipping typically takes 3-5 business days.</li>
                    <li><strong>Can I cancel my order?</strong> Yes, you can cancel your order within 24 hours of placing it.</li>
                </ul>
            </div>
        </Layout>
    );
};

export default FAQsPage; 