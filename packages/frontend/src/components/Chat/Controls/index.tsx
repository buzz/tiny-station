import useUser from '#hooks/useUser'

import Login from './Login'
import MessageInput from './MessageInput'
import Register from './Register'

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

  return null
}

export default Controls
