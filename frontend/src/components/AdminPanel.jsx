import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const AdminPanel = ({votes, setVotes, showNotification}) => {
  const [newoption, setNewOption]=useState("");

  const [category, setCategory] = useState("");

  const [voters, setVoters] = useState({});

  const COLORS = ['#bc570a', '#ea15cd', '#0202C1', '#19b65d', '#01a2ff', '#628b09'];

  const [approvedEmail, setApprovedEmail] = useState("");
  const [approvedEmails, setApprovedEmails] = useState([]);
  const [commonPassword, setCommonPassword] = useState("");

  const fetchApprovedEmails = async () => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API}/api/approved-emails`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await response.json();
    setApprovedEmails(data.approvedEmails || []);
    setCommonPassword(data.commonPassword || "");
  } catch (error) {
    showNotification(error.message, "error");
  }
};

const handleAddEmail = async () => {
  if (!approvedEmail?.trim()) return;
  try {
    const response = await fetch(`${process.env.REACT_APP_API}/api/approved-emails`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ email: approvedEmail }),
    });
    if (!response.ok) throw new Error("Failed to add email");
    setApprovedEmails((prev) => [...prev, approvedEmail]);
    setApprovedEmail("");
    showNotification("Email approved successfully", "success");
  } catch (error) {
    showNotification(error.message, "error");
  }
};

const handleRemoveEmail = async (email) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_API}/api/approved-emails`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ email }),
    });
    if (!response.ok) throw new Error("Failed to remove email");
    setApprovedEmails((prev) => prev.filter((e) => e !== email));
    showNotification("Email removed successfully", "success");
  } catch (error) {
    showNotification(error.message, "error");
  }
};

const handleSetCommonPassword = async () => {
  if (!commonPassword?.trim()) return;
  try {
    const response = await fetch(`${process.env.REACT_APP_API}/api/common-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ commonPassword }),
    });
    if (!response.ok) throw new Error("Failed to set password");
    showNotification("Common password set successfully", "success");
  } catch (error) {
    showNotification(error.message, "error");
  }
};

  const handleAddOption=async()=>{
    if(!newoption?.trim()) return;

    try{
const response=await fetch(
            `${process.env.REACT_APP_API}/api/votes`,{
                method:"POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({option: newoption, category: category}),
            }
        );
        if(!response.ok) throw new Error("Failed to add option");

        const data=await response.json();

        setVotes([...votes, data]);
        setNewOption("");
        showNotification("Option added successfully", "success");
    } catch(error){
        showNotification(error.message, "error");
    }
  };
const handleDeleteOption=async(id)=>{
try{
  const response=await fetch(
            `${process.env.REACT_APP_API}/api/vote/${id}`,{
                method:"DELETE",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        if(!response.ok) throw new Error("Failed to delete an option");

        setVotes(votes?.filter((vote)=>vote._id!==id));
        showNotification("Option deleted successfully", "success");
} catch(error){
        showNotification(error.message, "error");
}
}
  

const fetchVoters = async (voteId) => {
  if (voters[voteId]) {
    setVoters((prev) => ({ ...prev, [voteId]: null }));
    return;
  }
  try {
    const response = await fetch(
      `${process.env.REACT_APP_API}/api/vote/${voteId}/voters`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );
    const data = await response.json();
    setVoters((prev) => ({ ...prev, [voteId]: data }));
  } catch (error) {
    showNotification(error.message, "error");
  }
};

useEffect(() => {
  fetchApprovedEmails();
// eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

 return (
    <div className='admin-panel'>
    <h2>Admin Panel</h2>
    <div className='add-option-form'>
      <input
      type='text'
      value={newoption}
      onChange={(e)=>setNewOption(e.target.value)}
      placeholder='New voting option'
      />
      <input
  type='text'
  value={category}
  onChange={(e) => setCategory(e.target.value)}
  placeholder='Category (e.g. Boys, Girls)'
/>
      <button onClick={handleAddOption}>Add Option</button>
    </div>

    <div style={{display: 'flex', gap: '2rem', alignItems: 'flex-start'}}>

    <div className='current-options' style={{flex: 1}}>
  <h3>Current Options</h3>
  {[...new Set(votes.map((v) => v.category))].map((cat) => (
    <div key={cat}>
      <h4>{cat}</h4>
      {votes.filter((v) => v.category === cat).map((vote, index) => (
  <div key={index}>
    <div className='option-item'>
      <span>{vote.option}</span>
      <span>Votes: {vote.votes}</span>
      <button className="voters-btn" onClick={() => fetchVoters(vote._id)}>
        {voters[vote._id] ? "Hide Voters" : "Show Voters"}
      </button>
      <button className="delete-btn" onClick={()=> handleDeleteOption(vote._id)}>Delete</button>
    </div>
    {voters[vote._id] && (
      <div className="voters-list">
        {voters[vote._id].length === 0 ? (
          <span>No voters yet</span>
        ) : (
          voters[vote._id].map((voter, i) => (
            <span key={i} className="voter-chip">{voter.username || voter.email}</span>
          ))
      )}
    </div>
    )}
      </div>
  ))}
    </div>
  ))}
    </div>

    <div className='current-options' style={{flex: 1}}>
      <h3>Results</h3>
      {[...new Set(votes.map((v) => v.category))].map((cat) => (
        <div key={cat}>
          <h4>{cat}</h4>
          <PieChart width={300} height={250}>
            <Pie
              data={votes.filter((v) => v.category === cat).map((v) => ({
                name: v.option,
                value: v.votes || 0
              }))}
              cx={150}
              cy={110}
              outerRadius={80}
              dataKey="value"
            >
              {votes.filter((v) => v.category === cat).map((_, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      ))}
    </div>

    </div> 

    <div className='current-options' style={{marginTop: '2rem'}}>
  <h3>Voter Access Control</h3>
  
  <h4>Common Password for Voters</h4>
  <div className='add-option-form'>
    <input
      type='text'
      value={commonPassword}
      onChange={(e) => setCommonPassword(e.target.value)}
      placeholder='Set common password for voters'
    />
    <button onClick={handleSetCommonPassword}>Set Password</button>
  </div>

  <h4 style={{marginTop: '1rem'}}>Approved Emails</h4>
  <div className='add-option-form'>
    <input
      type='email'
      value={approvedEmail}
      onChange={(e) => setApprovedEmail(e.target.value)}
      placeholder='Enter email to approve'
    />
    <button onClick={handleAddEmail}>Add An Email</button>
  </div>

  <div style={{marginTop: '1rem'}}>
    {approvedEmails.length === 0 ? (
      <span>No approved emails yet</span>
    ) : (
      approvedEmails.map((email, i) => (
        <div className='option-item' key={i}>
          <span>{email}</span>
          <button className='delete-btn' onClick={() => handleRemoveEmail(email)}>Remove</button>
        </div>
      ))
    )}
  </div>
</div>  
    </div>
  )
}

export default AdminPanel;