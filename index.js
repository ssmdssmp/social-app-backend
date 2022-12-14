// imports
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
const userRoute = require("./routes/users");
const authRoute = require("./routes/auth");
const postRoute = require("./routes/posts");
const bodyParser = require("body-parser");
const index = require("./routes/index");
const socketIo = require("socket.io");
const PORT = process.env.PORT || 8800;
const SOCKET_PORT = process.env.PORT || 8801;
const test = require("./routes/index");

// init

const app = express();
dotenv.config();
mongoose.connect(process.env.MONGO_URL);
const jsonParser = bodyParser.json();
mongoose.set("strictQuery", true);

//socket for online users

const http = require("http").createServer(app);
const io = socketIo(http, {
  transports: ["websocket"],
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST"],
  },
});
var currentConnections = {};

io.on("connection", (socket) => {
  console.log("connected", socket.id);
  currentConnections[socket.id] = {
    _id: "",
    followings: [],
    onlineFollowings: [],
  };
  var userId;
  socket.on("pong", (data) => {
    userId = data._id;
    console.log(userId);
    currentConnections[socket.id] = {
      _id: data._id,
      followings: data.followings,
      onlineFollowings: [
        ...Object.values(currentConnections).map((item) => {
          if (data.followings.includes(item._id)) {
            return item._id;
          } else {
            return;
          }
        }),
      ],
    };
  });
  const ping = setInterval(() => {
    socket.emit("ping", currentConnections[socket.id].onlineFollowings);
  }, 2000);

  socket.on("disconnect", () => {
    console.log("disconnect", socket.id);
    clearInterval(ping, 2000);
    delete currentConnections[socket.id];
  });
});

// middleware

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));
app.use(jsonParser);
app.set("etag", false);

// api

app.use(index);
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/posts", postRoute);

// listeners

app.listen(PORT, () => console.log("app working"));
// http.listen(SOCKET_PORT, () => console.log("websocket working"));
