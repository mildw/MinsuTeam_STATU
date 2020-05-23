import React, { FunctionComponent } from 'react'
import useUser from '../../hooks/useUser'
import useWindowSize from '../../hooks/useWindowSize'
import LargeNavBar from './LargeNav'
import SmallNavBar from './SmallNav'
import { history } from '../../configureStore'
import { logout } from '../User/authentication'

const NavBar: FunctionComponent = () => {
  const { width } = useWindowSize()
  const { onGetUserInfo, onSetUserInfo } = useUser()

  const handleLogout = () => {
    alert("로그아웃 되었습니다.")
    history.push('/')
    logout()
    onSetUserInfo(null)
  }

  // widthSize: 'XL' >= 1200 > 'LG' >= 992 > 'MD' >= 768 > 'SM' >= 576 > 'XS'
  return width <= 768 ? 
  <SmallNavBar onLogout={handleLogout} user={onGetUserInfo!!!} /> 
  : <LargeNavBar onLogout={handleLogout} user={onGetUserInfo!!!} />
}

export default NavBar
