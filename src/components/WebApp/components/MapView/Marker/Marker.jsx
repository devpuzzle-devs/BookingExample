import React from 'react'

import heart_map from '../../../../../assets/img/heart-map/heart-map@3x.png'
import classes from './marker.module.scss'

export const Marker = ({ text, showHearth, imgMarker, tags, type}) => {
    return (
        <div className={imgMarker ? classes.SimpleMarker: classes.CustomMarker}>
            <div className={classes.WrapperMarkerContent}>
                {!imgMarker &&
                    <div>{text}</div>
                }

                {
                    showHearth && !imgMarker &&
                    <div className={classes.HeartMap}>
                        <img src={heart_map} alt=""/>
                    </div>
                }
            </div>
        </div>
    )
}
