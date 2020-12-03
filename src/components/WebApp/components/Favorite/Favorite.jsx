import React, { useState, useContext, useEffect } from 'react'
import { updateSavedEvent } from '../../serviceWorkers/firebaseAPI'
import { TestUserContext } from '../../../../user-context'
import { HandelsContext } from '../../context/handels-context'
import { CustomModal } from '../CustomModal/CustomModal'

import like_img from '../../../../assets/img/heart/red.png'
import like_white_img from '../../../../assets/img/heart/white.png'

export const Favorite = ({className, id, isLoggedIn, handleDetailsModal, isMobile}) => {

    const { setShowSignInMenu, setIsTimeoutEnd } = useContext(HandelsContext) 
    const user = useContext(TestUserContext)

    const [like, setLike] = useState(false)
    const [showModal, setShowModal] = useState(false);
    const handleSavedClick = () => {
      if (!isLoggedIn) {
          setShowModal(true)
          setTimeout( () => {
              setShowModal(false)
              if (handleDetailsModal) handleDetailsModal()
          }, 2000)
      }
  }
    const handleCloseModal = () => {
      setShowModal(false)
    }
    const handleLikeClick = () => {
      console.log('Like click')
      if (!isLoggedIn) {
        // if (!isMobile && handleDetailsModal) handleDetailsModal()
        handleSavedClick()
        setShowSignInMenu(true)
        setIsTimeoutEnd(true)
      }
      
      let newSavedEvents = []
      if (like && user.savedEvents ) {
        newSavedEvents = user.savedEvents.filter( el => el !== id)
      } else if (user.savedEvents) { 
        newSavedEvents = user.savedEvents.slice()
        newSavedEvents.push(id)
      }
      
      if (user.savedEvents) {
        updateSavedEvent(user.id, newSavedEvents)
        setLike(!like)
      }
    }

    useEffect(() => {
      if (user.savedEvents) {
        const x = user.savedEvents.filter( el => el === id).length > 0  
        setLike(x)
      }
    }, [id, user.savedEvents])

    return (
        <div className={className} onClick={handleLikeClick}>
        {like
          ? <img src={like_img} alt='' />
          : <img src={like_white_img} alt='' />}

          <CustomModal
                showModal={showModal}
                handleClose={() => {
                  handleCloseModal()
                }}
                title='Please sign in'
                text='Please sign in to save it to your account'
            />
      </div>
    )
}
