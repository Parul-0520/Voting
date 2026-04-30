import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const LoginPage = ({ login, showNotification }) => {
    const navigate=useNavigate();
    const [isVoter, setIsVoter] = useState(false);
    const [formData, setFormData]=useState({
        email: "",
        password: "",
        adminEmail: "",
    });

    const handleChange=(event)=>{
      const {name, value}=event.target;
      setFormData({...formData, [name]: value});
    };
    const handleSubmit=async(event)=>{
      event.preventDefault();
      try{
        const url = isVoter
          ? `${process.env.REACT_APP_API}/api/voter-login`
          : `${process.env.REACT_APP_API}/api/login`;

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error("Log-in Failed");

        const { token, user, adminId } = await response.json();
        login(token, user, adminId);
        showNotification("Logged in successfully", "success");
        navigate("/");
      } catch(error) {
        showNotification(error.message, "error");
      }
    };

  return (
    <div className='login-container'>
        <h2>{isVoter ? "Voter Login" : "Login"}</h2>

        <div style={{display: 'flex', gap: '1rem', marginBottom: '1.5rem', justifyContent: 'center'}}>
          <button
            className={`submit-btn ${!isVoter ? '' : 'disabled'}`}
            style={{width: 'auto', padding: '0.5rem 1.5rem', marginTop: 0}}
            onClick={() => setIsVoter(false)}
            type="button"
          >Admin</button>
          <button
            className={`submit-btn ${isVoter ? '' : 'disabled'}`}
            style={{width: 'auto', padding: '0.5rem 1.5rem', marginTop: 0}}
            onClick={() => setIsVoter(true)}
            type="button"
          >Voter</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>Email:</label>
            <input
            type='email'
            name='email'
            value={formData.email}
            onChange={handleChange}
            required
            />
          </div>

          {isVoter && (
            <div className='form-group'>
              <label>Admin's Email:</label>
              <input
              type='email'
              name='adminEmail'
              value={formData.adminEmail}
              onChange={handleChange}
              required
              />
            </div>
          )}

          <div className='form-group'>
            <label>Password:</label>
            <input
            type='password'
            name='password'
            value={formData.password}
            onChange={handleChange}
            required
            />
          </div>
          <button type='submit' className='submit-btn'>
            {isVoter ? "Login as Voter" : "Login"}
          </button>

          {!isVoter && (
            <p style={{ textAlign: "center", marginTop: "1rem" }}>
              <a href="/forgot-password" style={{ color: "#6c63ff", textDecoration: "underline", cursor: "pointer" }}>
                Forgot Password?
              </a>
            </p>
          )}
        </form>
    </div>
  );
};

export default LoginPage;
