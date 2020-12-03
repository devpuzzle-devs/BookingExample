import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { logOut } from '../../containers/Login/Login'
import { CustomModal } from '../CustomModal/CustomModal'
import { HandelsContext } from '../../context/handels-context'

import google_play_img from '../../../../assets/img/google-play-badge/google-play-badge@3x.png'

import classes from './navigation-mobile.module.scss'
import { TABS } from '../../constants'

export const MobileSettingsMenu = (props) => {
    const {
        mobileNavOpened,
        className,
        isLogIn,
        isSaved,
        setIsSaved,
        handleToggleBurgerMenu,
        currentTab,
    } = props

    const {
        handleGogleLogOut,
        handleFacebookLoginClick,
        handleGoogleLoginClick,
        handleTabClick,
    } = useContext(HandelsContext)

    const [showAuthButton, setShowAuthButton] = useState(false)
    const [showModal, setShowModal] = useState(false);

    const handleSavedClick = () => {
        if (isLogIn) {
            setIsSaved(!isSaved)
            handleToggleBurgerMenu()
            handleTabClick(null)
        } else {
            setShowModal(true)
            setTimeout( () => {
                setShowModal(false)
            }, 3000)
        }
    }

    useEffect(() => {
        setShowAuthButton(false)
    }, [isLogIn])

    const tabs = TABS && TABS.map(tab => {
        return (
            <div 
                className={classes.NavItem}
                key={tab.name} 
                onClick={ () => {
                    handleTabClick(tab)
                    setIsSaved(false)
                    handleToggleBurgerMenu()
                }}
            >
                <Link className={`${classes.Link} ${currentTab && (tab.name ===  currentTab.name)? classes.IsSaved : ''}`} to='#'>
                    {tab.text}
                </Link>
            </div>
        )
    })

    return (
        <div className={`${classes.MobileMenu} ${className} ${mobileNavOpened ? classes.Show : classes.Hidden}`}>

            { tabs }

            <div className={classes.NavItem} onClick={ handleSavedClick }> 
                <Link className={`${classes.Link} ${isSaved ? classes.IsSaved : ''}`} to='#' >  Saved </Link>
            </div>

            <div className={classes.NavItem}> <Link className={classes.Link} to='/about' target='_blank' >  About </Link></div>
            
            <div className={classes.NavItem} onClick={() => {
                if (isLogIn) {
                    handleGogleLogOut()
                    logOut()
                }
                else {
                    setShowAuthButton(!showAuthButton)
                }

            }}> <Link className={classes.Link} to='#' >  {isLogIn ? 'Sign out' : ' Sign in'} </Link></div>

            { showAuthButton &&
                <>
                    <div className={`${classes.NavItem} ${classes.SubItem}`} onClick={handleFacebookLoginClick}>Continue with Facebook</div>
                    <div className={`${classes.NavItem} ${classes.SubItem}`} onClick={handleGoogleLoginClick}>Continue with Google</div>
                </>
            }

            <CustomModal
                showModal={showModal}
                handleClose={() => setShowModal(false)}
                title='Please sign in'
                text='Please sign in to save it to your account'
            />
        </div>
    )
}
