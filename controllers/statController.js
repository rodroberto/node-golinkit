const asyncHandler = require('express-async-handler');
const Stat = require('../models/statModel');

const getStats = asyncHandler(async (req, res) => {
  const stats = await Stat.find({ linkId: req.params.linkId });
  res.status(200).json(stats);
});

const createStat = asyncHandler(async (req, res) => {
  const { linkId } = req.body;
  if (!linkId) {
    res.status(400);
    throw new Error('All fields are mandatory !');
  }

  const stat = await Stat.create({
    linkId,
  });
  return res.status(200).send(stat);
});

const deleteStats = asyncHandler(async (req, res) => {
  const result = await Stat.deleteMany({ linkId: req.params.linkId });

  if (result.deletedCount > 0) {
    res.status(200).json({ message: 'Deleted successfully' });
  } else {
    res.status(404).json({ message: 'No stats found for this linkId' });
  }
});

const getAllStats = asyncHandler(async (req, res) => {
  const stats = await Stat.find();
  res.status(200).json(stats);
});


module.exports = {
  getStats,
  createStat,
  deleteStats,
  getAllStats
};
