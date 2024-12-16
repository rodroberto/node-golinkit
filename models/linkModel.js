const mongoose = require('mongoose');

const linkSchema = mongoose.Schema(
  {
    title: {
      type: String,
    },
    url: {
      type: String,
    },
    imageName: {
      type: String,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Link', linkSchema);
