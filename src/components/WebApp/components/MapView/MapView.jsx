import React from 'react'
import SimpleMap from './test';

const TEST_MARKERS = [
  { lat: 37.763222, lng: -122.299869, text: 'Free', like: false },
  { lat: 37.789132, lng: -122.299869, text: 'Free', like: true },
  { lat: 37.889132, lng: -122.399869, text: '$199', like: false },
  { lat: 37.589132, lng: -122.199869, text: '$199', like: true },
  { lat: 37.689132, lng: -122.329869, text: '$10', like: true },
]

export const MapView =

  (props => {
    const {
      currentPositionButton,
      markers,
      imgMarker,
      handleChangeVisibleBoundaries,
      defaultMapZoomLevel,
      center,
      currentCity,
    } = props
    // 37.763222, -122.299869 San Francisco
    return (
      <>
        <SimpleMap
          currentPositionButton={ currentPositionButton }
          markers={ markers ? markers : TEST_MARKERS }
          imgMarker={ imgMarker }
          handleChangeVisibleBoundaries={ handleChangeVisibleBoundaries }
          defaultMapZoomLevel={ defaultMapZoomLevel }
          center={ center }
          currentCity={ currentCity }
        />
      </>
    )
  })
