import React from 'react'
import classes from './information.module.scss'

// const TYPES = ['camp', 'event', 'daily']
export const Information = ({eventInfo}) => {
    const {name, type, startDateTime, endDateTime, organizer, price } = eventInfo
    const formatedStartTime = startDateTime && startDateTime.toDate().toLocaleString('en-US', { hour: 'numeric', hour12: true }).replace(' ', '')
    const formatedEndtTime = endDateTime && endDateTime.toDate().toLocaleString('en-US', { hour: 'numeric', hour12: true }).replace(' ', '')

    const formatStartMonth = startDateTime && startDateTime.toDate().toLocaleDateString('en-US', {month: 'short'})
    const formatStartDay = startDateTime && startDateTime.toDate().toLocaleDateString('en-US', {day: '2-digit'})
    const formatEndMonth = endDateTime && endDateTime.toDate().toLocaleDateString('en-US', {month: 'short'})
    const formatEndDay = endDateTime && endDateTime.toDate().toLocaleDateString('en-US', {day: '2-digit'})
    const formatStartDayName = startDateTime && startDateTime.toDate().toLocaleDateString('en-US', {weekday: 'long'})
    const textPrice = `$${price.min}+`

    return (
        <div className={`card-title ${classes.Info}`}>
            {
                type === 'event' ?
                <>
                    <div className={classes.InfoItem}>
                        <div id={classes.Mounth}>{ formatStartMonth }</div>
                        <div id={classes.Days}>{ formatStartDay }</div>
                    </div>

                    <div className={classes.InfoItem}>
                        <div id={classes.TimeAndDayOfWeek}>
                            { formatStartDayName } · {formatedStartTime} - {formatedEndtTime}
                        </div>
                        <div id={classes.Price}>Free admission</div>
                        <div id={classes.EventName}>{name}</div>
                    </div>
                </>
                : null
            }

            {
                type === 'daily' ?
                <>
                    <div className={classes.InfoItem}>
                        <div id={classes.TimeAndDayOfWeek}>
                            { formatStartDayName } · {formatedStartTime} - {formatedEndtTime}
                        </div>
                        <div id={classes.Price}>{name}</div>
                    </div>
                </>
                : null
            }

            {
                type === 'camp' ?
                    <>
                        <div className={classes.InfoCampItem  }>
                            <div id={classes.Mounth}>{ formatStartMonth }</div>
                            <div id={classes.Days}>{ formatStartDay }</div>
                        </div>

                        <div id={classes.Splitter} className={classes.InfoItem}>
                            <div id={classes.Mounth}></div>
                            <div id={classes.Days}> - </div>
                        </div>

                        <div className={classes.InfoCampItem}>
                            <div id={classes.Mounth}>{ formatEndMonth }</div>
                            <div id={classes.Days}>{ formatEndDay }</div>
                        </div>

                        <div className={classes.InfoItem}>
                            <div id={classes.CampName}>{ name }</div>
                            <div id={classes.Organizer}>{ textPrice } - { organizer }</div>
                        </div>
                    </>
                : null
            }

            {
                type === 'museum' ?
                    <>
                        <div className={classes.InfoItem}>
                            <div id={classes.CampName}>{ name }</div>
                            <div id={classes.Organizer}>{ textPrice } - { organizer }</div>
                        </div>
                    </>
                : null
            }
        </div>

    )
}
