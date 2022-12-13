const router = require("express").Router();
const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcrypt");

router.post("/registration", async (req, res) => {
  try {
    //generate new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    //create new user
    const newUser = new User({
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
      coverPicture: req.body.coverPicture,
      profilePicture: req.body.profilePicture,
      desc: req.body.desc,
      hometown: req.body.hometown,
      city: req.body.city,
      relationship: req.body.relationship,
    });
    // save user
    const user = await newUser.save();
    res.redirect(307, "login/");
  } catch (err) {
    console.log(err);
  }
});

// LOGIN

router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    });
    !user && res.status(404).send("user not found");
    const validPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );
    !validPassword && res.status(400).send("wrong password");

    const userPosts = await Post.find().where("userId").in(user._id);
    const followings = await User.find().where("_id").in(user.followings);
    const followingsArray = [];
    const followers = await User.find().where("_id").in(user.followers);
    const followersArray = [];

    const feedArray = [...user.followers, user._id];

    const feed = await Post.find()
      .where("userId")
      .in(feedArray)
      .sort("-_id -createdAt")
      .limit(5);
    followings.map((el) => {
      const { password, isAdmin, ...other } = el._doc;
      followingsArray.push({ ...other });
    });
    followers.map((el) => {
      const { password, isAdmin, ...other } = el._doc;
      followersArray.push({ ...other });
    });
    const { password, updatedAt, ...other } = user._doc;
    const data = {
      user: other,
      userPosts: userPosts,
      followers: followersArray,
      followings: followingsArray,
      feed: feed,
    }; // export user , posts, friends
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
