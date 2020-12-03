import React, { useEffect, useState, useContext, Suspense } from 'react'
import { ModalBody, Modal, Col, Row, Tooltip, OverlayTrigger, Toast } from 'react-bootstrap';
import { useParams, Route, Router } from "react-router-dom";
import copyToClipboard from 'copy-to-clipboard';

import { ImageOfEvent } from '../../components/ImageOfEvent/ImageOfEvent';
import { CollapseText } from '../../components/CollapseText/CollapseText';
import { CollapseComponent } from '../../components/CollapseComponent/CollapseComponent';
import { Favorite } from '../../components/Favorite/Favorite';
import { SimpleMap } from '../MapView/SimpleMap';
import { ShareButton } from '../ShareButton/ShareButton';
import history from '../../../../history';
import { db } from '../../../../firebase';

import { getReviews, getEvent } from '../../serviceWorkers/firebaseAPI';
import { TestUserContext } from '../../../../user-context';
import { ListReviews } from '../ListReviews/ListReviews';
import { UserCardReview } from '../UserCardReview/UserCardReview';
import { AverageRating } from '../CustomRating/AverageRating';

import classes from './details-modal.module.scss'
import img_close from '../../../../assets/img/close/close@3x.png'
import img_arrow_back from '../../../../assets/img/arrow-back/arrow-back@3x.png'
import { PostSuccess } from '../PostSuccess/PostSuccess';
import { SettingsContext } from '../../context/settings-context';
const ReviewModal = React.lazy( async () =>  import('../ReviewModal/ReviewModal'))

const DAYS_OF_WEEK = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

