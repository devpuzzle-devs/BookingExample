import React from 'react'
import { ImageOfEvent } from '../../ImageOfEvent/ImageOfEvent'

import './info-window-gm.scss'
import classes from './info-window-gm.module.scss'

export const InfoWindowGM = ({ img, eventName, eventOrganizer, tags, id, price }) => {
    const textPrice = `$${price.min}+`

    return (
        <div id={id} className={classes.ID}>
            <ImageOfEvent image={img} tags={tags}>
                <div className={classes.Info} >
                    <div className={classes.EventName} >{eventName}</div>
                    <div className={classes.OrganizerName} >{ textPrice } - { eventOrganizer }</div>
                </div>
            </ImageOfEvent>
        </div>
    )
}
