import useUser from '#hooks/useUser'

import ForgotPassword from './ForgotPassword'
import Login from './Login'
import MessageInput from './MessageInput'
import Register from './Register'
import ResetPassword from './ResetPassword'

function Controls() {
  const { loginState } = useUser()

  if (loginState === 'loggedIn') {
    return <MessageInput />
  }

  if (['loggedOut', 'loggingIn'].includes(loginState)) {
    return <Login />
  }

  if (['registerForm', 'registering'].includes(loginState)) {
    return <Register />
  }

  if (['forgotPassword'].includes(loginState)) {
    return <ForgotPassword />
  }

  if (['resetPassword'].includes(loginState)) {
    return <ResetPassword />
  }

  return null
}

export default Controls
