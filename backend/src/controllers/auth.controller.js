import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { generateTokenAndSendCookie } from "../lib/generateTokenAndSendCookie.js";
import { sendWelcomeEmail } from "../emails/emailHandler.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;
    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email" });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    //name, username이 모두 중복인 경우 에러 반환
    const existingUser = await User.findOne({ $or: [{ name }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    //salt 생성 후 비밀번호 해싱
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await newUser.save();
    const token = generateTokenAndSendCookie(newUser._id, res);
    res.status(201).json({
      token,
      _id: newUser._id,
      name: newUser.name,
      email: newUser.email,
      username: newUser.username,
    });

    // send email by mailtrap, if it fails, it will not return error
    const profileUrl = `${process.env.CLIENT_URL}/profile/${newUser.username}`;
    try {
      await sendWelcomeEmail(newUser.email, newUser.name, profileUrl);
    } catch (emailError) {
      console.log("Error sending welcome email", emailError);
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const token = generateTokenAndSendCookie(user._id, res);

    res.status(200).json({
      token,
      _id: user._id,
      name: user.name,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const logout = async (req, res) => {
  try {
    res.clearCookie("jwt-linkedin", {
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
      sameSite: "strict",
    });

    res.status(200).json({ message: "Logout successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getMe = async (req, res) => {
  try {
    let token = req.cookies["jwt-linkedin"];
    if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }
    if (!token) {
      return res.status(200).json(null);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded) {
      return res.status(200).json(null);
    }

    const user = await User.findById(decoded.userId).select("-password");
    if (!user) {
      return res.status(200).json(null);
    }

    res.status(200).json(user);
  } catch (error) {
    // JWT 토큰이 만료되었거나 변조된 경우 에러 처리
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      return res.status(200).json(null);
    }
    console.log("Error in getMe controller: ", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
