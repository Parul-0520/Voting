const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDatabase = require("./config/connection");
const {
  register,
  login,
  userDetails,
} = require("./controllers/user.controller");
const authenticate = require("./middlewares/auth");
const Vote = require("./models/vote.model");
const isAdmin = require("./middlewares/adminAuth");
const User = require("./models/user.model");

const app = express();
const server = http.createServer(app);



dotenv.config();

// enhanced socketIo.io setup
const io = socketIo(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
connectDatabase();

// middlewares
app.use(cors());
app.use(express.json());

// apis;

app.post("/api/register", register);
app.post("/api/login", login);
app.get("/api/me", authenticate, userDetails);

// post vote
app.post("/api/votes", authenticate, isAdmin, async (req, res) => {
  try {
    const { option, category } = req.body;
const vote = await Vote.create({
  option,
  category: category || "General",
  createdBy: req.user?._id,
});

    io.emit("voteCreated", vote);
    res.status(201).json(vote);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// get votes
app.get("/api/votes", async (req, res) => {
  try {
    const votes = await Vote.find().populate("createdBy", "email username");

    res.status(201).json(votes);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// check vote
app.post("/api/vote/:id", authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const voteToCheck = await Vote.findById(id);
    
    const alreadyVotedInCategory = await Vote.find({ 
      category: voteToCheck.category,
      _id: { $in: req.user.votedFor }
    });

    if (alreadyVotedInCategory.length > 0) {
      return res.status(400).json({ error: "You have already voted in this category" });
    }

    const vote = await Vote.findByIdAndUpdate(
      id,
      { $inc: { votes: 1 } },
      { new: true }
    );

    const user = await User.findByIdAndUpdate(
      req.user?._id,
      { $push: { votedFor: id } },
      { new: true }
    );

    io.emit("voteUpdated", vote);
    res.status(201).json({ vote, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// delete vote
app.delete("/api/vote/:id", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    await Vote.findByIdAndDelete(id);
    await User.updateMany({ votedFor: id }, { $unset: { votedFor: "" } });
    io.emit("voteDeleted", id);

    res
      .status(201)
      .json({ message: "Vote deleted successfully", success: true });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
// socket io events
io.on("connection", (socket) => {
  console.log("New client connected");

  socket.on("disconnect", () => {
    console.log("client disconnected");
  });
});

// get voters for a vote
app.get("/api/vote/:id/voters", authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const voters = await User.find(
      { votedFor: id },
      "username email"
    );
    res.status(200).json(voters);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});


// Temporary route - baad mein hata dena
// Temporary route
app.get("/api/fix-users", async (req, res) => {
  await User.updateMany({}, { $unset: { votedFor: "" } });
  res.json({ message: "Fixed!" });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`server running at port ${PORT}`);
});