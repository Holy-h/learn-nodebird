const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const { Post, Hashtag, User } = require("../models");
const { isLoggedIn } = require("./middlewares");

const router = express.Router();

// uploads 폴더 생성
fs.readdir("uploads", error => {
  if (error) {
    console.error("uploads 폴더가 없어 uploads 폴더를 생성합니다");
    fs.mkdirSync("uploads");
  }
});

// 이미지 업로드
const upload = multer({
  storage: multer.diskStorage({
    destination(req, file, cb) {
      cb(null, "uploads/");
    },
    filename(req, file, cb) {
      // 확장자
      const ext = path.extname(file.originalname);
      cb(
        null,
        // 기존 파일명 + 업로드 시간(중복 제거용) + 기존 확장자
        path.basename(file.originalname, ext) + new Date().valueOf() + ext
      );
    }
  }),
  // 파일크기 제한 10MB
  limits: { fileSize: 10 * 1024 * 1024 }
});

router.post("/img", isLoggedIn, upload.single("img"), (req, res) => {
  console.log(req.file);
  res.json({ url: `/img/${req.file.filename}` });
});

const upload2 = multer();
router.post("/", isLoggedIn, upload2.none(), async (req, res, next) => {
  console.log("upload2 시작");
  try {
    const post = await Post.create({
      content: req.body.content,
      img: req.body.url,
      userId: req.user.id
    });
    const hashtags = req.body.content.match(/#[^\s]*/g);
    if (hashtags) {
      const result = await Promise.all(
        hashtags.map(tag =>
          Hashtag.findOrCreate({
            where: { title: tag.slice(1).toLowerCase() }
          })
        )
      );
      await post.addHashtags(result.map(r => r[0]));
    }
    res.redirect("/");
  } catch (error) {
    console.error(error);
    next(error);
  }
});

router.get("/hashtag", async (req, res, next) => {
  // req.body에 들어있는 hashtag를 query로 사용
  const query = req.body.hashtag;
  if (!query) {
    // 없네? -> home으로 돌아가
    return res.redirect("/");
  }
  try {
    // query와 일치하는 hashtag를 찾습니다.
    const hashtag = await Hashtag.findOne({ where: { title: query } });
    let posts = [];
    if (hashtag) {
      // 찾아보니 query와 일치하는 hashtag가 있네?
      // 모두 가져와서(getPosts) posts에 담아야겠다.
      // 작성자 정보도 가져와야지(model: User) === JOIN
      posts = await hashtag.getPosts({ include: [{ model: User }] });
    }
    // 찾은 정보를 바탕으로 main 레이아웃에 구성해야지
    return res.render("main", {
      title: `${query} | NodeBird`,
      user: req.user,
      twits: posts
    });
  } catch (error) {
    console.errror(error);
    next(error);
  }
});

module.exports = router;
