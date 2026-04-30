import { useContext, useEffect, useState } from "react";
import { AuthContext } from "./context/AuthContext";
import socketIOClient from "socket.io-client";
import{
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Header from "./components/Header";
import HomePage from "./components/HomePage";
import LoginPage from "./components/LoginPage";
import Register from "./components/RegisterPage";
import AdminPanel from "./components/AdminPanel";
import LandingPage from "./components/LandingPage";
import ForgotPassword from "./components/ForgotPassword";

function App() {
  const { user, logout, login, setUser } = useContext(AuthContext);
  const [votes, setVotes] = useState([]);
  const [isLoading, setisLoading] = useState(true);
  const [error, seterror] = useState("");
  const [notification, setNotification] = useState({
    show: true,
    message: "",
    type: "info",
  });

  const fetchVotes = async () => {
  try {
    const adminId = localStorage.getItem("adminId") || 
                   (user?.role === "admin" ? user?._id : user?.adminId);
    
    if (!adminId) {
      setisLoading(false);
      return;
    }

    const response = await fetch(`${process.env.REACT_APP_API}/api/votes/${adminId}`);
    if (!response.ok) throw new Error("Failed to fetch votes");
    const data = await response.json();
    setVotes(data);
  } catch (error) {
    seterror(error?.message);
  } finally {
    setisLoading(false);
  }
};

  useEffect(() => {
    const socket = socketIOClient(process.env.REACT_APP_API, {
      transports: ["websocket"],
      withCredentials: true,
    });

    fetchVotes();

    

    socket.on("voteUpdated", (updatedVote) => {
      setVotes((prev) =>
        prev.map((v) => (v?._id === updatedVote?._id ? updatedVote : v))
      );
      showNotification("Vote updated!", "info");
    });

    socket.on("voteCreated", (newVote) => {
      setVotes((prev) => [...prev, newVote]);
      showNotification("New vote added!", "success");
    });

    socket.on("voteDeleted", (voteId) => {
      setVotes((prev) => prev.filter((item) => item._id !== voteId));
      setUser((prev) => {
    if (prev?.votedFor === voteId) {
      return { ...prev, votedFor: null };
    }
    return prev;
  });
      showNotification("Vote deleted successfully!", "success");
    });

   return () => {
    socket.off("voteUpdated");
    socket.off("voteCreated");
    socket.off("voteDeleted");
  };
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [setUser, user]);

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });

    setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 3000);
  };

  if (isLoading) return <div className="loading">Loading...</div>;

  return <Router>
    <div className="app-container">
      <Header
      user={user}
      logout={logout}
      showNotification={showNotification}
      />

      <main className="main-content">
        <Routes>
<Route path="/"
element={
  user?.role === "admin" && !localStorage.getItem("adminId") ? (
    <Navigate to="/admin"/>
  ) : user ? (
    <HomePage
      votes={votes}
      error={error}
      user={user}
      setUser={setUser}
      setVotes={setVotes}
      showNotification={showNotification}
    />
  ) : (
    <LandingPage/>
  )
}/>

<Route path="/login"
element={
  user?.role==="admin" && !localStorage.getItem("adminId") ? ( 
    <Navigate to="/admin"/> 
  ) : user? (
    <Navigate to="/"/>
  ) : ( <LoginPage
    showNotification={showNotification}
    login={login}
  />
  )
}/>

<Route path="/register"
element={
  user?( 
  <Navigate to="/"/> 
  ) : (
    <Register login={login} showNotification={showNotification}/>
  )
}/>

<Route
  path="/forgot-password"
  element={
    user ? (
      <Navigate to="/" />
    ) : (
      <ForgotPassword showNotification={showNotification} />
    )
  }
/>

{user?.role==="admin" &&(
  <Route path="/admin"
  element={
    <AdminPanel
    votes={votes}
    setVotes={setVotes}
    showNotification={showNotification}
    />
  }/>
)}
        </Routes>
      </main>
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )
      }
    </div>
  </Router>;
}

export default App;
