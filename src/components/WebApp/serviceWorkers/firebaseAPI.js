import { db } from "../../../firebase"

export const getEvents = (webMetrosList) => {
    return db
            .collection('events')
            .where('activeFlag', '==', true)
            .where('approvedFlag', '==', true)
            .orderBy('location.GPSCoordinates')
            .get()
}

export const getOvernightCamps = () => {
    return db
            .collection('events')
            .where('activeFlag', '==', true)
            .where('approvedFlag', '==', true)
            .where('type', '==', 'camp')
            .get()
}

export const getCitiesLookUp = () => {
    return db
            .collection('citiesLookUp')
            .orderBy('city')
            .get()
}

export const getTagsLookUp = () => {
    return db
            .collection('tagsLookUp')
            .orderBy('name')
            .get()
}

export const getCategoryLookUp = () => {
    return db
            .collection('categoryLookUp')
            .where('displayIndex', '>', 0)
            .orderBy('displayIndex')
            .get()
}

export const getAdminSettings = () => {
    return db.collection('adminSettings')
}

export const getEvent = (eventID) => {
    return db.collection('events').doc(eventID)
}

export const updateSavedEvent = (userId, savedEvents) => {
    return db
    .collection('users')
    .doc(userId)
    .update('savedEvents', savedEvents)
    .then(res => {
        
    })
    .catch(err => {
        
    })
} 

export const updateWebFilterSettings = (userId, tabName, webFilterSettings) => {
    if (webFilterSettings.tabCamp.searchText && webFilterSettings.tabCamp.searchText.value) {
        delete webFilterSettings.tabCamp.searchText.value.__isNew__
    }
    if (webFilterSettings.tabMuseumAndFreeDays.searchText && webFilterSettings.tabMuseumAndFreeDays.searchText.value) {
        delete webFilterSettings.tabMuseumAndFreeDays.searchText.value.__isNew__
    }
    if (webFilterSettings.tabSaved.searchText && webFilterSettings.tabSaved.searchText.value) {
        delete webFilterSettings.tabSaved.searchText.value.__isNew__
    }
    if (webFilterSettings.tabSaved.geo) {
        delete webFilterSettings.tabSaved.geo
    }
    return db
    .collection('users')
    .doc(userId)
    .update(`webFilterSettings`, webFilterSettings)
    .then(res => {
    })
    .catch(err => {
    })
} 

export const updateWebFilterSettingsGeo = (userId, tabName, geo) => {
    return db
    .collection('users')
    .doc(userId)
    .update(`webFilterSettings.${tabName}.geo`, geo)
    .then(res => {
    })
    .catch(err => {
    })
} 

export const getReviews = (eventID) => {
    return db
        .collection('events')
        .doc(eventID)
        .collection('reviews')
        .orderBy('reviewDateTime', 'desc')
}

export const addNewReview = (eventID, review) => {
    return db
        .collection('events')
        .doc(eventID)
        .collection('reviews')
        .add({...review})
        .then(res => res)
        .catch(err =>  err)
}

export const updateReviewFB = (eventID, reviewId, review) => {
    const {reviewContent, numberOfStars, reviewDateTime} = review
    return db
        .collection('events')
        .doc(eventID)
        .collection('reviews')
        .doc(reviewId)
        .update('reviewContent', reviewContent, 'numberOfStars', numberOfStars, 'reviewDateTime', reviewDateTime)
        .then(res => res)
        .catch(err =>  err)
}

export const deleteReview = (eventID, reviewId) => {
    return db
        .collection('events')
        .doc(eventID)
        .collection('reviews')
        .doc(reviewId)
        .delete()
        .then(res => res)
        .catch(err =>  err)
}

export const updateCurrentReviewIDAdminSettings = (docID, newReviewID) => {
    return db
        .collection('adminSettings')
        .doc(docID)
        .update('currentReviewID', newReviewID)
        .then( res => res )
        .catch( err => err )
}

export const updateReviewInfoOnEvents = (eventID, numOfReviews, numOfReviewStars) => {
    return db
    .collection('events')
    .doc(eventID)
    .update('numOfReviews', numOfReviews, 'numOfReviewStars', numOfReviewStars)
    .then(res => {
    })
    .catch(err => {
    })
} 

export const updateReviewInfoOnUsers = (userID, numReviews, reviewDocumentLocations ) => {
    return db
    .collection('users')
    .doc(userID)
    .update('numReviews', numReviews, 'reviewDocumentLocations', reviewDocumentLocations)
    .then(res => {
    })
    .catch(err => {
    })
} 

export const getUserNumberOfReviews = (userId) => {
    return db
        .collection('users')
        .doc(userId)
        .get()
        .then(res => {
            
            return res.data().numReviews
        })
        .catch(err => {
            return err
        })
}   