const DetailsModal = (props) => {
    const { mapOpened, isLoggedIn } = props
    const {eventID} = useParams()
    const [sessions, setSessions] = useState(null)
    const [showToast, setShowToast] = useState(false)
    const [showToastShare, setShowToastShare] = useState(false)
    const [showToastShareForMobile, setShowToastShareForMobile] = useState(false)
    const [showToastEmailUs, setShowToastEmailUs] = useState(false)
    const [state, setState] = useState({
        isLoading: false,
        error: false,
        event: null,
        typeOfEvent: null
    })

    const [eventReviews, setEventReviews] = useState(null)
    const [isReviewCurrentEvent, setIsReviewCurrentEvent] = useState(false)
    const [currentReviewEvent, setCurrentReviewEvent] = useState(null)
    const [reviewRate, setReviewRate] = useState(null)
    const [averageRate, setAverageRate] = useState(null)
    const [isEditReview, setIsEditReview] = useState(false)
    const [isPostSuccess, setIsPostSuccess] = useState(false)

    const user = useContext(TestUserContext)
    const initialSettings = useContext(SettingsContext)

    useEffect(() => {
        getEvent(eventID).onSnapshot( snapshot => {
            setState({...state, event: snapshot.data()})
            setAverageRate(parseFloat((snapshot.data().numOfReviewStars / snapshot.data().numOfReviews).toFixed(1)))
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
        if ( state.typeOfEvent === 'camp') {
            db.collection('events').doc(eventID).collection('campSessions').get()
                .then(res => {
                    const listOfSessions = []
                    res.docs.forEach(doc => {
                        const session = {
                            id: doc.id,
                            ...doc.data(),
                        }
                        listOfSessions.push(session)
                    });
                    setSessions(listOfSessions)
                })
                .catch(err => console.log('Camp Session ERR', err))
        }

        if (eventID) {
            // Farmers' Market
            getReviews(eventID).onSnapshot( snapshotReview => {
                let tmpCounter = 0
                setEventReviews(snapshotReview.docs.map( review => {
                    if (user.id === review.data().userUID) {
                        setIsReviewCurrentEvent(true)
                        setCurrentReviewEvent({...review.data(), reviewID: review.id})
                        tmpCounter++
                    }
                    return {...review.data(), eventID, reviewID: review.id }
                }))
                if (!tmpCounter && isReviewCurrentEvent) {
                    setIsReviewCurrentEvent(false)
                    setCurrentReviewEvent(null)
                }
            })
        }

    }, [eventID, state.typeOfEvent, user.id])

    const handleClose = () => {
        history.push('/')
    }

    const openReviewModal = rate => {
        setReviewRate(rate)
        history.push(`/events/${eventID}/reviews`)
    }

    const emailUs = (
        <span className={classes.BlueText} onClick={() => {
            setShowToastEmailUs(true)
            copyToClipboard('test@gmail.com')
        }}
        > test@gmail.com
            <Toast
                className={classes.ToastEmailUs}
                onClose={() => setShowToastEmailUs(false)}
                show={showToastEmailUs}
                delay={2000}
                autohide
            >
                <Toast.Body>
                    Copied Email to clipboard
                </Toast.Body>
            </Toast>
        </span>
    )

    return (
        <>
            {state.isLoading && <div>LOADING</div>}
            {state.event && (
                <Modal
                    show={true}
                    onHide={handleClose}
                    size='lg'
                    className={classes.Modal}
                >
                    {/* ------------------MobileNavigation--------------------------- */}
                    <div className={classes.WrapperDetailMobileNavigation}>
                        <div className={classes.Back} onClick={handleClose}>
                            <img src={img_arrow_back} alt='' />
                        </div>
                        <ShareButton showToast={setShowToastShareForMobile}>
                            <Toast
                                className={classes.ShortLinkMessageForMobile}
                                onClose={() =>
                                    setShowToastShareForMobile(false)
                                }
                                show={showToastShareForMobile}
                                delay={2000}
                                autohide
                            >
                                <Toast.Body>
                                    Copied Link to clipboard
                                </Toast.Body>
                            </Toast>
                        </ShareButton>
                        <Favorite
                            className={classes.Favorite}
                            id={eventID}
                            handleDetailsModal={handleClose}
                            isMobile={mapOpened}
                            isLoggedIn={isLoggedIn}
                        />
                    </div>

                    {/* ------------------IMAGE--------------------------- */}
                    <ImageOfEvent
                        type={state.typeOfEvent}
                        image={state.event.image.downloadURL}
                        someOtherClassNames='w-100'
                        tags={state.event.tags}
                    >
                        <div className={classes.WrapperFavClose}>
                            <Favorite
                                className={`${classes.Favorite} HiddenOnMobile`}
                                id={eventID}
                                handleDetailsModal={handleClose}
                                isLoggedIn={isLoggedIn}
                            />
                            <div
                                className={`${classes.CloseModal} HiddenOnMobile`}
                                onClick={handleClose}
                            >
                                <img src={img_close} alt='' />
                            </div>
                        </div>
                    </ImageOfEvent>

                    <ModalBody>
                        {/* ------------------NAME OF EVENT--------------------------- */}
                        <Row className={classes.Test1}>
                            <div>
                                <div
                                    className={
                                        classes.EventCampName +
                                        ' ' +
                                        classes.Header
                                    }
                                >
                                    {state.event && state.event.name}
                                </div>
                                
                                {state.typeOfEvent !== 'daily' && (
                                    <div className={classes.Organizer}>
                                        {state.event && state.event.organizer}
                                    </div>
                                )}

                                { eventReviews && eventReviews.length > 0  ? 
                                    <div onClick={() => openReviewModal()}>
                                        <AverageRating 
                                            averageRate={averageRate}
                                            numOfReviews={state.event && state.event.numOfReviews}
                                        />
                                    </div>
                                    : 
                                    <div 
                                        className={classes.ReviewClicableText}
                                        onClick={() => openReviewModal()}>No reviews</div>
                                }
                            </div>

                            <ShareButton
                                className={classes.ShareButtonMedia}
                                showToast={setShowToastShare}
                            >
                                Share
                                <Toast
                                    className={classes.ShortLinkMessage}
                                    onClose={() => setShowToastShare(false)}
                                    show={showToastShare}
                                    delay={2000}
                                    autohide
                                >
                                    <Toast.Body>
                                        Copied Link to clipboard
                                    </Toast.Body>
                                </Toast>
                            </ShareButton>
                        </Row>
                        <hr />

                        {/* ------------------DETAILS--------------------------- */}
                        <Row>
                            <Col lg={12}>
                                <div className={classes.Header}>Details</div>
                                <CollapseText
                                    text={state.event && state.event.about}
                                />

                                <div className={classes.Tags}>
                                    {state.event &&
                                        state.event.tags.map((tag, index) => {
                                            return (
                                                <span
                                                    key={`tag-${index}`}
                                                    className={classes.Tag}
                                                >
                                                    {tag}
                                                </span>
                                            )
                                        })}
                                </div>
                            </Col>
                        </Row>
                        <hr />

                        {/* ------------------ABOUT INFO--------------------------- */}
                        {state.typeOfEvent === 'event' && (
                            <>
                                <Row className={classes.Header}>
                                    <Col xs={6} sm={4} lg={2}>
                                        <div>Price</div>
                                    </Col>

                                    <Col xs={6} sm={4} lg={2}>
                                        <div>Age</div>
                                    </Col>
                                </Row>

                                <Row className='mt-3'>
                                    <Col xs={6} sm={4} lg={2}>
                                        {state.event &&
                                        !state.event.price.max &&
                                        !state.event.price.min ? (
                                            <span className={classes.BtnFree}>
                                                Free
                                            </span>
                                        ) : (
                                            <span className={classes.BtnFree}>
                                                $
                                                {state.event &&
                                                    state.event.price.max}
                                            </span>
                                        )}
                                    </Col>
                                    <Col xs={6} sm={4} lg={2}>
                                        <span className={classes.BtnAge}>
                                            {state.event &&
                                                state.event.recommendAge.min}
                                            -
                                            {state.event &&
                                                state.event.recommendAge.max}
                                        </span>
                                    </Col>
                                </Row>
                                <hr />
                            </>
                        )}

                        {state.typeOfEvent === 'detail' && (
                            <>
                                <Row className={classes.Header}>
                                    <Col lg={4}>
                                        <div>Opening days</div>
                                    </Col>

                                    <Col lg={4}></Col>

                                    <Col lg={2}>
                                        <div>Price</div>
                                    </Col>

                                    <Col lg={2}>
                                        <div>Age</div>
                                    </Col>
                                </Row>

                                <Row className='mt-3'>
                                    <Col lg={8}>
                                        {DAYS_OF_WEEK.map((day, index) => {
                                            const isClose =
                                                state.event &&
                                                state.event.closeOnWeekdays.filter(
                                                    numberDayWhenClose =>
                                                        numberDayWhenClose ===
                                                        index + 1
                                                ).length > 0
                                            return (
                                                <span
                                                    key={`day-${index}`}
                                                    className={`${
                                                        classes.DaysOfWeek
                                                    } ${isClose &&
                                                        classes.NotWork}`}
                                                >
                                                    {day}
                                                </span>
                                            )
                                        })}
                                    </Col>
                                    {state.event &&
                                    !state.event.price.max &&
                                    !state.event.price.min ? (
                                        <Col lg={2}>
                                            <span className={classes.BtnFree}>
                                                Free
                                            </span>
                                        </Col>
                                    ) : (
                                        <Col lg={2}>
                                            <span className={classes.BtnFree}>
                                                $
                                                {state.event &&
                                                    state.event.price.max}
                                            </span>
                                        </Col>
                                    )}
                                </Row>
                            </>
                        )}

                        {/* ------------------CAMP SESSIONS--------------------------- */}
                        {state.typeOfEvent === 'camp' && (
                            <>
                                <Row>
                                    <Col lg={12}>
                                        <div
                                            id='campSessions'
                                            className={classes.Header}
                                        >
                                            CAMP SESSIONS
                                        </div>
                                        <CollapseComponent
                                            arrOfComponents={
                                                sessions &&
                                                sessions
                                                    .sort((a, b) => {
                                                        if (
                                                            a.startSessionDateTime >
                                                            b.startSessionDateTime
                                                        )
                                                            return 1
                                                        else if (
                                                            a.startSessionDateTime <
                                                            b.startSessionDateTime
                                                        )
                                                            return -1
                                                        else if (
                                                            a.endSessionDateTime >
                                                            b.endSessionDateTime
                                                        )
                                                            return 1
                                                        else if (
                                                            a.endSessionDateTime <
                                                            b.endSessionDateTime
                                                        )
                                                            return -1
                                                        else return 0
                                                    })
                                                    .map(
                                                        (
                                                            session,
                                                            index,
                                                            arrOfSessions
                                                        ) => {
                                                            const options = {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            }
                                                            const {
                                                                startSessionDateTime,
                                                                endSessionDateTime,
                                                                recommendAge,
                                                                tuition,
                                                                length
                                                            } = session
                                                            const formatStartDate = startSessionDateTime
                                                                .toDate()
                                                                .toLocaleDateString(
                                                                    'en-US',
                                                                    options
                                                                )
                                                            const formatEndDate = endSessionDateTime
                                                                .toDate()
                                                                .toLocaleDateString(
                                                                    'en-US',
                                                                    options
                                                                )

                                                            return (
                                                                <div
                                                                    key={
                                                                        session.id
                                                                    }
                                                                >
                                                                    <Row
                                                                        className={
                                                                            classes.CampSession
                                                                        }
                                                                    >
                                                                        <Col
                                                                            lg={
                                                                                4
                                                                            }
                                                                            className={
                                                                                classes.SessionHeader
                                                                            }
                                                                        >
                                                                            {
                                                                                session.sessionName
                                                                            }
                                                                        </Col>
                                                                        <Col
                                                                            lg={
                                                                                8
                                                                            }
                                                                        >
                                                                            <div className=''>
                                                                                {
                                                                                    formatStartDate
                                                                                }{' '}
                                                                                -{' '}
                                                                                {
                                                                                    formatEndDate
                                                                                }
                                                                            </div>
                                                                            <div className=''>
                                                                                {`Age: ${recommendAge.min}-${recommendAge.max} · Tuition: $${tuition} · ${length}`}
                                                                            </div>
                                                                        </Col>
                                                                    </Row>
                                                                    {arrOfSessions.length ===
                                                                        2 &&
                                                                        index <
                                                                            1 && (
                                                                            <hr />
                                                                        )}
                                                                    {arrOfSessions.length >
                                                                        2 && (
                                                                        <hr />
                                                                    )}
                                                                </div>
                                                            )
                                                        }
                                                    )
                                            }
                                            collapseText='session'
                                            nameIdForScrolling='campSessions'
                                        />
                                    </Col>
                                </Row>
                                <hr className={classes.HrForSessions} />
                            </>
                        )}

                        {/* ------------------LOCATION--------------------------- */}
                        <Row>
                            <Col lg={12}>
                                <div className={classes.Header}>Location</div>
                                <div className={classes.MapName}>
                                    {state.event && state.event.organizer}
                                </div>
                                <div className={classes.MapAddress}>
                                    {state.event &&
                                        state.event.location.address}
                                </div>
                                <div className={classes.MapViewDetails}>
                                    <SimpleMap
                                        coords={{
                                            lat:
                                                state.event &&
                                                state.event.location
                                                    .GPSCoordinates.latitude,
                                            lng:
                                                state.event &&
                                                state.event.location
                                                    .GPSCoordinates.longitude
                                        }}
                                        defaultMapZoomLevel={12}
                                    />
                                </div>
                            </Col>
                        </Row>

                        {/* ------------------NOTE--------------------------- */}
                        <Row>
                            <Col lg={12}>
                                <div className={classes.Header}>Note</div>
                                <CollapseText
                                    text={state.event && state.event.note}
                                    number={100}
                                />
                            </Col>
                        </Row>
                        <hr />

                        {/* ------------------CONTACTS--------------------------- */}
                        <Row>
                            <Col lg={12}>
                                <div className={classes.Header}>Contact</div>

                                <div className={classes.Contacts}>
                                    { state.event && state.event.weburl &&
                                        <>
                                            <OverlayTrigger
                                                overlay={
                                                    <Tooltip>
                                                        {state.event.weburl}
                                                    </Tooltip>
                                                }
                                            >
                                                {/* eslint-disable-next-line react/jsx-no-target-blank */}
                                                <span
                                                    className={`${classes.Contact1} ${classes.WebInfo}`}
                                                >
                                                    <a href={state.event.weburl}
                                                        target='_blank'
                                                        rel="noopener noreferrer">
                                                        Website
                                                    </a>
                                                </span>
                                            </OverlayTrigger>
                                        </>
                                    }

                                    { state.event && state.event.phoneNumber &&
                                        <span className={classes.Contact1}>
                                            {state.event.phoneNumber}
                                        </span>
                                    }

                                    { state.event && state.event.email &&
                                        <>
                                            <OverlayTrigger
                                                overlay={
                                                    <Tooltip>
                                                        {state.event.email}
                                                    </Tooltip>
                                                }
                                            >
                                                <span
                                                    className={`${classes.Contact1} ${classes.WebInfo}`}
                                                    onClick={() => {
                                                        setShowToast(true)
                                                        navigator.clipboard.writeText( state.event.email )
                                                    }}
                                                >
                                                    {state.event.email.slice(0, 15)}
                                                    {state.event.email.length > 15 && '...'}
                                                </span>
                                            </OverlayTrigger>

                                            <Toast
                                                className={classes.Toast}
                                                onClose={() => setShowToast(false)}
                                                show={showToast}
                                                delay={2000}
                                                autohide
                                            >
                                                <Toast.Body>
                                                        Copied Email to clipboard
                                                </Toast.Body>
                                            </Toast>
                                        </>
                                    }
                                    
                                </div>
                            </Col>
                        </Row>
                        <hr />

                        {/* ------------------DISCLAIMER--------------------------- */}
                        <Row>
                            <Col lg={12}>
                                <div className={classes.Header}>Disclaimer</div>
                                <p className={classes.DisclaimerText}>
                                    {initialSettings && initialSettings.webDisclaimerText}
                                </p>
                            </Col>
                        </Row>
                        <hr />

                        {/* ------------------REVIEWS--------------------------- */}
                        <Row>
                            <Col lg={12}>
                                { eventReviews && <div className={classes.Header}>Reviews</div> }
                                
                                { eventReviews && eventReviews.length > 0
                                    ?  
                                    <>  
                                        { !isReviewCurrentEvent &&
                                            <UserCardReview 
                                                handlerChangeRate={openReviewModal} 
                                                isShowLogoAndText
                                                userLogo={user.profileImage && user.profileImage.downloadURL}   
                                            />

                                        }
                                        <ListReviews 
                                            numOfReviewStarsEvent={state.event.numOfReviewStars}
                                            numOfReviewsEvent={state.event.numOfReviews}
                                            reviews={eventReviews.slice(0,2)}
                                            setIsReviewCurrentEvent={setIsReviewCurrentEvent} 
                                            openEditReview={(rate) => {
                                                setIsEditReview(true)
                                                openReviewModal(rate)
                                            }}
                                            setCurrentReviewEvent={setCurrentReviewEvent}
                                            />

                                        { eventReviews.length > 2 &&
                                            <div 
                                                className={classes.ReviewClicableText}
                                                onClick={() => openReviewModal()}>Show all reviews ({eventReviews.length})</div>
                                        }
                                    </>
                                    : 
                                    <>
                                        <div style={{textAlign: 'center', fontWeight: '500'}}>
                                            Be the first to review. Become an influencer and help other families in the community.
                                        </div>
                                        <UserCardReview handlerChangeRate={openReviewModal}/>
                                    </>

                                }

                                { !isReviewCurrentEvent &&
                                    <div 
                                        className={classes.ReviewClicableText}
                                        style={{textAlign: 'center'}}
                                        onClick={() => openReviewModal()}>Write a review</div>
                                }
                            </Col>
                        </Row>

                        <PostSuccess showModal={isPostSuccess} handleClose={() => {
                            // history.push(`/events/${eventID}`)
                            setIsPostSuccess(false)
                }} />
                    </ModalBody>
                </Modal>
            )}
            
            <Router history={history}>
                <Route path="/events/:eventID/reviews">
                    <Suspense fallback={<div>Loading...</div>}>
                        <ReviewModal 
                            rate={reviewRate} 
                            reviews={eventReviews} 
                            isReviewCurrentEvent={isReviewCurrentEvent}
                            averageRate={averageRate}
                            countOfReviews={state.event && state.event.numOfReviews}
                            currentUser={user}
                            numOfReviews={state.event && state.event.numOfReviews}
                            numOfReviewStars={state.event && state.event.numOfReviewStars}
                            eventID={eventID}
                            setIsReviewCurrentEvent={setIsReviewCurrentEvent}
                            currentReviewEvent={currentReviewEvent}
                            isEditReview={isEditReview}
                            setIsEditReview={setIsEditReview}
                            setCurrentReviewEvent={setCurrentReviewEvent}
                            setIsPostSuccess={setIsPostSuccess}
                            />
                    </Suspense>
                </Route>
            </Router>
        </>
    )
}
export default DetailsModal
