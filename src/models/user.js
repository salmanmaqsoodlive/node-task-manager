const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Task = require("../models/task");

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    default: 0,
    trim: true,
    validate(value) {
      if (value < 0) {
        throw new Error("Age must be a positive number");
      }
    },
  },
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
    trim: true,
    validate(value) {
      if (!validator.isEmail(value)) {
        throw new Error("Email is invalid");
      }
    },
  },
  password: {
    type: String,
    required: true,
    minlength: 7,
    trim: true,
    validate(value) {
      if (value.toLowerCase().includes("password")) {
        throw new Error("password cannot contain 'password'");
      }
    },
  },
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

userSchema.virtual("user_tasks", {
  ref: "Task",
  localField: "_id",
  foreignField: "user_id",
});

userSchema.methods.toJSON = function () {
  user = this;
  const userObject = user.toObject();
  delete userObject.password;
  delete userObject.tokens;
  return userObject;
};

userSchema.methods.genrateAuthToken = async function () {
  const user = this;
  const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET);
  user.tokens = user.tokens.concat({ token });
  await user.save();
  return token;
};

userSchema.statics.findByCredentials = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new mongoose.Error("Unable to login");
  }
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new mongoose.Error("Unable to login");
  }
  return user;
};

//Hash the plain text before saving in database
userSchema.pre("save", async function (next) {
  const user = this;
  const salt = await bcrypt.genSalt(8);
  if (user.isModified("password")) {
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});
userSchema.pre("remove", async function (next) {
  const user = this;
  await Task.deleteMany({ user_id: user._id });
  next();
});
const User = mongoose.model("User", userSchema);
module.exports = User;
