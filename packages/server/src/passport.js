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
      (jwtPayload, done) => {
        console.log('[passport-jwt] verify user')
        try {
          const user = redis.findUser(jwtPayload.email)
          if (!user) {
            return done(null, false)
          }
          return done(null, user)
        } catch (error) {
          return done(error, false)
        }
      }
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
