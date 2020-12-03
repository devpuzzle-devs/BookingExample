import React from 'react'
import { Information } from '../../Information/Information'
import { ImageOfEvent } from '../../ImageOfEvent/ImageOfEvent'
import { Favorite } from '../../Favorite/Favorite'

import classes from './list-item.module.scss'

export const ListItem = ({eventInfo, handleOpenModal, setIdEventOnListItem, setPrevIdEventOnListItem, isLoggedIn, mapOpened}) => {
    const { type, image, tags, id } = eventInfo
    return (
        <>
            <div className='col-12 col-sm-6 col-md-6 col-lg-12 col-xl-6'>
                <div className={`card ${classes.Card}`}
                    onMouseEnter={ () => {
                        setIdEventOnListItem(id)
                    }}
                    onMouseLeave={ () => {
                        setIdEventOnListItem(null)
                        setPrevIdEventOnListItem(id)
                    }}
                >

                    <ImageOfEvent
                        handleImageClick={() => handleOpenModal(id)}
                        type={type}
                        image={image.downloadURL}
                        tags={tags}
                        someOtherClassNames='card-img-top'
                    >
                        <Favorite 
                            className={`${classes.Favorite}`} 
                            id={id} 
                            isLoggedIn={isLoggedIn} 
                            isMobile={mapOpened}
                            />
                    </ImageOfEvent>
                        <div className='card-body'>
                            <Information eventInfo={eventInfo} />
                        </div>
                </div>
            </div>
        </>
    )
}
