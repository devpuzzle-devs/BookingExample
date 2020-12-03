import React from 'react'
import { ItemReview } from './ItemReview/ItemReview'
import { deleteReview } from '../../serviceWorkers/firebaseAPI'

export const ListReviews = (props) => {
    const {
        reviews,
        numOfReviewsEvent,
        numOfReviewStarsEvent,
        setIsReviewCurrentEvent,
        openEditReview,
        setNewReview,
        setCurrentReviewEvent,
    } = props
    const showAllReviews = reviews.map((review, index) => {
        return (
            <ItemReview 
                key={`ItemReview-${index}`} 
                review={review} 
                handleDeleteClick={deleteReview}
                numOfReviewStarsEvent={numOfReviewStarsEvent}
                numOfReviewsEvent={numOfReviewsEvent}
                setIsReviewCurrentEvent={setIsReviewCurrentEvent}
                openEditReview={openEditReview}
                setNewReview={setNewReview}
                setCurrentReviewEvent={setCurrentReviewEvent}
            />
        )
    })
    return (
        <div>
            {showAllReviews}
        </div>
    )
}
