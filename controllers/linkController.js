const { v4: uuidv4 } = require('uuid');
const asyncHandler = require('express-async-handler');
const mongoose = require("mongoose");
const Link = require('../models/linkModel');
const User = require('../models/userModel');
const { getFileTypeFromBase64, uploadImage } = require('../utils/utils');

const getLinks = asyncHandler(async (req, res) => {
  const links = await Link.aggregate([
    {
      $match: { userId: mongoose.Types.ObjectId(req.user._id) }
    },
    {
      $lookup: {
        from: 'stats',
        localField: '_id',
        foreignField: 'linkId',
        as: 'stats',
      },
    },
  ]);
  res.status(200).json(links);
});

const getPublicLinks = asyncHandler(async (req, res) => {
  const user = await User.find({ profileLink: req.params.profileLink });
  const links = await Link.find({ userId: user[0]._id });
  res.status(200).json(links);
});

const createLink = asyncHandler(async (req, res) => {
  const { image, title, url } = req.body;
  if (!image || !title || !url) {
    res.status(400);
    throw new Error('All fields are mandatory !');
  }

  const imageIconId = uuidv4();
  const imageType = getFileTypeFromBase64(image);

  uploadImage(image, '../public/links', imageIconId);

  const link = await Link.create({
    title,
    url,
    userId: req.user._id,
    imageName: imageIconId + imageType,
  });
  return res.status(200).send(link);
});

const updateLink = asyncHandler(async (req, res) => {
  console.log('dd');
  const link = await Link.findById(req.params.id);
  if (!link) {
    res.status(404);
    throw new Error('Link not found');
  }

  if (link.userId.toString() !== req.user._id) {
    res.status(403);
    throw new Error("User don't have permission to update other user contacts");
  }
  let updatedImageName = req.body.image;

  if (!updatedImageName.includes('.')) {
    const imageIconId = uuidv4();
    const imageType = getFileTypeFromBase64(updatedImageName);
    uploadImage(updatedImageName, '../public/links', imageIconId);
    updatedImageName = imageIconId + imageType;
  }
  const updatedLink = await Link.findByIdAndUpdate(
    req.params.id,
    {
      title: req.body.title,
      url: req.body.url,
      userId: req.user._id,
      imageName: updatedImageName,
    },
    {
      new: true,
    }
  );
  return res.status(200).send(updatedLink);
});

const deleteLink = asyncHandler(async (req, res) => {
  const link = await Link.findById(req.params.id);
  if (!link) {
    res.status(404);
    throw new Error('Link not found');
  }
  if (link.userId.toString() !== req.user._id) {
    res.status(403);
    throw new Error("User don't have permission to update other user contacts");
  }
  await Link.findByIdAndRemove(req.params.id);
  res.status(200).json(link);
});

module.exports = {
  getLinks,
  getPublicLinks,
  createLink,
  updateLink,
  deleteLink,
};
