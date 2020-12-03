import React, { useEffect, useRef } from 'react'

import classes from './map-view.module.scss'
import markerImage from '../../../../assets/img/location/location@3x.png'

export const SimpleMap = ({ coords, defaultMapZoomLevel }) => {
    const mapsRef = useRef()
    const mapRef = useRef()
    mapsRef.current = window.google.maps

    const initMap = () => {
        const map = new mapsRef.current.Map(document.getElementById(classes.MapModal), {
                center: { lat: coords.lat, lng: coords.lng },
                zoom: defaultMapZoomLevel,
                // fullscreenControl: false,
                disableDefaultUI: true,
                zoomControl: true,
                zoomControlOptions: { position: 5 },

            })
        mapRef.current = map

        new mapsRef.current.Marker({
            position: { lat: coords.lat, lng: coords.lng },
            map: mapRef.current,
            icon: {
                url: markerImage,
                scaledSize: {
                    width: 60,
                    height: 80
                },

            },
        })
    }

    useEffect(() => {
        initMap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <div id={classes.MapModal}>
            </div>
        </>
    )
}
