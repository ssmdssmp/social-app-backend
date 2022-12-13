const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  desc: {
    type: String,
    max: 500,
    required: true,
  },
  likes: {
    type: Array,
    default: [],
  },
  postPic: {
    type: String,
  },
  createdAt: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: String,
  },
  default: [],
});

module.exports = mongoose.model("Post", postSchema);
