import React, { useState, useEffect, Suspense, useContext, useMemo } from 'react'
import {Container, Col, Row} from 'react-bootstrap'
import { Router, Route } from 'react-router-dom'
import { once } from 'lodash'

import firebase from "../../firebase"
import { NavigationMobile } from './components/Navigation/NavigationMobile'
import { Filters } from './components/Filters/Filters'
import history from "../../history";
import { HandelsContext } from './context/handels-context'
import { googleLogin, facebookLogin } from './containers/Login/Login'
import { TestUserContext } from '../../user-context'
import { TABS as TABS_CONST } from './constants'

import {
    getEvents,
    getOvernightCamps,
    getCitiesLookUp,
    getAdminSettings,
    getTagsLookUp,
    getCategoryLookUp,
    updateWebFilterSettings,
} from './serviceWorkers/firebaseAPI'
import {
    cityFilter,
    searchBoxFilter,
    ageFilter,
    dateFilter,
    categoryFilter,
    savedFilter,
    currentTabFilter,
} from './serviceWorkers/filters'

import { useDeepCompare } from './helpers/customHooks'

import classes from './web-app.module.scss'
import { SettingsContext } from './context/settings-context'

const ListView = React.lazy( async () =>  import('./components/ListView'))
const CustomGoogleMap = React.lazy( async () =>  import('./components/MapView'))
const DetailsModal = React.lazy( async () =>  import('./components/DetailsModal/DetailsModal'))

const TABS = TABS_CONST

const INIT_FILTERS = {
    searchText: { value: null, isFilterOn: false },
    cityName: { value: null, isFilterOn: false },
    category: null,
    age: null,
    date: null,
}

const TAB_NAME_SAVED = 'tabSaved'

