const local = require("./localStrategy");
const kakao = require("./kakaoStrategy");
const { User } = require("../models");

module.exports = passport => {
  // user.id를 req.session 객체에 저장
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  // req.session 객체로 부터 받은 id를 이용해 사용자 정보를 조회하여 req.user 객체에 저장
  passport.deserializeUser(async (id, done) => {
    try {
      const user = await User.findOne({ where: { id } });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  });

  local(passport);
  kakao(passport);
};
