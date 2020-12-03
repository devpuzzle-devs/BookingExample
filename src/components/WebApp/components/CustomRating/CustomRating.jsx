import React from 'react'
import Rating from 'react-rating'

import classes from './custom-rating.module.scss'

import img_empty_star from '../../../../assets/img/star-empty/star-empty@3x.png'
import img_full_star from '../../../../assets/img/star-full/star-full@3x.png'

export const CustomRating = (props) => {
    const {smallIcon, className} = props
    let classNameForIcon = ''
    if (smallIcon) classNameForIcon=classes.RatingSmall
    
    return (
        <Rating 
            emptySymbol={<img src={img_empty_star} alt='' className="icon" />}
            fullSymbol={<img src={img_full_star} alt='' className="icon" />}
            {...props}            
            className={`${className} ${classNameForIcon}`}
        />
    )
}
