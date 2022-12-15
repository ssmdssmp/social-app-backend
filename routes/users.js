const router = require("express").Router();
const bcrypt = require("bcrypt");
const User = require("../models/user");
const Post = require("../models/post");

//get user (user + posts + friends)
router.get("/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select(
      "-password -updatedAt"
    );
    const userPosts = await Post.find()
      .where("userId")
      .in(user._id)
      .sort("-_id -createdAt")
      .limit(5);
    const followings = await User.find()
      .where("_id")
      .in(user.followings)
      .select("-password -updatedAt");
    const followers = await User.find()
      .where("_id")
      .in(user.followers)
      .select("-password -updatedAt");
    const data = {
      user: user,
      userPosts: userPosts,
      followings: followings,
      followers: followers,
    };
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
//update user
router.put("/:id", async (req, res) => {
  if (req.body.userId === req.params.id || req.body.isAdmin) {
    if (req.body.password) {
      try {
        const salt = await bcrypt.genSalt(10);
        req.body.password = await bcrypt.hash(req.body.password, salt);
      } catch (err) {
        return res.status(500).json(err);
      }
    }
    try {
      const user = await User.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true }
      );
      res.status(200).json(user);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("you can update only your account");
  }
});
//delete user
router.delete("/:id", async (req, res) => {
  if (req.body.userId == req.params.id || req.body.isAdmin) {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      res.status(200).json(user._id);
    } catch (err) {
      return res.status(500).json(err);
    }
  } else {
    return res.status(403).json("you can delete only your account");
  }
});
//follow user
router.put("/:id/follow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        req.status(403).json("user is already followed");
      } else {
        await user.updateOne({ $push: { followers: req.body.userId } });
        await currentUser.updateOne({ $push: { followings: req.params.id } });
        const newFollowersArr = [...user.followers, req.body.userId];
        const newFollowers = await User.find().where("_id").in(newFollowersArr);
        res.status(200).json(newFollowers);
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});
//unfollow user
router.put("/:id/unfollow", async (req, res) => {
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (user.followers.includes(req.body.userId)) {
        await user.updateOne({ $pull: { followers: req.body.userId } });
        await currentUser.updateOne({ $pull: { followings: req.params.id } });
        const newFollowersArr = [
          ...user.followers.filter((el) => el !== req.body.userId),
        ];
        const newFollowers = await User.find().where("_id").in(newFollowersArr);
        res.status(200).json(newFollowers);
      } else {
        req.status(403).json("user is already unfollowed");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("you cant follow yourself");
  }
});
router.get("/posts/:id/:offset", async (req, res) => {
  try {
    const posts = await Post.find()
      .where("userId")
      .in(req.params.id)
      .sort("-_id -createdAt")
      .skip(req.params.offset)
      .limit(5);
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
