import React from 'react';
import Layout from '../components/Layout';
import '../pages-css/PrivacyPolicyPage.css'; // Import the CSS file

const PrivacyPolicyPage = () => {
    return (
        <Layout>
            <div className="privacy-policy-page">
                <h1>Privacy Policy</h1>
                <p>Your privacy is important to us. Here is how we handle your data:</p>
                <ul>
                    <li>We collect information that you provide directly to us.</li>
                    <li>We use this information to process your orders and improve our services.</li>
                    <li>We do not share your personal information with third parties.</li>
                    <li>You can opt-out of receiving marketing communications from us.</li>
                </ul>
            </div>
        </Layout>
    );
};

export default PrivacyPolicyPage; 