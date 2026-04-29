import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const AdminPanel = ({votes, setVotes, showNotification}) => {
  const [newoption, setNewOption]=useState("");

  const [category, setCategory] = useState("");

  const [voters, setVoters] = useState({});

  const COLORS = ['#bc570a', '#ea15cd', '#0202C1', '#19b65d', '#01a2ff', '#628b09'];

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

    {/* ← Sirf yahan flex wrapper add kiya */}
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

    {/* ← Sirf yahan chart add kiya */}
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

    </div> {/* flex wrapper band */}
    </div>
  )
}

export default AdminPanel;