import { useContext } from 'react'

import UserContext from '../../contexts/UserContext'
import Login from './Login'
import MessageInput from './MessageInput'
import Register from './Register'

const Controls = () => {
  const { connectState } = useContext(UserContext)

  if (connectState === 'connected') {
    return <MessageInput />
  }

  if (['disconnected', 'connecting'].includes(connectState)) {
    return <Login />
  }

  if (['registerForm', 'registering'].includes(connectState)) {
    return <Register />
  }

  return null
}

export default Controls
