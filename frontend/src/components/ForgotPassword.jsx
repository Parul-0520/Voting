import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const ForgotPassword = ({ showNotification }) => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); 
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showNotification("OTP sent to your email!", "success");
      setStep(2);
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      showNotification("Password kam se kam 6 characters ka hona chahiye", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.REACT_APP_API}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      showNotification("Password reset ho gaya! Ab login karo.", "success");
      navigate("/login");
    } catch (error) {
      showNotification(error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Forgot Password</h2>

      {step === 1 ? (
        <form onSubmit={handleSendOtp}>
          <div className="form-group">
            <label>Admin Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="Kindly enter your email"
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Sending..." : "Send OTP"}
          </button>
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            <a href="/login" style={{ color: "#6c63ff", textDecoration: "underline" }}>
              Back to Login
            </a>
          </p>
        </form>
      ) : (
        <form onSubmit={handleResetPassword}>
          <p style={{ textAlign: "center", color: "#888", marginBottom: "1rem" }}>
            OTP sent successfully: <strong>{email}</strong>
          </p>
          <div className="form-group">
            <label>OTP:</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
              placeholder="Enter a 6-digit OTP"
              maxLength={6}
            />
          </div>
          <div className="form-group">
            <label>New Password:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              placeholder="Kindly enter your new password"
            />
          </div>
          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? "Resetting..." : "Reset Password"}
          </button>
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            <span
              onClick={() => setStep(1)}
              style={{ color: "#6c63ff", textDecoration: "underline", cursor: "pointer" }}
            >
              Change your email
            </span>
          </p>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;