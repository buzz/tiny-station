// TODO: remove

import passport from 'passport'
import { ExtractJwt, Strategy as JwtStrategy } from 'passport-jwt'
import type { PassportStatic } from 'passport'

import { isObject } from '#utils.js'
import type RedisConnection from '#redis.js'

function setupPassport(redis: RedisConnection): PassportStatic {
  const secretOrKey = process.env.JWT_SECRET
  if (!secretOrKey) {
    throw new Error('JWT_SECRET is not set')
  }

  passport.use(
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        jsonWebTokenOptions: { ignoreExpiration: false },
        secretOrKey,
        algorithms: ['HS256'],
      },
      (jwtPayload, done) => {
        if (isObject(jwtPayload) && isObject(jwtPayload.user)) {
          // eslint-disable-next-line no-underscore-dangle
          const email = jwtPayload.user._id
          if (typeof email === 'string') {
            redis
              .findUser(email)
              .then((user) => {
                if (!user?.ver) {
                  done(null, false)
                }
                done(null, user)
              })
              .catch((error: unknown) => {
                const typedError = error instanceof Error ? error : new Error('Unknown error')
                done(typedError, false)
              })
          }
        }
        done(new Error('Could not extract JWT payload'), false)
      }
    )
  )

  passport.serializeUser((user: unknown, done) => {
    // TODO: what type is user? augment `Express.User`?
    if (user) {
      done(null, user)
    }
  })

  passport.deserializeUser((id, done) => {
    // TODO: check for string?
    done(null, id)
  })

  return passport
}

export default setupPassport
