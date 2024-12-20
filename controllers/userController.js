const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const sgMail = require('@sendgrid/mail');
const User = require('../models/userModel');
const {
  getFileTypeFromBase64,
  uploadImage,
  generateVerificationCode,
} = require('../utils/utils');
const dotenv = require('dotenv').config();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const registerUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    res.status(400);
    throw new Error('All fields are mandatory!');
  }
  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400);
    throw new Error('User already registered!');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
  });

  if (user) {
    res.status(201).json({ _id: user.id, email: user.email, result: true });
  } else {
    res.status(400);
    throw new Error('User data is not valid');
  }
  res.json({ message: 'Register the user' });
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400);
    throw new Error('All fields are mandatory!');
  }
  const user = await User.findOne({ email });
  if (user && (await bcrypt.compare(password, user.password))) {
    const accessToken = jwt.sign(
      {
        user,
      },
      process.env.ACCESS_TOKEN_SECRET
    );
    res.status(200).json({ accessToken });
  } else {
    res.status(401);
    throw new Error('email or password is not valid');
  }
});

const updateUserPassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    return next(new Error('All fields are mandatory!'));
  }

  const user = await User.findOne({ _id: req.user._id });

  if (user && (await bcrypt.compare(currentPassword, user.password))) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(
      req.user._id,
      { password: hashedPassword },
      { new: true }
    );

    return res.json({ message: 'Password updated successfully' });
  } else {
    res.status(401);
    return next(new Error('Current password is incorrect'));
  }
});

const profileOnboarding = asyncHandler(async (req, res, next) => {
  const { profileImage, backgroundImage, bio } = req.body;

  if (!profileImage || !backgroundImage || !bio) {
    res.status(400);
    return next(new Error('All fields are mandatory!'));
  }

  const profileImageId = uuidv4();
  const backgroundImageId = uuidv4();
  const profileImageType = getFileTypeFromBase64(profileImage);

  const backgroundImageType = getFileTypeFromBase64(backgroundImage);
  uploadImage(profileImage, '../public/profiles', profileImageId);
  uploadImage(backgroundImage, '../public/backgrounds', backgroundImageId);

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      profileImage: profileImageId + profileImageType,
      backgroundImage: backgroundImageId + backgroundImageType,
      bio,
    },
    {
      new: true,
    }
  );

  return res.status(200).send(updatedUser);
});

const updateProfileLink = asyncHandler(async (req, res, next) => {
  const { profileLink } = req.body;

  if (!profileLink) {
    res.status(400);
    return next(new Error('All fields are mandatory!'));
  }

  const existingUser = await User.findOne({ profileLink });

  if (existingUser && existingUser._id.toString() !== req.user._id.toString()) {
    res.status(400);
    return next(new Error('Profile link is already in use by another user!'));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    { profileLink },
    { new: true }
  );

  if (!updatedUser) {
    res.status(404);
    return next(new Error('User not found'));
  }

  return res.status(200).send(updatedUser);
});


const currentUser = asyncHandler(async (req, res) => {
  const user = await User.findOne({ _id: req.user._id });
  res.json(user);
});

const publicUser = asyncHandler(async (req, res) => {
  console.log('publicUser', req.params);
  const user = await User.findOne({ profileLink: req.params.profileLink });
  res.json(user);
});

const sendVerificationCode = asyncHandler(async (req, res) => {
  const { email, currentEmail, isResend } = req.body;

  if (!email) {
    res.status(400);
    return next(new Error('All fields are mandatory!'));
  }

  const code = generateVerificationCode();

  const msg = {
    to: email,
    from: 'donotreply@golinkit.com',
    subject: 'Golinkit Email Verification',
    html: `<strong>Your verification code is ${code}</strong>`,
  };

  sgMail
    .send(msg)
    .then(async () => {
      console.log('Verification Code sent');
      if (currentEmail && isResend) {
        await User.findOneAndUpdate(
          { email },
          {
            verificationCode: code,
            isVerified: false,
          },
          {
            new: true,
          }
        );
      } else if (currentEmail) {
        await User.findOneAndUpdate(
          { email: currentEmail },
          {
            email,
            verificationCode: code,
            isVerified: false,
          },
          {
            new: true,
          }
        );
      } else {
        await User.findOneAndUpdate(
          { email },
          {
            verificationCode: code,
          },
          {
            new: true,
          }
        );
      }
    })
    .catch((error) => {
      console.error('Error sending email:', error);
    });

  return res
    .status(200)
    .send({ message: 'Verification code sent', result: true });
});

const verifyCode = asyncHandler(async (req, res, next) => {
  const { verifyCode, email } = req.body;

  if (!verifyCode || !email) {
    res.status(400);
    return next(new Error('All fields are mandatory!'));
  }

  const user = await User.findOne({ email });

  if (!user) {
    res.status(404);
    return next(new Error('User not found.'));
  }

  if (user.verificationCode !== verifyCode) {
    res.status(400);
    return next(new Error('Invalid verification code.'));
  }

  user.isVerified = true;
  await user.save();

  return res
    .status(200)
    .json({ result: true, message: 'Verification successful.' });
});

const resetUserPassword = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    return next(new Error('All fields are mandatory!'));
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 10);
  } catch (error) {
    return next(new Error('Error hashing password'));
  }

  const user = await User.findOneAndUpdate(
    { email },
    { password: hashedPassword },
    { new: true }
  );

  if (!user) {
    res.status(404);
    return next(new Error('User not found'));
  }

  return res.json({ message: 'Password reset successfully', result: true });
});

const updateBio = asyncHandler(async (req, res, next) => {
  const { bio } = req.body;

  if (!bio) {
    res.status(400);
    return next(new Error('All fields are mandatory!'));
  }

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      bio,
    },
    {
      new: true,
    }
  );

  return res.status(200).send(updatedUser);
});

const updateProfileImage = asyncHandler(async (req, res, next) => {
  const { image } = req.body;

  if (!image) {
    res.status(400);
    return next(new Error('All fields are mandatory!'));
  }

  let updatedProfileImage = req.body.image;
  const imageIconId = uuidv4();
  const imageType = getFileTypeFromBase64(updatedProfileImage);
  uploadImage(updatedProfileImage, '../public/profiles', imageIconId);
  updatedProfileImage = imageIconId + imageType;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      profileImage: updatedProfileImage,
    },
    {
      new: true,
    }
  );

  return res.status(200).send(updatedUser);
});

const updateBackgroundImage = asyncHandler(async (req, res, next) => {
  const { image } = req.body;

  if (!image) {
    res.status(400);
    return next(new Error('All fields are mandatory!'));
  }

  let updatedBackgrundImage = req.body.image;
  const imageIconId = uuidv4();
  const imageType = getFileTypeFromBase64(updatedBackgrundImage);
  uploadImage(updatedBackgrundImage, '../public/backgrounds', imageIconId);
  updatedBackgrundImage = imageIconId + imageType;

  const updatedUser = await User.findByIdAndUpdate(
    req.user._id,
    {
      backgroundImage: updatedBackgrundImage,
    },
    {
      new: true,
    }
  );

  return res.status(200).send(updatedUser);
});

module.exports = {
  registerUser,
  loginUser,
  currentUser,
  updateUserPassword,
  profileOnboarding,
  updateProfileLink,
  publicUser,
  sendVerificationCode,
  verifyCode,
  resetUserPassword,
  updateBio,
  updateProfileImage,
  updateBackgroundImage
};
