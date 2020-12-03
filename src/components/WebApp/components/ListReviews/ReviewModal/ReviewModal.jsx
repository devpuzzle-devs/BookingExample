import React, { useEffect, useContext, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { ModalBody, Button } from 'reactstrap'
import firebase from '../../../../../firebase'
import history from '../../../../../history'

import { ListReviews } from '../ListReviews'
import { UserCardReview } from '../UserCardReview/UserCardReview'
import { SettingsContext } from '../../../context/settings-context'
import { AverageRating } from '../../CustomRating/AverageRating'

import { 
    addNewReview,
    updateReviewInfoOnEvents,
    updateReviewInfoOnUsers,
    updateCurrentReviewIDAdminSettings,
    updateReviewFB, 
    getReviews
} from '../../../serviceWorkers/firebaseAPI'

import classes from './review-modal.module.scss'
import img_close from '../../../../assets/img/close/close@3x.png'

const REVIEW_WORDS = ['Hated it', 'Disliked it', 'It\'s ok', 'Liked it', 'Loved it!']

const ReviewModal = (props) => {
    const {
        rate,
        reviews,
        isReviewCurrentEvent,
        averageRate,
        countOfReviews,
        currentUser,
        numOfReviews,
        numOfReviewStars,
        eventID,
        setIsReviewCurrentEvent,
        currentReviewEvent,
        isEditReview,
        setIsEditReview,
        setCurrentReviewEvent,
        setIsPostSuccess,
    } = props
    const initialSettings = useContext(SettingsContext)
    const [newReview, setNewReview] = useState({
        numberOfStars: currentReviewEvent ? currentReviewEvent.numberOfStars : rate,
        profileImageDownloadURL: currentReviewEvent ? currentReviewEvent.profileImageDownloadURL : '',
        reviewContent: currentReviewEvent ? currentReviewEvent.reviewContent :  '',
        reviewDateTime: currentReviewEvent ? currentReviewEvent.reviewDateTime :  null,
        reviewID: currentReviewEvent ? currentReviewEvent.reviewID :  0,
        userName: currentReviewEvent ? currentReviewEvent.userName :  '',
        userUID: currentReviewEvent ? currentReviewEvent.userUID :  '',
    })

    const [errors, setErrors] = useState({
        numberOfStars: false,
        reviewContent: false,
    })

    const [newNumOfReviewStars, setNewNumOfReviewStars] = useState(numOfReviewStars)
    const [prevRate, setPrevRate] = useState(isReviewCurrentEvent ? newReview.numberOfStars : 0)

    const [isLoading, setIsLoading] = useState(false)
    // const [isEdit, setIsEdit] = useState(false)

    useEffect(() => {
        if (isEditReview) {
            debugger
            setNewNumOfReviewStars(numOfReviewStars - prevRate + newReview.numberOfStars)
            setPrevRate(newReview.numberOfStars)
        }
        if (currentUser.id) {
            setNewReview({
                ...newReview,
                profileImageDownloadURL: currentUser.profileImage.downloadURL,
                userName: currentUser.userName,
                userUID: currentUser.id,
            })
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser])

    useEffect(() => {
        if (errors.numberOfStars || errors.reviewContent) {
            const validateRate = !!newReview.numberOfStars
            const validateText = newReview.reviewContent.length >= 20
            setErrors({ numberOfStars: !validateRate, reviewContent: !validateText })
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [newReview.numberOfStars, newReview.reviewContent])

    const handleClose = () => {
        history.goBack()
    }

    const isValidAllFields = () => {
        const validateRate = !!newReview.numberOfStars
        const validateText = newReview.reviewContent.length >= 20
        setErrors({ numberOfStars: !validateRate, reviewContent: !validateText })
        return validateRate && validateText
    }

    const saveReview = () => {
        
        if ( isValidAllFields()) {
            let newNumOfReview = 1
            let newNumOfReviewStars = newReview.numberOfStars
            let newNumUserReviews = 1
            let newReviewDocumentLocations = []
            if ( numOfReviews ) {
                newNumOfReview = numOfReviews + 1
                newNumOfReviewStars = numOfReviewStars + newReview.numberOfStars
            } 

            if (currentUser.numReviews) {
                newNumUserReviews = currentUser.numReviews + 1
                newReviewDocumentLocations = currentUser.reviewDocumentLocations.slice()
            } 
            
            const currentDateTime = firebase.firestore.FieldValue.serverTimestamp()
            history.push(`/events/${eventID}`)
            setIsLoading(true)

            addNewReview(eventID, {
                ...newReview, 
                reviewDateTime: currentDateTime,
                reviewID: initialSettings.currentReviewID
            }).then(res => {
                if (res.path === `events/${eventID}/reviews/${res.id}`) {//SUCCESS

                    updateReviewInfoOnEvents(eventID, newNumOfReview, newNumOfReviewStars)
                        .then ( () => setIsLoading(false))
                    newReviewDocumentLocations.push(res.path)
                    updateReviewInfoOnUsers(currentUser.id, newNumUserReviews, newReviewDocumentLocations)

                    updateCurrentReviewIDAdminSettings(initialSettings.docID, ++initialSettings.currentReviewID)

                    setIsPostSuccess(true)
                    setTimeout(() => {
                        setIsPostSuccess(false)
                        history.push(`/events/${eventID}`)
                    }, 3000)
                }
            })
        }
    }

    const updateReview = async () => {
        if ( isValidAllFields()) {
            const currentDateTime = firebase.firestore.FieldValue.serverTimestamp()
            await updateReviewFB(eventID, currentReviewEvent.reviewID, {
                ...newReview,
                reviewDateTime: currentDateTime,
            })
            const reviews = await getReviews(eventID).get()

            let newNumOfReviewStars = 0
            reviews.docs.forEach(review => {
                debugger
                newNumOfReviewStars += review.data().numberOfStars
            })
            reviews.forEach(review => console.log(review))
            setIsEditReview(false)
            updateReviewInfoOnEvents(eventID, reviews.docs.length, newNumOfReviewStars)
        }
    }

    const handleChangeReviewRate = (rate) => {
        setNewReview({...newReview, numberOfStars: rate})
    }

    // const openEditReview = () => {
    //     setIsEdit(true)
    // }

    return (
            <Modal
                show={true}
                onHide={handleClose}
                size='lg'
                className={classes.ReviewModal}
            >   
                <Modal.Header className={classes.Header}>
                    <div className={classes.Title}>Reviews</div>
                    { reviews && reviews.length > 0 && !isLoading && 
                        <AverageRating 
                            averageRate={averageRate}
                            numOfReviews={countOfReviews}
                        />
                    }
                    <div
                        className={classes.CloseModal}
                        onClick={handleClose}
                    >
                        <img src={img_close} alt='' />
                    </div>
                </Modal.Header>

                <ModalBody>                    
                    { (!isReviewCurrentEvent || isEditReview) && 
                        <>
                            <UserCardReview 
                                isShowLogoAndText
                                currentRate={newReview.numberOfStars} 
                                handlerChangeRate={handleChangeReviewRate} 
                                userLogo={newReview.profileImageDownloadURL}
                            />
                            {newReview.numberOfStars &&
                                <div style={{textAlign: 'center'}}> {REVIEW_WORDS[newReview.numberOfStars - 1]}</div>
                            }
                            <textarea
                                className='form-control'
                                id='postText'
                                name='postText'
                                rows='5'
                                value={newReview.reviewContent}
                                onChange={(e) => {
                                    e.preventDefault()
                                    setNewReview({...newReview, reviewContent: e.target.value})
                                }}
                            ></textarea>
                            { errors.numberOfStars && 
                                <div className={classes.ErrorMessage}>Please select the star rating</div>
                            }
                            { errors.reviewContent && 
                                <div className={classes.ErrorMessage}>Please share your experience with at least 20 characters to help other in the community</div>
                            }
                            { !isEditReview && 
                                <Button variant='primary' className={classes.PostButton}
                                    onClick={() => {
                                        saveReview()
                                }}>
                                    Post review
                                </Button>
                            }

                            { isEditReview &&
                                <>
                                    <Button 
                                        className={classes.EditButtons}
                                        variant='primary'
                                        onClick={updateReview} 
                                    >
                                        Update review
                                    </Button>
                                    <Button 
                                        className={classes.EditButtons}
                                        variant='primary' 
                                        onClick={() => setIsEditReview(false)}>
                                        Cancel
                                    </Button>
                                </>
                            }
                        </>
                    }

                    {reviews && reviews.length > 0 &&
                        <ListReviews 
                            reviews={reviews}
                            numOfReviewStarsEvent={numOfReviewStars}
                            numOfReviewsEvent={numOfReviews}
                            setIsReviewCurrentEvent={setIsReviewCurrentEvent}
                            openEditReview={() => setIsEditReview(true)}
                            setNewReview={setNewReview}
                            setCurrentReviewEvent={setCurrentReviewEvent}
                        />
                    }


                </ModalBody>

            </Modal>
    )
}

export default ReviewModal