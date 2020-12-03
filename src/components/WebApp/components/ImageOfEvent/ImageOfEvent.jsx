import React from 'react'



import classes from './image-of-event.module.scss'


export const ImageOfEvent = ({ image, handleImageClick, someOtherClassNames, children, type, tags }) => {

  const isDayCamp = type === 'camp' && tags.filter(tag => tag === '#day_camp').length > 0

  const isOvernightCamp = type === 'camp' && tags.filter(tag => tag === '#overnight_camp').length > 0

  const isFree = tags.filter(tag => tag === '#free').length > 0
  
  const isMuseum = type === 'museum'

  return (
    <div className={classes.ImageWrapper}>
      <img
        className={`img-fluid ${classes.Image} ${someOtherClassNames}`}
        src={image}
        alt=''
        onClick={handleImageClick}/>
      <div className={classes.LabelWrapper}>
        {
          isFree ?
            <div className={classes.Free}>Free</div>
            : null
        }

        {/* {
          type === 'daily' && <div className={classes.Daily}>Daily</div>
        } */}
        {
          isDayCamp && <div className={classes.Camp}>Day camp</div>
        }
        {
          isOvernightCamp && <div className={classes.Camp}>Overnight camp</div>
        }
        {
          isMuseum && <div className={classes.Camp}>Museum</div>
        }
      </div>



      {children}
    </div>
  )
}
