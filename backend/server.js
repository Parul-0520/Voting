const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
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
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const crypto = require("crypto");



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

// admin apni approved emails manage kare
app.get("/api/approved-emails", authenticate, isAdmin, async (req, res) => {
  try {
    const admin = await User.findById(req.user._id);
    res.status(200).json({ approvedEmails: admin.approvedEmails, commonPassword: admin.commonPassword });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.post("/api/approved-emails", authenticate, isAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { approvedEmails: email } },
    );
    res.status(200).json({ message: "Email approved successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.delete("/api/approved-emails", authenticate, isAdmin, async (req, res) => {
  try {
    const { email } = req.body;
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { approvedEmails: email } },
    );
    res.status(200).json({ message: "Email removed successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// admin common password set kare voters ke liye
app.post("/api/common-password", authenticate, isAdmin, async (req, res) => {
  try {
    const { commonPassword } = req.body;
    await User.findByIdAndUpdate(
      req.user._id,
      { commonPassword }
    );
    res.status(200).json({ message: "Common password set successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// voter login - email + common password se
app.post("/api/voter-login", async (req, res) => {
  try {
    const { email, adminEmail } = req.body;
    const { password } = req.body;

    // admin dhundho jisne yeh email approve ki hai
    const admin = await User.findOne({ 
      email: adminEmail,
      approvedEmails: email 
    });

    if (!admin) {
      return res.status(400).json({ error: "You are not approved by this admin" });
    }

    if (admin.commonPassword !== password) {
      return res.status(400).json({ error: "Wrong password" });
    }

    let voter = await User.findOne({ email, adminId: admin._id });
    
    if (!voter) {
  const existingUser = await User.findOne({ email });
  
  if (existingUser) {
    const token = jwt.sign({ id: existingUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });
    return res.status(200).json({ token, user: existingUser, adminId: admin._id });
  }

  voter = await User.create({
    email,
    username: email.split("@")[0],
    password: password,
    role: "user",
    adminId: admin._id,
  });
}

    const token = jwt.sign({ id: voter._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.status(200).json({ token, user: voter, adminId: admin._id });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// votes sirf us admin ke dikhao
app.get("/api/votes/:adminId", async (req, res) => {
  try {
    const { adminId } = req.params;
    const votes = await Vote.find({ createdBy: adminId }).populate("createdBy", "email username");
    res.status(200).json(votes);
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

// ─── Forgot Password ───────────────────────────────────────────
app.post("/api/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(404).json({ error: "Admin account not found with this email" });
    }

    // 6-digit OTP generate karo
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min

    admin.otp = otp;
    admin.otpExpiry = otpExpiry;
    await admin.save();

    // Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS, // Gmail App Password
      },
    });

    await transporter.sendMail({
      from: `"VoteApp" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Password Reset OTP",
      html: `
        <h2>Password Reset Request</h2>
        <p>Your OTP is: <strong style="font-size:24px">${otp}</strong></p>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>Agar aapne yeh request nahi ki toh ignore karein.</p>
      `,
    });

    res.status(200).json({ message: "OTP sent to your email" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ─── Reset Password ────────────────────────────────────────────
app.post("/api/reset-password", async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin) {
      return res.status(404).json({ error: "Admin not found" });
    }

    if (admin.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    if (!admin.otpExpiry || admin.otpExpiry < new Date()) {
      return res.status(400).json({ error: "OTP expired. Please request a new one" });
    }

    // Password update — pre-save hook bcrypt kar dega
    admin.password = newPassword;
    admin.otp = null;
    admin.otpExpiry = null;
    await admin.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`server running at port ${PORT}`);
});