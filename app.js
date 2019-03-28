const express = require("express");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const path = require("path");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
require("dotenv").config();

const pageRouter = require("./routes/page");
const authRouter = require("./routes/auth");
// 모델 <-> 서버 연결
const { sequelize } = require("./models");
// passport 연결
const passportConfig = require("./passport");

const app = express();
// 모델 <-> 서버 연결
sequelize.sync();
passportConfig(passport);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");
app.set("port", process.env.PORT || 8001);

app.use(morgan("dev"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser(process.env.COOKIE_SECRET));
app.use(
  session({
    resave: false,
    saveUninitialized: false,
    secret: process.env.COOKIE_SECRET,
    cookie: {
      httpOnly: true,
      secure: false
    }
  })
);
app.use(flash());
// req 객체에 passport 설정 탑승
app.use(passport.initialize());
// req.session 객체에 passport 정보 저장
// req.session 객체는 express-session에서 생성하므로 위치 신경써야함
// passport.deserializeUser 메서드 호출
app.use(passport.session());

app.use("/", pageRouter);
app.use("/auth", authRouter);

app.use((req, res, next) => {
  const err = new Error("not Found");
  err.status = 404;
  next(err);
});

app.use((err, res, next) => {
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};
  res.status(err.status || 500);
  res.render("error");
});

app.listen(app.get("port"), () => {
  console.log(app.get("port"), "번 포트에서 대기 중");
});