export const WebApp = ({isLoggedIn, isLoading}) => {

    // const visibleEventsFBRef = useRef()
    const user = useContext(TestUserContext)

    const [isFirstLoad, setIsFirstLoad] = useState({
        tabCamp: true,
        tabMuseumAndFreeDays: true,
        tabSaved: true,
        isFirstLoadSite: true,
    })
    const [allEventsFromFB, setAllEventsFromFB] = useState([])
    const [visibleEvents, setVisibleEvents] = useState([])
    const [visibleEventsForListView, setVisibleEventsForListView] = useState([])

    const [tabBoundaries, setTabBoundaries] = useState(null)
    const [isApplyClick, setIsApplyClick] = useState(false)


    // const [myMarkers, setMyMarkers] = useState([])
    const [mobileNavOpened, toggleMobileNav] = useState(false)
    const [mapOpened, setToggleMap] = useState(false)
    const [filterOpened, setToggleFilter] = useState(false)
    const [isDataLoading, setIsDataLoading] = useState(false)

    const sessionCurrentTabName = sessionStorage.getItem('currentTabName')
    let tmpIsSaved = false
    const tmpCurrentTab = TABS.filter( tab => tab.filterTabName === sessionCurrentTabName)
    let sessionTab = tmpCurrentTab[0]
    if (!sessionCurrentTabName) sessionTab = TABS[0]    
    if (tmpCurrentTab.length === 0 && sessionCurrentTabName) tmpIsSaved = true
    
    const [currentTab, setCurrentTab] = useState(sessionTab)
    const [isSaved, setIsSaved] = useState(tmpIsSaved)
    
    const sessionFilters = JSON.parse(sessionStorage.getItem('filters'))
    let sessionCurrentFilter = null
    const tmpTabName = currentTab ? currentTab.filterTabName : TAB_NAME_SAVED 
    if (sessionFilters && sessionFilters[tmpTabName]) {
        const {searchText, cityName, age, category, date} = sessionFilters[tmpTabName]      
        sessionCurrentFilter = {
            searchText: { ...searchText },
            cityName: { ...cityName },
            category: category,
            age: age,
            date: date ? new Date(date) : null,
        }
    }

    const [filters, setFilters] = useState(sessionFilters && sessionFilters[tmpTabName] ? sessionCurrentFilter : INIT_FILTERS)
    const [prevFilters, setPrevFilters] = useState(sessionFilters && sessionFilters[tmpTabName] ? sessionCurrentFilter : INIT_FILTERS)

    const [isTimeoutEnd, setIsTimeoutEnd] = useState(false)

    const [idEventOnListItem, setIdEventOnListItem] = useState(null)
    const [prevIdEventOnListItem, setPrevIdEventOnListItem] = useState(null)

    const [isLogIn, setIsLogIn] = useState(false)
    const [currentUserInfo, setCurrentUserInfo] = useState(null)
    const [showSignInMenu, setShowSignInMenu] = useState(false)

    // -----------------------SETTINGS------------------------- //
    const [citiesLookUp, setCitiesLookUp] = useState(null)
    const [tagsLookUp, setTagsLookUp] = useState(null)
    const [categoryLookUp, setCategoryLookUp] = useState(null)

    const [initialSetting, setInitialSetting] = useState(null)

    // ------------------Custom Methods------------------------- //

    const handleToggleBurgerMenu = () => {
        toggleMobileNav(!mobileNavOpened)
        setToggleFilter(false)
    }
    const handleToggleMap = () => {
        setToggleMap(!mapOpened)
    }

    const handleToggleFilter = () => {
        setToggleFilter(!filterOpened)
        toggleMobileNav(true)
    }

    const handlerSearchByCity = (cityName) => {
        let isFilterOn = true
        if (!cityName) isFilterOn = false
        setFilters({...filters, cityName: {...filters.cityName, value: cityName, isFilterOn}})
        setPrevFilters({...filters, cityName: {...filters.cityName, value: cityName, isFilterOn}})
    }

    const handleSearchTextClick = (searchText) => {
        if (searchText) {
            let isFilterOn = true
            if(!searchText.label) isFilterOn = false
            setFilters({...filters, searchText: {value: searchText, isFilterOn: isFilterOn }})
            setPrevFilters({...filters, searchText: {value: searchText, isFilterOn: isFilterOn }})
        } else {
            setFilters({...filters, searchText: {value: null, isFilterOn: false}})
            setPrevFilters({...filters, searchText: {value: null, isFilterOn: false}})
        }
    }

    const handleSaveFilterValue = (value) => {
        setFilters({ ...filters, ...value })
        setPrevFilters({ ...filters, ...value })
        
        const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        // if (iOS) {
            let tabName = TAB_NAME_SAVED
            if (currentTab) {
                tabName = currentTab.filterTabName
            }
    
            saveFiltersOnFirebase(
                user.id,
                { ...user.webFilterSettings, currentTabName: tabName },
                { ...filters, ...value },
                tabName,
                'handleSaveFilterValue'
            )
        // }
    }

    // const handleSaveAllFilters = (newFilters, isApplyClick) => {
    //     setFilters({...filters, ...newFilters})
    //     if (isApplyClick) {
    //         setPrevFilters({...filters, ...newFilters})
    //     }
    // }

    const handleClearAllFilters = () => {
        setFilters(INIT_FILTERS)
        setPrevFilters(INIT_FILTERS)

        const iOS = !!navigator.platform && /iPad|iPhone|iPod/.test(navigator.platform);
        // if (iOS) {
            let tabName = TAB_NAME_SAVED
            if (currentTab) {
                tabName = currentTab.filterTabName
            }
    
            saveFiltersOnFirebase(
                user.id,
                { ...user.webFilterSettings, currentTabName: tabName },
                INIT_FILTERS,
                tabName,
                'handleClearAllFilters'
            )
        // }
    }

    // const setMobFilters = (state) => {

    //     setFilters(state)
    // }

    const handleOpenModal = (eventId) => {
        history.push(`/events/${eventId}`)
    }

    const handleGoogleLoginClick = () => {
        googleLogin()
            .then( res => {
                setCurrentUserInfo({photoURL: res.user.photoURL})
                setIsLogIn(true)
            })
            .catch( err => {
                console.log('Google Login Error', err)
            })
    }

    const handleFacebookLoginClick = () => {
        facebookLogin()
            .then( res => {
                setCurrentUserInfo({photoURL: res.user.photoURL})
                setIsLogIn(true)
            })
            .catch( err => {
                console.log('Facebook Login Error', err)
            })
    }

    const handleGogleLogOut = () => {
        setIsLogIn(false)
    }

    const handleTabClick = (tab) => {
        let tabName = TAB_NAME_SAVED
        if (currentTab) {
            tabName = currentTab.filterTabName
        }

        if (!tab || (tab.filterTabName !== tabName)) {
            if (user.id) {
                saveFiltersOnFirebase(
                    user.id,
                    { ...user.webFilterSettings, currentTabName: tab ? tab.filterTabName : TAB_NAME_SAVED },
                    filters,
                    tabName,
                    'handleTabClick'
                )
            }
            setCurrentTab(tab)
        }
    }

    // ---------------first boot main-page------------------------- //
    useEffect(() => {
        const run = async () => {
            try {
                setIsDataLoading(true)

                await getAdminSettings().onSnapshot(snapshotSettings => {
                    setInitialSetting({...snapshotSettings.docs[0].data(), docID: snapshotSettings.docs[0].id})
                })
                const citiesPromise = getCitiesLookUp('CA')
                // const adminSettingsPromise = getAdminSettings()
                const tagsLookUpPromise = getTagsLookUp()
                const categoryLookUpPromise = getCategoryLookUp()

                const [
                    cities,
                    // adminSettings,
                    tagsLookUp,
                    categoryLookUp,
                ] = await Promise.all([ citiesPromise, tagsLookUpPromise, categoryLookUpPromise ])
                const citiList = cities.docs.map(doc => {
                    return ({
                        value: doc.data().city.toLowerCase(),
                        label: doc.data().city,
                        state: doc.data().state,
                    })
                })

                const tagsList = tagsLookUp.docs.map(doc => {
                    return ({
                        value: doc.data().name.toLowerCase(),
                        label: doc.data().name,
                    })
                })
                
                const categoryList = categoryLookUp.docs.map(doc => {
                    return ({
                        name: doc.data().name,
                        tags: doc.data().tags,
                    })
                })
                // setInitialSetting({...adminSettings.docs[0].data()})
                setCitiesLookUp(citiList)
                setTagsLookUp(tagsList)
                setCategoryLookUp(categoryList)
            } catch (error) {
                console.log('Init load data from FireStore Error', error);
            }
        }
        run()
    }, [] )

    useEffect(() => {
        if (!isLoggedIn) {
            setIsTimeoutEnd(false)
            setTimeout( () => {
                setIsTimeoutEnd(true)
                setShowSignInMenu(true)
            }, 120000)
        }
    }, [isLoggedIn])

    useEffect(() => {
        if (!isApplyClick) {
            setPrevFilters(filters)
        }
        if ('id' in user) {
            let tabName = TAB_NAME_SAVED
            if (currentTab) {
                tabName = currentTab.filterTabName
            }

            const sessionFilters = JSON.parse(sessionStorage.getItem('filters'))
            
            sessionStorage.setItem('filters', JSON.stringify({
                ...sessionFilters,
                [tabName]: { ...filters },
            }));

        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filters])

    useEffect(() => {
        if (Object.keys(user).length > 0){
            let tabName = TAB_NAME_SAVED
            const { webFilterSettings } = user

            if (currentTab) {
                tabName = currentTab.filterTabName
            }

            if (!webFilterSettings) {
                console.log('init save filters')
                updateWebFilterSettings(user.id, null, {
                    tabCamp: {...filters},
                    tabMuseumAndFreeDays: {...filters},
                    tabSaved: {...filters},
                })
            }
            
            const sessionFilters = JSON.parse(sessionStorage.getItem('filters'))
            let newFilter = null

            let test = {...isFirstLoad}
            const oldTabName = tabName

            // TODO refactor sync filters

            if (isFirstLoad[tabName] && !sessionFilters && webFilterSettings ) {
                // Set filters from Firebase
                let searchText = { value: null, isFilterOn: false }
                let date = null
                if (webFilterSettings[tabName].searchText && webFilterSettings[tabName].searchText.value) {
                    searchText = {
                        value: {
                            ...webFilterSettings[tabName].searchText.value,
                            __isNew__: true
                        },
                        isFilterOn: Boolean(webFilterSettings[tabName].searchText.value)
                    }
                }
                if (webFilterSettings[tabName].date) date = webFilterSettings[tabName].date.toDate()

                newFilter = {
                    searchText,
                    cityName: {
                        value: webFilterSettings[tabName].cityName.value,
                        isFilterOn: Boolean(webFilterSettings[tabName].cityName.value)
                    },
                    age: webFilterSettings[tabName].age,
                    category: webFilterSettings[tabName].category,
                    date,
                }

                setIsFirstLoad({...test, [oldTabName]: false, [tabName]: false})

            }

            if (isFirstLoad[tabName] && sessionFilters && webFilterSettings ) {
                const isFiltersEqual = compareOfFilters(webFilterSettings[tabName], sessionFilters[tabName])
                if (isFiltersEqual) {
                    // Set filters from session storage
                    const newDate = sessionFilters[tabName].date
                        ? new Date(sessionFilters[tabName].date)
                        : null
                    newFilter = {
                        searchText: { ...sessionFilters[tabName].searchText },
                        cityName: { ...sessionFilters[tabName].cityName },
                        age: sessionFilters[tabName].age,
                        category: sessionFilters[tabName].category,
                        date: newDate,
                    }
                } else {
                    // Set filters from Firebase
                    let searchText = { value: null, isFilterOn: false }
                    let date = null
                    if (webFilterSettings[tabName].searchText && webFilterSettings[tabName].searchText.value) {
                        searchText = {
                            value: {
                                ...webFilterSettings[tabName].searchText.value,
                                __isNew__: true
                            },
                            isFilterOn: Boolean(webFilterSettings[tabName].searchText.value)
                        }
                    }
                    if (webFilterSettings[tabName].date) date = webFilterSettings[tabName].date.toDate()

                    newFilter = {
                        searchText,
                        cityName: {
                            value: webFilterSettings[tabName].cityName.value,
                            isFilterOn: Boolean(webFilterSettings[tabName].cityName.value)
                        },
                        age: webFilterSettings[tabName].age,
                        category: webFilterSettings[tabName].category,
                        date,
                    }
                }
                setIsFirstLoad({...test, [oldTabName]: false, [tabName]: false})
            }

            if (!isFirstLoad[tabName] && sessionFilters && (tabName in sessionFilters)) {
                
                const newDate = sessionFilters[tabName].date
                    ? new Date(sessionFilters[tabName].date)
                    : null
                newFilter = {
                    searchText: { ...sessionFilters[tabName].searchText },
                    cityName: { ...sessionFilters[tabName].cityName },
                    age: sessionFilters[tabName].age,
                    category: sessionFilters[tabName].category,
                    date: newDate,
                }
            } else if (!isFirstLoad[tabName] && webFilterSettings) {
                console.log('UseEfect webFilterSettings');
                let searchText = { value: null, isFilterOn: false }
                let date = null
                if (webFilterSettings[tabName].searchText && webFilterSettings[tabName].searchText.value) {
                    searchText = {
                        value: {
                            ...webFilterSettings[tabName].searchText.value,
                            __isNew__: true
                        }, 
                        isFilterOn: Boolean(webFilterSettings[tabName].searchText.value)
                    }
                }
                if (webFilterSettings[tabName].date) date = webFilterSettings[tabName].date

                newFilter = {
                    searchText,
                    cityName: {
                        value: webFilterSettings[tabName].cityName.value,
                        isFilterOn: Boolean(webFilterSettings[tabName].cityName.value)
                    },
                    age: webFilterSettings[tabName].age,
                    category: webFilterSettings[tabName].category,
                    date,
                }
            }
            
            if (webFilterSettings && webFilterSettings[`${TABS[0].filterTabName}`].geo) {
                setTabBoundaries({
                    ...tabBoundaries,
                    [TABS[0].filterTabName]: webFilterSettings[`${TABS[0].filterTabName}`].geo && 
                    {
                        lat: webFilterSettings[`${TABS[0].filterTabName}`].geo.lat,
                        lng: webFilterSettings[`${TABS[0].filterTabName}`].geo.lng,
                        zoom: webFilterSettings[`${TABS[0].filterTabName}`].geo.zoom
                    },
                    [TABS[1].filterTabName]: webFilterSettings[`${TABS[1].filterTabName}`].geo && 
                    {
                        lat: webFilterSettings[`${TABS[1].filterTabName}`].geo.lat,
                        lng: webFilterSettings[`${TABS[1].filterTabName}`].geo.lng,
                        zoom: webFilterSettings[`${TABS[1].filterTabName}`].geo.zoom
                    }
                })
            }

            handleSaveFilterValue(newFilter)
            setPrevFilters(newFilter)
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user, user.id, currentTab])

    // ---------------Get All events from FB------------------------- //
    useEffect(() => {
        const currentUser = firebase.auth().currentUser
        if (currentUser) {
            setCurrentUserInfo({photoURL: currentUser.photoURL})
            setIsLogIn(true)
        }
        if (initialSetting) {
            const { webMetrosList } = initialSetting

            const run = async () => {
                const eventsPromise = getEvents(webMetrosList)
                const overnightCampsPromise = getOvernightCamps()
                const [events, overnightCamps] = await Promise.all([eventsPromise, overnightCampsPromise])
                const newAllEvents = []
                const newVisibleEvents = []

                events.forEach(doc => {
                    let newData = {
                        id: doc.id,
                        ...doc.data(),
                    }
                    const { type } = doc.data()
                    if ( type !== undefined && doc.data().type.match('camp') ){
                        newData = {
                            typeOfEvent: 'camp',
                            ...newData
                        }

                    } else if (doc.data().tags.filter( tag => tag.match('#camp')).length > 0) {
                        newData = {
                            typeOfEvent: 'camp',
                            ...newData
                        }
                    } else if (doc.data().tags.filter( tag => tag.match('#museum')).length > 0) {
                        newData = {
                            typeOfEvent: 'museum',
                            ...newData
                        }
                    } else if (doc.data().frequency.match('daily')){
                        newData = {
                            typeOfEvent: 'daily',
                            ...newData
                        }
                    } else if (doc.data().frequency.match('weekly') || doc.data().frequency.match('monthly') || doc.data().frequency.match('once') ) {
                        newData = {
                            typeOfEvent: 'event',
                            ...newData
                        }
                    }

                    newAllEvents[doc.id] = newData
                })

                overnightCamps.forEach(doc => {
                    let newData = {
                        id: doc.id,
                        ...doc.data(),
                    }

                    const { type } = doc.data()
                    if ( type !== undefined && doc.data().type.match('camp') ){
                        newData = {
                            typeOfEvent: 'camp',
                            ...newData
                        }

                    } else if (doc.data().tags.filter( tag => tag.match('#camp')).length > 0) {
                        newData = {
                            typeOfEvent: 'camp',
                            ...newData
                        }
                    } else if (doc.data().tags.filter( tag => tag.match('#museum')).length > 0) {
                        newData = {
                            typeOfEvent: 'museum',
                            ...newData
                        }
                    } else if (doc.data().frequency.match('daily')){
                        newData = {
                            typeOfEvent: 'daily',
                            ...newData
                        }
                    } else if (doc.data().frequency.match('weekly') || doc.data().frequency.match('monthly') || doc.data().frequency.match('once') ) {
                        newData = {
                            typeOfEvent: 'event',
                            ...newData
                        }
                    }

                    newAllEvents[doc.id] = newData
                })

                const tmpAllEvents = []
                const tmpVisibleEvents = []

                Object.keys(newAllEvents).forEach(event => {
                    tmpAllEvents.push(newAllEvents[event])
                })

                Object.keys(newVisibleEvents).forEach(event => {
                    tmpVisibleEvents.push(newVisibleEvents[event])
                })

                setAllEventsFromFB(tmpAllEvents)
                setTimeout(() => setIsDataLoading(false), 500)
            }

            run()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [initialSetting])

    useEffect(() => {
        if (idEventOnListItem === prevIdEventOnListItem) {
            setPrevIdEventOnListItem(null)
        }
    }, [idEventOnListItem, prevIdEventOnListItem])

// ----------------------------------FILTERING------------------------------------- //
    useEffect(() => {
        const newVisible = allEventsFromFB.filter(({ location, type, tags, about, name, metro, note, organizer, recommendAge, startDateTime, endDateTime, id }) => {
            if (currentTabFilter(currentTab, type, tags)) {
                if (savedFilter(isSaved, user.savedEvents, id)) {
                    if ( !filters.cityName || cityFilter( filters.cityName, location.city )) {
                        if ( !filters.searchText || searchBoxFilter( filters.searchText, about, name, metro, note, organizer, tags )) {
                            if ( categoryFilter(filters.category, tags )) {
                                if ( ageFilter(filters.age, recommendAge) ) {
                                    if ( dateFilter(filters.date, startDateTime, endDateTime )){
                                        // return isEventOnVisibleMapArea( location.GPSCoordinates )
                                        return true
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return false
        })

        setVisibleEvents(newVisible)

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, useDeepCompare ([
            allEventsFromFB,
            // allEventsFromFB.length,
            filters,
            // filters.cityName,
            // filters.searchText,
            // filters.searchText.value,
            // filters.age,
            // filters.date,
            // filters.category,
            isLoggedIn,
            isSaved,
            user.savedEvents,
            currentTab,
            // tabBoundaries,
        ]))

// ----------------------------------MAP MARKERS------------------------------------- //
    const myMarkers = useMemo(() => {
        const tmp = []
        visibleEvents.forEach(event => {
            tmp.push({
                id: event.id,
                lat: event.location.GPSCoordinates.latitude,
                lng: event.location.GPSCoordinates.longitude,
                text: 'Free',
                like: false,
                type: event.type,
                tags: event.tags,
                price: event.price,
                img: event.image.downloadURL,
                imgSmall: event.image.downloadURLSmall,
                eventName: event.name,
                eventOrganizer: event.organizer,
            })
        } )

        return tmp
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, useDeepCompare([visibleEvents]))

    const handleReloadCloseTab = () =>  {
        if ('id' in user) {
            let tabName = TAB_NAME_SAVED
            if (currentTab) {
                tabName = currentTab.filterTabName
            }   
            const geo = tabBoundaries && {
                ...tabBoundaries[tabName]
            }

            saveFiltersOnFirebase(
                user.id,
                { 
                    ...user.webFilterSettings, 
                    currentTabName: tabName,
                    [tabName]: { geo }
                },
                mobileNavOpened ? prevFilters : filters,
                tabName
            )

            const x = {
                [tabName]: {
                    ...filters
                }
            }

            sessionStorage.setItem('currentTabName', tabName);
        }
    }

    const onceHandleReloadCloseTab = once(handleReloadCloseTab)

    window.onunload = window.onbeforeunload = () => {
        onceHandleReloadCloseTab()
    }

    window.onpagehide = () => {
        onceHandleReloadCloseTab()
    }

    const handleChangeVisibleBoundaries = (newVisibleEventsForListView) => {
        const tmp = visibleEvents.filter(visEvent => {
            for (let i = 0; i < newVisibleEventsForListView.length; i++) {
                if (newVisibleEventsForListView[i].label.id === visEvent.id) {
                    return true
                }
            }
            return false
        })
        setVisibleEventsForListView(tmp)
    }

    const saveFiltersOnFirebase = (userID, webFilterSettings, filters, tabName, whoCall ) => {
        const filtersIsEqual = compareOfFilters(webFilterSettings[tabName], filters)
        const {currentTabName} = webFilterSettings
        if (!filtersIsEqual || currentTabName !== tabName) {
            console.log('saveFiltersOnFirebase - ', whoCall )
            updateWebFilterSettings(userID, tabName, {
                ...webFilterSettings,
                [tabName]: {
                    ...webFilterSettings[tabName],
                    ...filters, 
                },
                
            })
        }
    }


    return (
        <Router history={history}>
            <SettingsContext.Provider value={initialSetting}>
                <HandelsContext.Provider
                    value={{
                        setShowSignInMenu,
                        setIsTimeoutEnd,
                        handleToggleBurgerMenu,
                        handleToggleFilter,
                        handlerSearchByCity,
                        handleSaveFilterValue,
                        handleClearAllFilters,
                        handleGogleLogOut,
                        handleGoogleLoginClick,
                        handleFacebookLoginClick,
                        handleSearchTextClick,
                        handleTabClick,
                    }}
                >
                    <Route path='/'>
                        <Container fluid className={classes.WrapperWebApp}>
                            <Row className={mobileNavOpened && 'h-100'}>
                                <Col lg={12} className={classes.Header}>
                                    <NavigationMobile
                                        mobileNavOpened={mobileNavOpened}
                                        filterOpened={filterOpened}
                                        filters={filters}
                                        citiesLookUp={citiesLookUp}
                                        categoryLookUp={categoryLookUp}
                                        isLogIn={isLogIn}
                                        isLoggedIn={isLoggedIn}
                                        isLoading={isLoading}
                                        currentUserInfo={currentUserInfo}
                                        countOfVisibleEvents={visibleEventsForListView.length}
                                        prevFilters={prevFilters}
                                        setPrevFilters={setPrevFilters}
                                        setIsApplyClick={setIsApplyClick}
                                        isApplyClick={isApplyClick}
                                        isSaved={isSaved}
                                        setIsSaved={setIsSaved}
                                        isTimeoutEnd={isTimeoutEnd}
                                        showSignInMenu={showSignInMenu}
                                        currentTab={currentTab}
                                    />

                                </Col>
                            </Row>
                            {!mobileNavOpened && !filterOpened && (
                                <hr style={{ marginTop: 0, marginBottom: '5px'}} />
                            )}

                            {!mobileNavOpened && !filterOpened && (
                                <Row>
                                    <Col lg={12} className={classes.Filters}>
                                        <Filters
                                            filters={filters}
                                            citiesLookUp={citiesLookUp}
                                            tagsLookUp={tagsLookUp}
                                            categoryLookUp={categoryLookUp}
                                            currentTab={currentTab}
                                        />
                                    </Col>
                                </Row>
                            )}

                            <Row className={`${classes.FixHeight} ${mobileNavOpened || filterOpened ? classes.Hidden : ''} `}>
                                <Col lg={8} xl={6} className={`col-xxl-8 col-xxxl-9 ${mobileNavOpened || filterOpened ? classes.Hidden : ''}`}>
                                    <div
                                        id={classes.MapView}
                                        className={`${classes.MapView} ${mapOpened ? classes.Hidden : '' }`}
                                    >
                                        {initialSetting && (
                                            <Suspense fallback={<div>Loading...</div>} >
                                                <CustomGoogleMap
                                                    markers={myMarkers}
                                                    currentPositionButton={true}
                                                    handleChangeVisibleBoundaries={handleChangeVisibleBoundaries}
                                                    currentCity={filters.cityName}
                                                    defaultMapZoomLevel={initialSetting.webDefaultMapZoomLevel}
                                                    handleOpenModal={handleOpenModal}
                                                    idEventOnListItem={idEventOnListItem}
                                                    prevIdEventOnListItem={prevIdEventOnListItem}
                                                    setPrevIdEventOnListItem={setPrevIdEventOnListItem}
                                                    isSaved={isSaved}
                                                    tab={currentTab && currentTab.filterTabName}
                                                    tabBoundaries={tabBoundaries}
                                                    setTabBoundaries={setTabBoundaries}
                                                    isDataLoading={isDataLoading}
                                                />
                                            </Suspense>
                                        )}
                                    </div>
                                </Col>

                                <Col lg={4} xl={6} className={`${classes.ListViewWrapper} ${!mapOpened ? classes.Hidden : '' } col-xxl-4 col-xxxl-3`}>
                                    <div
                                        className={`${classes.ListView} ${!mapOpened ? classes.Hidden : '' }`} >
                                        <Suspense fallback={<div>Loading...</div>} >
                                            <ListView
                                                events={visibleEventsForListView && visibleEventsForListView.length > 0 && visibleEventsForListView}
                                                handleOpenModal={handleOpenModal}
                                                isDataLoading={isDataLoading}
                                                setIdEventOnListItem={setIdEventOnListItem}
                                                setPrevIdEventOnListItem={setPrevIdEventOnListItem}
                                                isLoggedIn={isLoggedIn}
                                                setIsTimeoutEnd={setIsTimeoutEnd}
                                                mapOpened={mapOpened}
                                                currentTab={currentTab}
                                            />
                                        </Suspense>
                                    </div>
                                </Col>
                                {!isLoading && isTimeoutEnd && !isLoggedIn && ( <div className={classes.GreyBackground}></div>)}
                            </Row>

                            {!mobileNavOpened && !filterOpened && (
                                <div
                                    className={`${classes.StickButton}`}
                                    onClick={handleToggleMap}
                                >
                                    <div className={classes.Button}>
                                        {mapOpened ? 'Map' : 'List'}
                                    </div>
                                </div>
                            )}
                        </Container>
                    </Route>

                    <Route path='/events/:eventID'>
                        <Suspense fallback={<div>Loading...</div>}>
                            <DetailsModal
                                events={allEventsFromFB}
                                mapOpened={mapOpened}
                                isLoggedIn={isLoggedIn}
                            />
                        </Suspense>
                    </Route>
                </HandelsContext.Provider>
            </SettingsContext.Provider>
        </Router>
    )
}

function compareOfFilters(oldFilters, newFilters) {
    if (!oldFilters) return false
    if (!newFilters) return false

    for (const key in oldFilters) {
        if (oldFilters.hasOwnProperty(key) && key !== 'geo') {
            // const element = oldFilters[key];
            switch (key) {
                case 'age':
                case 'date':
                    if (!(key in oldFilters) || !(key in newFilters)) {
                        return false
                    }

                    if (oldFilters[key] !== newFilters[key]) {
                        return false
                    }
                    break;
                case 'cityName':
                case 'searchText':
                    if (oldFilters[key].value !== null && newFilters[key].value === null) {
                        return false
                    }
                    if (oldFilters[key].value === null && newFilters[key].value !== null) {
                        return false
                    }
                    if (oldFilters[key].value) {
                        if (oldFilters[key].value['value'] !== newFilters[key].value['value']){
                            return false
                        }
                    }

                    break;
                case 'category':
                    if (oldFilters[key] !== null && newFilters[key] === null) {
                        return false
                    }
                    if (oldFilters[key] === null && newFilters[key] !== null) {
                        return false
                    }
                    for (const categoryKey in oldFilters.category) {
                        if (!newFilters.category[categoryKey]) {
                            return false
                        }
                    }
                    break;
                
                default:
                    break;
            }
        }
    }
    return true
}
