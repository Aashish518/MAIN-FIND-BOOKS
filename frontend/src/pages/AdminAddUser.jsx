import { useState } from "react";
import "../pages-css/AdminAddUser.css";
import { useNavigate } from "react-router-dom";
import { useAlert } from "../Context/AlertContext";
import Cookies from "js-cookie";

export const AdminAddUser = () => {
  const token = Cookies.get("token");
  const [user, setUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    role: "",
  });

  const [errors, setErrors] = useState({});
  const Navigate = useNavigate();
  const { showAlert } = useAlert();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" })); // clear error on change
  };

  const validateForm = () => {
    const newErrors = {};

    if (!user.firstName.trim()) newErrors.firstName = "First name is required.";
    if (!user.lastName.trim()) newErrors.lastName = "Last name is required.";
    if (!user.email.trim()) {
      newErrors.email = "Email is required.";
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      newErrors.email = "Email is invalid.";
    }

    if (!user.mobile.trim()) {
      newErrors.mobile = "Mobile number is required.";
    } else if (!/^\d{10}$/.test(user.mobile)) {
      newErrors.mobile = "Mobile number must be 10 digits.";
    }

    if (!user.password.trim()) {
      newErrors.password = "Password is required.";
    } else if (user.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
    }

    if (!user.role.trim()) newErrors.role = "Role is required.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    console.log("User Data Submitted:", user);

    try {
      const response = await fetch(`${import.meta.env.VITE_BACK_URL}/api/User`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(user),
      });

      const result = await response.json();

      if (response.ok) {
        showAlert("User added successfully!", "success");
        setUser({
          firstName: "",
          lastName: "",
          email: "",
          mobile: "",
          password: "",
          role: "",
        });
        Navigate("/Admin/ManageUsers");
      } else {
        showAlert(result.error || "Failed to add user.", "error");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      showAlert("An error occurred while adding the user.", "error");
    }
  };

  return (
    <div className="add-user-container">
      <h2 className="form-title">Add New User</h2>
      <form className="add-user-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>First_Name:</label>
          <input type="text" name="firstName" value={user.firstName} onChange={handleChange} /><br/>
          {errors.firstName && <p className="error-text">{errors.firstName}</p>}
        </div>

        <div className="form-group">
          <label>Last_Name:</label>
          <input type="text" name="lastName" value={user.lastName} onChange={handleChange}/><br/>
          {errors.lastName && <p className="error-text">{errors.lastName}</p>}
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input type="email" name="email" value={user.email} onChange={handleChange} /><br/>
          {errors.email && <p className="error-text">{errors.email}</p>}
        </div>

        <div className="form-group">
          <label>Mobile No :</label>
          <input type="tel" name="mobile" value={user.mobile} onChange={handleChange} /><br/>
          {errors.mobile && <p className="error-text">{errors.mobile}</p>}
        </div>

        <div className="form-group">
          <label>Password:</label>
          <input type="password" name="password" value={user.password} onChange={handleChange}/><br/>
          {errors.password && <p className="error-text">{errors.password}</p>}
        </div>

        <div className="form-group">
          <label>Role:</label>
          <select name="role" value={user.role} onChange={handleChange} ><br/>
            <option value="">Select Role</option>
            <option value="User">User</option>
            <option value="Admin">Admin</option>
            <option value="Deliveryperson">Deliveryperson</option>
          </select>
          {errors.role && <p className="error-text">{errors.role}</p>}
        </div>

        <button type="submit" className="submit-btn">Add User</button>
      </form>
    </div>
  );
};
