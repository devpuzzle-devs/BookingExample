import React, { useState, useContext, useEffect } from 'react'
import { Row, Col } from 'react-bootstrap'
import {CustomLogo} from '../CustomLogo/CustomLogo'
import { RightMenu } from './RightMenu/RightMenu'
import { BurgerButton } from '../BurgerButton/BurgerMenu'
import { MobileSettingsMenu } from './MobileSettingsMenu'
import { MobileFilterMenu } from './MobileFilterMenu'
import { CustomSearch } from '../CustomSearch/CustomSearch'
import { HandelsContext } from '../../context/handels-context'
import classes from './navigation-mobile.module.scss'
import { TestUserContext } from '../../../../user-context'

export const NavigationMobile = (props) => {
    const {
        mobileNavOpened,
        filterOpened,
        citiesLookUp,
        categoryLookUp,
        filters,
        isLogIn,
        currentUserInfo,
        countOfVisibleEvents,
        prevFilters,
        setIsApplyClick,
        setPrevFilters,
        isLoggedIn,
        isLoading,
        isSaved,
        setIsSaved,
        isTimeoutEnd,
        showSignInMenu,
        currentTab,
    } = props
    
    const { date, age, searchText, cityName, category } = filters
    
    const {
        handleClearAllFilters,
        handleToggleBurgerMenu,
        handleSaveFilterValue,
    } = useContext(HandelsContext)

    const user = useContext(TestUserContext)

    
    const isOneOfFiltersSet = date || age !== null || searchText.isFilterOn || cityName.isFilterOn || category
    
    const [isButtonAplyClicked, setIsButtonAplyClicked] = useState(isOneOfFiltersSet)

    useEffect(() => {
        if (Object.keys(user).length > 0){
            if (isOneOfFiltersSet) {
                setIsApplyClick(true)
                setIsButtonAplyClicked(true)
            }
            
        }
    }, [user, isOneOfFiltersSet, setIsApplyClick])

    return (
        <div className={classes.NavWrapper}>
            <nav className={`navbar navbar-expand-lg navbar-light bg-light d-md-flex justify-content-between ${classes.BackGroudColor}`}>

                <div className='order-md-0 flex-md-grow-1 flex-grow-1 flex-lg-grow-0 align-items-center'>
                    <Row>
                        <Col xs={2} lg={4}>
                            <CustomLogo />
                        </Col>
                        <Col xs={8} lg={8} className={classes.CustomSearch}>
                            <CustomSearch searchText={searchText} />
                        </Col>
                    </Row>
                </div>

                {
                    filterOpened &&
                    <div
                        className={`flex-grow-0 ${classes.ClearAll} ${isOneOfFiltersSet ? classes.FiltersActive : ''}`}
                        onClick={() => {
                            handleClearAllFilters()
                            handleToggleBurgerMenu()
                        }}
                    >Clear all</div>
                }

                <div className={`order-md-2 flex-sm-grow-0 ${classes.BurgerButton}`}>
                    <BurgerButton mobileNavOpened={mobileNavOpened} handleToggleBurgerMenu={() => {
                        handleToggleBurgerMenu()
                        if (isButtonAplyClicked && mobileNavOpened) {
                            handleSaveFilterValue(prevFilters)
                        } 
                        if (!isButtonAplyClicked && mobileNavOpened){
                            handleToggleBurgerMenu()
                        }
                    }} />
                </div>

                <div className={classes.RightMenu} >
                    <RightMenu
                        mobileNavOpened={mobileNavOpened}
                        handleToggleBurgerMenu={handleToggleBurgerMenu} //NOT USING
                        isLogIn={isLogIn}
                        currentUserInfo={currentUserInfo}
                        isLoggedIn={isLoggedIn}
                        isLoading={isLoading}
                        isSaved={isSaved}
                        setIsSaved={setIsSaved}
                        isTimeoutEnd={isTimeoutEnd}
                        showSignInMenu={showSignInMenu}
                        currentTab={currentTab}
                    />
                </div>
            </nav>

            {
                mobileNavOpened && !filterOpened ?
                <MobileSettingsMenu
                    isLogIn={isLogIn}
                    isSaved={isSaved}
                    setIsSaved={setIsSaved} 
                    handleToggleBurgerMenu={handleToggleBurgerMenu}
                    currentTab={currentTab}
                    /> :

                mobileNavOpened && filterOpened &&
                <MobileFilterMenu
                    filters={filters}
                    categoryLookUp={categoryLookUp}
                    citiesLookUp={citiesLookUp}
                    countOfVisibleEvents={countOfVisibleEvents}
                    isOneOfFiltersSet={isOneOfFiltersSet}
                    setIsButtonAplyClicked={setIsButtonAplyClicked}
                    setIsApplyClick={setIsApplyClick}
                    setPrevFilters={setPrevFilters}
                    prevFilters={prevFilters}
                    currentTab={currentTab}
                />
            }
        </div>
    )
}
