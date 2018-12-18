import * as React from 'react'
import { Link } from 'react-router-dom'

import logo from '../../assets/logo.png'
import './headerComponent.less'
import IdentitySelectorComponent from './IdentitySelectorComponent'

const HeaderComponent: React.FunctionComponent = props => {
  return (
    <header>
      <Link to="/">
        <img src={logo} alt="logo" />
      </Link>
      <br />
      <Link to="/wallet">Wallet </Link>
      <Link to="/ctype">CTYPE manager </Link>
      <Link to="/chain-stats">Chain stats </Link>
      <IdentitySelectorComponent />
    </header>
  )
}

export default HeaderComponent