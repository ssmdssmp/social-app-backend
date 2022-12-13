const express = require("express");
const router = express.Router();
const socketIo = require("socket.io");

router.get("/", (req, res) => {
  res.send({ response: "I am alive" }).status(200);
});

module.exports = router;
