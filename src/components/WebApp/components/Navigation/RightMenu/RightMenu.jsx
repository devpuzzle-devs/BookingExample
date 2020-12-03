import React, { useContext } from 'react'

import { Link } from 'react-router-dom'
import { NavDropdown, Popover, Button } from 'react-bootstrap'
import { CustomPopover } from '../../CustomPopover/CustomPopover'
import { logOut } from '../../../containers/Login/Login';
import { HandelsContext } from '../../../context/handels-context'
import { TABS } from '../../../constants';

import classes from './right-menu.module.scss'
import './right-menu.scss'
import facebook_logo from '../../../../../assets/img/facebook-logo/facebook-logo@3x.png'
import google_logo from '../../../../../assets/img/google-logo/google-logo@3x.png'


export const RightMenu = (props) => {
  const {
      isLogIn,
      currentUserInfo,
      isSaved,
      setIsSaved,
      showSignInMenu, 
      currentTab,
  } = props

  const {
      setShowSignInMenu,
      setIsTimeoutEnd,
      handleGogleLogOut,
      handleFacebookLoginClick,
      handleGoogleLoginClick,
      handleTabClick,
  } = useContext(HandelsContext) 



  const tabs = TABS && TABS.map(tab => {
    return (
      <li key={tab.name} className={`nav-item `} onClick={ () => {
        handleTabClick(tab)
        setIsSaved(false)
      }}>
        <Link className={`nav-link ${currentTab && (tab.name ===  currentTab.name) ? classes.IsSaved : ''}`} to='#'>
            {tab.text}
        </Link>
      </li>
    )
  })

  return (
    <nav className={`navbar navbar-expand-lg navbar-light bg-light ${classes.BackGroudColor}`}>
      <div className={`collapse navbar-collapse ${classes.MenuFont}`} id='navbarSupportedContent'>
        <ul className='navbar-nav ml-auto d-flex align-items-center'>
          
          {tabs}

          <li className={`nav-item `} onClick={ () => {
            if (isLogIn) {
              setIsSaved(true)
              handleTabClick(null)
            } else {
              setIsTimeoutEnd(true)
              setShowSignInMenu(true)
            }
          }}>
            <Link className={`nav-link ${isSaved ? classes.IsSaved : ''}`} to='#'>
                Saved
            </Link>
          </li>

          <li className='nav-item dropdown'>
            <NavDropdown title="Camp providers" id="basic-nav-dropdown">
              <NavDropdown.Item target='_blank' href={isLogIn ? "/manage-events/upcoming"  : ''}
                onClick={() => {
                  if (!isLogIn) {
                    setIsTimeoutEnd(true)
                    setShowSignInMenu(true)
                  }
                }}
              ><div className={classes.SubMenuText}>List your camp</div></NavDropdown.Item>
              <hr />
              <NavDropdown.Item target='_blank' href={isLogIn ? "/manage-events/upcoming"  : ''}
              onClick={() => {
                  if (!isLogIn) {
                    setIsTimeoutEnd(true)
                    setShowSignInMenu(true)
                  }
                }}
              ><div className={classes.SubMenuText}>Manage your camp</div></NavDropdown.Item>
            </NavDropdown>
          </li>

          <li className='nav-item'>
            <Link className={`nav-link ${classes.MenuFont}`} target='_blank' to='/about'>
              About
          </Link>
          </li>

          
          {!isLogIn &&

            <li className='nav-item' onClick={() => {
              setShowSignInMenu(!showSignInMenu)
            }}>
              <Link className={`nav-link ${classes.MenuFont}`} to='#'>
                Sign in
            </Link>
            </li>

          }

          { showSignInMenu &&
            <Popover 
              id={`${classes.Fixxx}`} 
              className={isLogIn ? classes.HiddenLogIn : ''}
            >
              <CustomPopover title='Sign in' buttonOff height={190} width={300} >
                <Button variant="primary" className={classes.FacebookButton} onClick={handleFacebookLoginClick}>
                  <img src={facebook_logo} alt="" />
                  <div >Continue with Facebook</div>
                </Button>

                <Button variant="primary" className={classes.GoogleButton} onClick={handleGoogleLoginClick}>
                  <img src={google_logo} alt="" />
                  <div >Continue with Google</div>
                </Button>
              </CustomPopover>
            </Popover>
          }

          {isLogIn &&
            <li className={`nav-item ${classes.LogOut}`} onClick={() => {
              setShowSignInMenu(false)
              handleGogleLogOut()
              logOut()
            }}>
              <Link className={`nav-link ${classes.MenuFont}`} to='#'>
                Sign out
              </Link>
            </li>
          }

          {isLogIn &&
            <div className={classes.UserPhoto}>
              <img src={`${currentUserInfo.photoURL}`} alt="" />
            </div>
          }
        </ul>
      </div>
    </nav>

  )
}
