const router = require("express").Router();
const Post = require("../models/post");
const User = require("../models/user");

//create post

router.post("/", async (req, res) => {
  try {
    const newPost = await Post.create(req.body);
    res.status(200).json(newPost);
  } catch (err) {
    res.status(500).json(err);
  }
});

//update post

router.put("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (post.userId === req.body.userId) {
      res.status(200).json(post);
    } else {
      res.status(403).json("you can update only your posts");
    }
  } catch (err) {
    res.status(500).json("cant update post");
  }
});

//delete post

router.delete("/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete({ _id: req.params.id });
    res.status(200).json(post._id);
  } catch (err) {
    res.status(500).json("cant delete post");
  }
});

// get post

router.get("/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    res.status(200).json(post);
  } catch (err) {
    res.status(500).json("couldn`t get the post");
  }
});

// get user posts

//like/dislike post

router.put("/:id/like", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post.likes.includes(req.body.userId)) {
      await post.updateOne({ $push: { likes: req.body.userId } });
      const data = { type: "liked", id: post._id, likes: post.likes };
      res.status(200).json(data);
    } else {
      await post.updateOne({ $pull: { likes: req.body.userId } });
      res.status(200).json("disliked");
    }
  } catch (err) {
    res.status(500).json(err);
  }
});

//get feed

router.get("/feed/:userId/:offset", async (req, res) => {
  try {
    const currentUser = await User.findOne({ _id: req.params.userId });
    const feedArray = [...currentUser.followings, currentUser._id];
    const feed = await Post.find()
      .where("userId")
      .in(feedArray)
      .skip(req.params.offset)
      .sort("-createdAt")
      .sort("-updatedAt")
      .limit(5);
    res.status(200).json(feed);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
