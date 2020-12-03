import React from 'react'
import { CustomRating } from './CustomRating'

import classes from './average-rating.module.scss'

export const AverageRating = ({averageRate, numOfReviews}) => {
    return (
        <div className={classes.WrapperAverageRating}>
            <div className={classes.Numbers}>{averageRate}</div>
            <div>
                <CustomRating
                    readonly
                    smallIcon
                    initialRating={averageRate}
                />
            </div>
            <div className={classes.Numbers}>({numOfReviews})</div>
        </div>
    )
}
