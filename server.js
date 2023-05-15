const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const http = require("http");
const https = require("https");
const fs = require("fs");
let server = http.createServer(app);
if (process.env.SERVER_ENV === "prod") {
  server = https.createServer(
    {
      key: fs.readFileSync("/etc/letsencrypt/live/farreachco.com/privkey.pem"),
      cert: fs.readFileSync(
        "/etc/letsencrypt/live/farreachco.com/fullchain.pem"
      ),
    },
    app
  );
}
const { Server } = require("socket.io");
const io = new Server(server);
const cors = require("cors");
var path = require("path");
const bodyParser = require("body-parser");
const routes = require("./dist/api/routes.js");
const { verifyUserByToken } = require("./dist/api/controllers/users.js");
const {
  userJoin,
  getProjectUsers,
  userLeave,
} = require("./dist/lib/socketUsers.js");

/***************************** SETUP AND UTILS ***************************/
async function getUserByToken(token) {
  try {
    const userData = await verifyUserByToken(token);

    if (!userData) return null;

    const data = userData.rows[0];

    return data;
  } catch (err) {
    console.error(err);
    return null;
  }
}

//Set CORS
// app.use(cors())

// Static
app.use(express.static("public"));

// Body Parse
app.use(bodyParser.json());

// MIDDLEWARE
app.use(async (req, res, next) => {
  console.log("*********** REQUEST ***********");

  const pathName = req.url;
  const subApiPath1 = pathName.split("/")[2];

  // check for token
  if (req.headers["x-access-token"]) {
    let token = req.headers["x-access-token"];
    token = token.split(" ")[1];
    // set token or user on request
    if (subApiPath1 === "verify_jwt") {
      req.token = token;
    } else {
      const user = await getUserByToken(token);
      req.user = user;
      if (user) {
        // handle requests that require user
        // TODO: handle security for different groups
        // switch (subApiPath1) {
        //   case "user":
        // }
      } else return res.json({ status: 401, message: "Missing Credentials" });
    }
  }
  next();
});

// Routes
app.use("/api", routes);

//Error
app.use((error, req, res, next) => {
  console.error(error);
  // code for unique constraint on user registration email
  if (error.code == 23505) error.status = 400;
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message || "There was an Error",
    },
  });
});

/***************************** SOCKETS ***************************/
io.on("connection", (socket) => {
  // testing
  socket.on("project-joined", ({ project, username }) => {
    try {
      console.log("************** SOCKETTTTTT ***********************\n");
      console.log(project, username, "\n");
      console.log("************** SOCKETTTTTT ***********************\n");

      const user = userJoin(socket.id, username, project);
      socket.join(project);

      // broadcast when a user connects
      io.to(project).emit("project-join", `Hello ${username}`);

      // send users list
      io.to(user.project).emit("current-users", getProjectUsers(project));
    } catch (err) {
      console.log("SOCKET ERROR", err);
    }
  });

  // ************************* VTT *************************

  // grid
  socket.on("grid-changed", ({ project, gridState }) => {
    socket.broadcast.to(project).emit("grid-change", gridState);
  });
  // update images
  socket.on("image-added", ({ project, image }) => {
    socket.broadcast.to(project).emit("image-add", image);
  });

  socket.on("image-removed", ({ project, id }) => {
    socket.broadcast.to(project).emit("image-remove", id);
  });

  socket.on("image-moved", ({ project, image }) => {
    socket.broadcast.to(project).emit("image-move", image);
  });

  socket.on("object-moved-up", ({ project, object }) => {
    socket.broadcast.to(project).emit("object-move-up", object);
  });

  socket.on("object-changed-layer", ({ project, object }) => {
    socket.broadcast.to(project).emit("object-change-layer", object);
  });

  // when a user disconnects
  socket.on("disconnect", () => {
    const user = userLeave(socket.id);

    if (user) {
      // send users list
      io.to(user.project).emit("current-users", getProjectUsers(user.project));
    }
  });
});

/***************************** Run ***************************/
let PORT = 4000;
if (process.env.SERVER_ENV === "dev") {
  server.listen({ port: PORT }, async () => {
    console.log(`Server Running at http://localhost:${PORT}`);
  });
} else {
  PORT = 443;
  server.listen({ port: PORT }, async () => {
    console.log(`Server Running at https://localhost:${PORT}`);
  });

  // redirect
  http
    .createServer(function (req, res) {
      res.writeHead(301, {
        Location: "https://" + req.headers["host"] + req.url,
      });
      res.end();
    })
    .listen(80);
}
