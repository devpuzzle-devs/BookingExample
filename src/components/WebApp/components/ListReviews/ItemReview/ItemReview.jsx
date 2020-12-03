import React, { useEffect, useState, useContext } from 'react'
import { Row, Col } from 'reactstrap'

import { CustomRating } from '../../CustomRating/CustomRating'
import { SettingsButton } from '../../SettingsButton/SettingsButton'
import { TestUserContext } from '../../../../../user-context'
import { SettingsContext } from '../../../context/settings-context'
import { CustomPopover } from '../../CustomPopover/CustomPopover'
import {
    getUserNumberOfReviews,
    updateReviewInfoOnEvents,
    updateReviewInfoOnUsers,
    updateCurrentReviewIDAdminSettings,
} from '../../../serviceWorkers/firebaseAPI'

import classes from './item-review.module.scss'

const getDateEqual = date => {
    const currentDate = new Date()
    if (currentDate.getFullYear() - date.toDate().getFullYear() > 0) {
        const timePassed = currentDate.getFullYear() - date.toDate().getFullYear()
        return `${timePassed} ${timePassed === 1 ? 'year' : 'years'} ago`
    }
    if (currentDate.getMonth() - date.toDate().getMonth() > 0) {
        const timePassed = currentDate.getMonth() - date.toDate().getMonth()
        return `${timePassed} ${timePassed === 1 ? 'month' : 'months'} ago`
    }
    if (currentDate.getDate() - date.toDate().getDate() > 0) {
        const timePassed = currentDate.getDate() - date.toDate().getDate()
        return `${timePassed} ${timePassed === 1 ? 'day' : 'days'} ago`
    }
    if (currentDate.getHours() - date.toDate().getHours() > 0) {
        const timePassed = currentDate.getHours() - date.toDate().getHours()
        return `${timePassed} ${timePassed === 1 ? 'hour' : 'hours'} ago`
    }
    if (currentDate.getMinutes() - date.toDate().getMinutes() > 0) {
        const timePassed = currentDate.getMinutes() - date.toDate().getMinutes()
        return `${timePassed} ${timePassed === 1 ? 'minute' : 'minutes'} ago`
    }
    if (currentDate.getSeconds() - date.toDate().getSeconds() > 0) {
        const timePassed = currentDate.getSeconds() - date.toDate().getSeconds()
        return `${timePassed} ${timePassed === 1 ? 'second' : 'seconds'} ago`
    }
    return 'now'
}

export const ItemReview = (props) => {
    const {
        review,
        numOfReviewsEvent,
        numOfReviewStarsEvent,
        handleDeleteClick,
        setIsReviewCurrentEvent,
        openEditReview,
        setNewReview,
        setCurrentReviewEvent,
    } = props
    const {
        userName,
        reviewContent,
        numberOfStars,
        profileImageDownloadURL,
        userUID,
        reviewDateTime,
        eventID,
        reviewID,
    } = review

    const currentUser = useContext(TestUserContext)
    const initialSettings = useContext(SettingsContext)

    const [numberOfReview, setNumberOfReview] = useState(0)    

    let textDate = null
    if (reviewDateTime) textDate = getDateEqual(reviewDateTime)
    
    useEffect(() => {
        getUserNumberOfReviews(userUID).then( res => setNumberOfReview(res))
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const [showReviewSettings, setShowReviewSettings] = useState(false)  

    const handleMenuClick = () => {
        setShowReviewSettings(!showReviewSettings)
    }

    const deleteReview = () => {
        setShowReviewSettings(false)
        setIsReviewCurrentEvent(false)
        setCurrentReviewEvent(null)
        if (setNewReview) {
            setNewReview({
                numberOfStars: null,
                profileImageDownloadURL: '',
                reviewContent: '',
                reviewDateTime: null,
                reviewID: 0,
                userName: '',
                userUID: '',
            })
        }
        handleDeleteClick(eventID, reviewID)
            .then(res => {
                const newNumOfReview = numOfReviewsEvent - 1
                const newNumOfReviewStars = numOfReviewStarsEvent - numberOfStars
                updateReviewInfoOnEvents(eventID, newNumOfReview, newNumOfReviewStars)

                const newNumUserReviews = currentUser.numOfReviews - 1
                const newReviewDocumentLocations = currentUser.reviewDocumentLocations
                    .filter(docLocation => `events/${eventID}/reviews/${reviewID}` !== docLocation)
                updateReviewInfoOnUsers(currentUser.id, newNumUserReviews, newReviewDocumentLocations)

                updateCurrentReviewIDAdminSettings(initialSettings.docID, --initialSettings.currentReviewID)
            })
    }

    return (

        <Row className={classes.WrapperItemReview}>

            <Col lg={11}>
                <Row >
                    <img src={profileImageDownloadURL} alt="" className={classes.ReviewLogo} />
                    <Col lg={10}>
                        <div className={classes.ReviewEmail} >{userName}</div>
                        <div className={classes.ReviewTest} > test </div>
                    </Col>
                </Row>
            </Col>

            { currentUser.id === userUID && 
                <Col lg={1}> 
                    <div>
                        <SettingsButton 
                            handleToggleBurgerMenu={() => {
                                handleMenuClick()
                            }} 
                        />
                        {showReviewSettings &&
                            <div className={classes.ReviewSettingWrapper}>
                                <CustomPopover buttonOff >
                                    <div 
                                        className={classes.ReviewSettingItem}
                                        onClick={() => {
                                            setShowReviewSettings(false)
                                            openEditReview()
                                        }}
                                    >Edit</div>
                                    <div 
                                        onClick={deleteReview}
                                        className={classes.ReviewSettingItem}
                                    >Delete</div>
                                </CustomPopover>
                                <div className={classes.Background} onClick={() => setShowReviewSettings(false)}></div>
                            </div>
                        }
                    </div>
                </Col>
            }

            <Col lg={12}>
                <CustomRating readonly smallIcon initialRating={numberOfStars} />
                <span className={classes.ReviewDate}>{textDate}</span>
            </Col>

            <Col lg={12}>
                <div className={classes.ReviewText}> {reviewContent} </div>
            </Col>

            <Col >
                <span >{review.numberOfLikes}</span>
            </Col>
        </Row>
    )
}
