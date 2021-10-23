import passport from 'passport'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'

const setupPassport = (redis) => {
  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        jsonWebTokenOptions: { ignoreExpiration: false },
        secretOrKey: process.env.JWT_SECRET,
        algorithms: ['HS256'],
      },
      (jwtPayload, done) =>
        redis
          // eslint-disable-next-line no-underscore-dangle
          .findUser(jwtPayload.user._id)
          .then((user) => {
            if (!user || !user.ver) {
              done(null, false)
            }
            done(null, user)
          })
          .catch((err) => {
            done(err, false)
          })
    )
  )

  passport.serializeUser((user, done) => {
    if (user) done(null, user)
  })

  passport.deserializeUser((id, done) => {
    done(null, id)
  })

  return passport
}

export default setupPassport
