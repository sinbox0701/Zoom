import express from "express";
import http from "http";
import {Server} from "socket.io";
import { instrument } from "@socket.io/admin-ui";

const app = express();

app.set("view engine", "pug");
app.set("views",__dirname + "/views");

app.use("/public",express.static(__dirname + "/public"));

app.get("/", (req,res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const httpServer = http.createServer(app);
const wsServer = new Server(httpServer,{
  cors:{
    origin:["https://admin.socket.io"],
    credentials:true
  }
});
instrument(wsServer,{
  auth:false
});

const handleListen = () => console.log(`Listening on http://localhost:3000`);
httpServer.listen(3000,handleListen);