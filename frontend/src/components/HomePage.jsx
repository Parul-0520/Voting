import React from 'react'

const HomePage = ({
    votes,
            error,
            user,
            setUser,
            setVotes,
            showNotification,
}) => {

    const categories = [...new Set(votes?.map((v) => v.category))];

    const handleVote=async (voteId)=>{
        try{
        const response=await fetch(
            `${process.env.REACT_APP_API}/api/vote/${voteId}`,{
                method:"POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            }
        );
        if(!response.ok){
            const error=await response.json();
            throw new Error(error.error);
        }
        const data=await response.json();
        setVotes((prev)=>
        prev.map((v)=>(v?._d==data?.vote?._id?data?.vote:v))
    );

    setUser(data?.user);
} catch(error){
    showNotification(error.message, "error");

}
    };
    
    const boysVotes = votes?.filter((v) => v.option.includes("(M)"));
    const girlsVotes = votes?.filter((v) => v.option.includes("(F)"));

 return (
    <div className='votes-page'>
    {error && <div className='error-message'>{error}</div>}
    
    {categories?.map((cat) => (
      <div key={cat} className='category-section'>
        <h2>{cat}</h2>
        <div className='votes-grid'>
            {votes?.filter((v) => v.category === cat)?.map((vote, index)=>(
                <div className='vote-card' key={index}>
                    <h3>{vote.option}</h3>
                    <p className='vote-count'>Votes: {vote.votes}</p>
                    <p className='createdBy'>Created By: {vote.createdBy?.email}</p>
                    <button
                    className={`vote-btn ${!user || user?.votedFor?.includes(vote?._id?.toString()) ? "disabled" : ""}`}
                    onClick={()=> handleVote(vote?._id)}
                    >
                        {/* {vote?._id===user?.votedFor? "Voted" : "Vote"} */}
                        {user?.votedFor?.includes(vote?._id?.toString()) ? "Voted" : "Vote"}

                    </button>
                </div>
            ))}
        </div>
      </div>
    ))}
    </div>
  )
}

export default HomePage;
