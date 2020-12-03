import React from 'react'
import { ListItem } from './ListItem/ListItem'
import VisibilitySensor from 'react-visibility-sensor'

// import classes from './list-item.module.scss'

const EMPTY_EVENT = {
    startDateTime: '',
    endDateTime: '',
    name: '',
    type: '',
    image: '',
    tags: [],
    id: '',
    price: '',
}
export const ListView = ( props ) => {
    const {
        events,
        handleOpenModal,
        isDataLoading,
        setIdEventOnListItem,
        setPrevIdEventOnListItem,
        isLoggedIn,
        mapOpened,
        currentTab,
    } = props

    let tempText = 'camps and museums'
    if (currentTab && currentTab.name === 'summer_camp') tempText = 'camps'
    if (currentTab && currentTab.name === 'museum_free_days') tempText = 'museums'
    const textFound = `Not ${tempText} found`

    const arrayList = events ? events.map(event => {
        const eventInfo = {
            startDateTime: event.startDateTime,
            endDateTime: event.endDateTime,
            name: event.name,
            organizer: event.organizer,
            type: event.typeOfEvent,
            image: event.image,
            tags: event.tags,
            id: event.id,
            price: event.price,
        }

        return (
            <VisibilitySensor
                key={event.id}  
                intervalDelay={2000}
                offset={{ top: -400, bottom: -400 }}
            >
                {({ isVisible }) => {
                    return (
                        <ListItem
                            handleOpenModal={handleOpenModal}
                            eventInfo={isVisible ? eventInfo : EMPTY_EVENT}
                            setIdEventOnListItem={setIdEventOnListItem}
                            setPrevIdEventOnListItem={setPrevIdEventOnListItem}
                            isLoggedIn={isLoggedIn}
                            mapOpened={mapOpened}
                        />
                    )
                }}
            </VisibilitySensor>
        )
    }) : <div>{isDataLoading && events.length !== 0 ? 'Loading...' : textFound}</div>
    return (
        <>
            <div className="row">
                {arrayList}
            </div>

        </>
    )
}
