const mongoose = require('mongoose');

const statSchema = mongoose.Schema(
  {
    linkId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Link',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Stat', statSchema);
