import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../pages-css/EditProfile.css"; // Import external CSS
import { useAlert } from "../Context/AlertContext";
import Cookies from "js-cookie";

export const EditProfile = () => {
  const token = Cookies.get("token");
  const location = useLocation();
  const userData = location.state?.user; // Get passed user data
  const navigate = useNavigate();

  const { showAlert } = useAlert();

  // Initialize form data with received user details
  const [formData, setFormData] = useState({
    name: userData ? `${userData.First_name}` : "",
    // email: userData ? userData.Email : "",
    mobile: userData ? userData.Phone_no || "" : "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userData?._id) {
      showAlert("User ID is missing. Cannot update.","error");
      return;
    }

    const [firstName, lastName] = formData.name.split(" "); // Split name into first and last

    try {
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/User`, {
        method: "PUT",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        }, credentials: "include",
        body: JSON.stringify({
          userId: userData._id, // Use correct ID from userData
          firstname: firstName || "", // Ensure non-empty values
          lastname: lastName || "",
          email: formData.email,
          mobile: formData.mobile,
        }),
      });

      //console.log("Response status:", response.status);

      const result = await response.json();
      //console.log("API Response:", result);

      if (response.ok) {
        showAlert("Profile updated successfully!","success");
        navigate("/Profile");
      } else {
        showAlert(result.error || "Failed to update user.","error");
      }
    } catch (error) {
      console.error("Error in try block:", error);
      showAlert("An error occurred.","error");
    }
  };

  return (
    <div className="edit-profile-container">
      <h2>Edit Profile</h2>
      <form onSubmit={handleSubmit} className="edit-profile-form">
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </label>
        {/* <label>
          Email:
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </label> */}
        <label>
          Mobile_no :
          <input
            type="text"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
          />
        </label>
        <button type="submit">Save Changes</button>
      </form>
    </div>
  );
};
