const router = require("express").Router();
const User = require("../models/user");
const Post = require("../models/post");
const bcrypt = require("bcrypt");

router.post("/registration", async (req, res) => {
  try {
    const checkUserEmail = await User.findOne({
      email: req.body.email,
    });
    const checkUsername = await User.findOne({
      username: req.body.username,
    })
      .where("email username")
      .in(req.body.email, req.body.username);
    if (!checkUserEmail && !checkUserEmail) {
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
    } else {
      res.status(400).json("this user is already exist");
    }
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
    const followers = await User.find()
      .where("_id")
      .in(user.followers)
      .select("-password -isAdmin");
    const followings = await User.find()
      .where("_id")
      .in(user.followings)
      .select("-password -isAdmin");
    const feed = await Post.find()
      .where("userId")
      .in([...user.followers, user._id])
      .sort("-_id -createdAt")
      .limit(5);
    const { password, isAdmin, ...other } = user._doc;
    const data = {
      user: other,
      userPosts: userPosts,
      followers: followers,
      followings: followings,
      feed: feed,
    };
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
});
module.exports = router;
