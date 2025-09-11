import User from "../models/user.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Verification from "../models/verification.js";
import { sendEmail } from "../libs/send-email.js";
import aj from "../libs/arcjet.js";
import { isSpoofedBot } from "@arcjet/inspect";

const registerUser = async (req, res) => {
  console.log("Hello I am working in Register USER....!!!");

  try {
    const { email, name, password } = req.body;

    const decision = await aj.protect(req, { email }); // Deduct the condition from email
    console.log("Arcjet decision", decision.isDenied());

    if (decision.isDenied()) {
      // res.writeHead(403, { "Content-Type": "application/json" });
      // res.end(JSON.stringify({ message: "Invalid email address" }));
      return res.status(403).json({ message: "Invalid email address" });
    };

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({ message: "Email address already in use." });
    }

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = await User.create({
      email,
      password: hashPassword,
      name,
    });

    // TODO: send email.
    const verificationToken = jwt.sign(
      { userId: newUser._id, purpose: "email-verification" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    await Verification.create({
      userId: newUser._id,
      token: verificationToken,
      expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
    });

    // Send email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
    const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;
    const emailSubject = "Verify your email";

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    if (!isEmailSent) {
      return res.status(500).json({
        message: "Failed to send verification email",
      });
    }

    return res.status(201).json({
      message:
        "Verification email is sent to your email. Please check and verify your account.",
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      message: "Internal server error.",
    });
  }
};


const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Sign In is working" + email);

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    };

    if (!user.isEmailVerified) {
      const existingVerification = await Verification.findOne({
        userId: user._id,
      });
      if (existingVerification && existingVerification.expiresAt > new Date()) {
        return res.status(400).json({
          message: "Email not verified. Please check your email for the verification link."
        });
      } else {
        await Verification.findByIdAndDelete({ _id: existingVerification._id });
        
        const verificationToken = jwt.sign(
          { userId: user._id, purpose: "email-verification" },
          process.env.JWT_SECRET,
          { expiresAt: "1h" }
        );

        await Verification.create({
          userId: user._id,
          token: verificationToken,
          expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000),
        });

        // const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        // Send email
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;
        const emailBody = `<p>Click <a href="${verificationLink}">here</a> to verify your email</p>`;
        const emailSubject = "Verify your email";

        const isEmailSent = await sendEmail(email, emailSubject, emailBody);

        if (!isEmailSent) {
          return res.status(500).json({
            message: "Failed to send verification email",
          });
        }

        return res.status(201).json({
          message:
            "Verification email is sent to your email. Please check and verify your account.",
        });
      }
    };

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid email or password"});
    };

    const token = jwt.sign(
      { userId: user._id, purpose: "login" },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    user.lastLogin = new Date();
    await user.save();

    const userData = user.toObject();
    delete userData.password;

    res.status(200).json({
      message: "Login successful",
      token,
      user: userData,
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error.",
    });
  }
};


const verifyEmail = async (req, res) => {
  console.log("Verify email is triggered.");

  try {
    const { token } = req.body;
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload) {
      return res.status(401).json({ message: "Unauthorized..!!" });
    };

    const { userId, purpose } = payload;

    if (purpose !== "email-verification") {
      return res.status(401).json({message: "Unauthorized"});
    };

    const verification = await Verification.findOne({
      userId,
      token,
    });

    if (!verification) {
      return res.status(401).json({ message: "Unauthorized"})
    };

    const isTokenExpired = verification.expiresAt < new Date();

    if (isTokenExpired) {
      return res.status(401).json({message: "Token expired"});
    };

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    };

    if (user.isEmailVerified) {
      return res.status(400).json({message: "Email already verified"});
    };

    user.isEmailVerified = true;
    await user.save();

    await Verification.findByIdAndDelete(verification._id);

    res.status(200).json({ message: "Email verified successfully."});
    
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error."
    });
    
  }
};


const resetPasswordRequest = async (req, res) => {
  console.log("Forget Password function is working");

  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "user not found" });
    };

    if (!user.isEmailVerified) {
      return res.status(400).json({ message: "Please verify your email"});
    };

    const existingVerification = await Verification.findOne({ userId: user._id });

    if (existingVerification && existingVerification.expiresAt > new Date()) {
      return res.status(400).json({ message: "Reset password request already send." });
    };

    if (existingVerification && existingVerification.expiresAt < new Date()) {
      await Verification.findByIdAndDelete(existingVerification._id);
    };

    const resetPasswordToken = jwt.sign(
      { userId: user._id, purpose: "reset-password" },
      process.env.JWT_SECRET,
      { expiresIn: "15m"},
    );

    await Verification.create({
      userId: user._id,
      token: resetPasswordToken,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000)
    });

    // Send email
    const resetPasswordLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetPasswordToken}`;
    const emailBody = `<p>Click <a href="${resetPasswordLink}">here</a> to reset your password</p>`;
    const emailSubject = "Reset your password";

    const isEmailSent = await sendEmail(email, emailSubject, emailBody);

    if (!isEmailSent) {
      return res.status(500).json({
        message: "Failed to send reset password email",
      });
    };

    return res.status(201).json({
      message:
        "Reset password email send.",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error.",
    });
  }
};


const verifyResetPasswordTokenAndResetPassword = async (req, res) => { 
  console.log("Verify reset password token and reset password is working fine....!");

  try {

    const { token, newPassword, confirmPassword } = req.body;

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    if (!payload) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    };

    const { userId, purpose } = payload;

    if (purpose !== "reset-password") {
      return res.status(401).json({
        message: "Unauthorized"
      });
    };

    const verification = await Verification.findOne({
      userId,
      token,
    });

    if (!verification) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    };

    const isTokenExpired = verification.expiresAt < new Date();

    if (isTokenExpired) {
      return res.status(401).json({
        message: "Token expired"
      });
    };

    const user = await User.findById(userId);

    if (!user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    };

    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        message: "Password do not match"
      });
    };

    const salt = await bcrypt.genSalt(10);

    const hashPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashPassword;

    await user.save();

    await Verification.findByIdAndDelete(verification._id);

    res.status(201).json({
      message: "Password reset successful",
    });
    
  } catch (error) {
    console.log(error);

    res.status(500).json({
      message: "Internal server error"
    });
    
  }
  
};


export {
  registerUser,
  loginUser,
  verifyEmail,
  resetPasswordRequest,
  verifyResetPasswordTokenAndResetPassword,
};