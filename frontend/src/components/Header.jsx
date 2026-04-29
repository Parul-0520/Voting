import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = ({user, logout, showNotification}) => {
    const navigate=useNavigate();
    const [darkMode, setDarkMode] = useState(false);

    const handleLogout=()=>{
        logout();
        showNotification("Logout successfully", "success");
        navigate("/");
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
        document.documentElement.setAttribute(
            'data-theme', 
            !darkMode ? 'dark' : 'light'
        );
    };

  return (
    <header className='app-header'>
        <h1 className='logo'>
            <Link to="/">Real-Time Voting System</Link>
        </h1>

        <div className='auth-info'>
        <button className='dark-mode-btn' onClick={toggleDarkMode}>
                {darkMode ? '☀️' : '🌙'}
            </button>
            {user?._id ? (
                <>
                    <span className='user-email'>
                        <span className='welcome'>Welcome, </span>
                        {user?.username}
                    </span>
                    {user?.role==="admin" && (
                        <Link to="/admin" className='auth-link admin-link'>
                            Admin
                        </Link>
                    )} 

                    <button className='logout-btn' onClick={handleLogout}>Logout</button>
                </>
            ) : <>
                <Link to="login" className='auth-link'>
                    Login
                </Link>
                <Link to ="register" className='auth-link'>
                    Register
                </Link>
            </>}
        </div>
    </header>
  )
}

export default Header
