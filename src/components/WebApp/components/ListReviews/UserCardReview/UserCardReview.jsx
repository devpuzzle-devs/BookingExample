import React from 'react'
import { CustomRating } from '../../CustomRating/CustomRating'

import classes from './user-card-review.module.scss'

export const UserCardReview = ({currentRate, handlerChangeRate, isShowLogoAndText, userLogo}) => {
    return (
        <div className={classes.Wrapper}>
            { isShowLogoAndText &&
                <>
                    <img className={classes.ImageLogo} src={userLogo} alt="" />
                    <div className={classes.RateReview}>Rate and review</div>
                    <div className={classes.Text} >Share your experience to help others</div>
                </>
            }
            <CustomRating
                initialRating={currentRate}
                onChange={r => {
                    handlerChangeRate(r)
                }}
            />
        </div>
    )
}
