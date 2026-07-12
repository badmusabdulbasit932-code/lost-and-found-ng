const User = require("../../models/user.model");
const {customAlphabet} = require("nanoid");
const sendMail = require("../../services/email.service");
const bcrypt = require("bcryptjs");

module.exports = (req, res) => {
  const { name,email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email, and password are required." });
  } else if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ message: "Invalid email format." });
  }

  User.findOne ({email})
    .then(existingUser => {
      // Only block if the account is already verified.
      // Unverified accounts (e.g. user never entered the code, or
      // the email never arrived) are allowed to sign up again —
      // we just refresh their details and issue a fresh code below.
      if (existingUser && existingUser.verified) {
        return res.status(400).json({ message: "User account already exists." });
      }

      const nanoid = customAlphabet("01234567890987654321", 6);
      const userVerificationCode = nanoid();

      const finishSignup = (userPromise) => {
        userPromise
          .then(newUser => {
            //send verification email to the user
            sendMail({
                recipient: newUser.email,
                subject: "Verify your email address",
                message: `<p>Hello ${newUser.name},</p><p>Please click the link below to verify your email address:</p><h2> ${userVerificationCode}<h2><p>if you did not request this, please ignore this email.</p>`
            });
            res.status(201).json({ message: "User account created successfully.", user: newUser });
          })
          .catch(err => {
              console.error("Error creating user account:", err);
              res.status(500).json({ message: "Internal server error." });
          });
      };

      if (existingUser) {
        // Unverified account exists — refresh it instead of erroring out
        existingUser.name = name;
        existingUser.password = bcrypt.hashSync(password, 10);
        existingUser.verificationCode = userVerificationCode;
        finishSignup(existingUser.save());
      } else {
        const userData = {
            name: name,
            email: email,
            password: bcrypt.hashSync(password, 10),
            verificationCode: userVerificationCode
        };
        finishSignup(User.create(userData));
      }

    })
  .catch(err => {
    console.error("Error checking existing user:", err);
    res.status(500).json({ message: "Internal server error." });
  });
  
};