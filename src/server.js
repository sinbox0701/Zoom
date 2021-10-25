import express from "express";

const app = express();

app.set("view engine", "pug");
//pug를 front 엔진으로 설정
app.set("views",__dirname + "/views");
//template 위치 알려줌

app.use("/public",express.static(__dirname + "/public"));
//파일 공유
app.get("/", (req,res) => res.render("home"));
//공유한거 home.pug로 렌더링
app.get("/*", (req, res) => res.redirect("/"));
//home만 사용하기위해 설정

const handleListen = () => console.log(`Listening on http://loaclhost:3000`);

app.listen(3000,handleListen);