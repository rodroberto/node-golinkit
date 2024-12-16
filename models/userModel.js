const mongoose = require('mongoose');

const userSchema = mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, 'Please add the user name'],
    },
    email: {
      type: String,
      required: [true, 'Please add the user email address'],
      unique: [true, 'Email address already taken'],
    },
    password: {
      type: String,
      required: [true, 'Please add the user password'],
    },
    isVerified: {
      type: Boolean,
    },
    profileImage: {
      type: String,
    },
    backgroundImage: {
      type: String,
    },
    bio: {
      type: String,
    },
    profileLink: {
      type: String,
    },
    verificationCode: {
      type: String,
    },
    isVerified: {
      type: Boolean,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
