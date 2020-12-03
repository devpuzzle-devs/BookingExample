import React, { useEffect, useRef, useState, useContext, useCallback } from 'react'
import ReactDOMServer from 'react-dom/server';
import MarkerClusterer from '@google/markerclustererplus';
import { debounce } from 'lodash'
import { InfoWindowGM } from './InfoWindowGM/InfoWindowGM';
import { updateWebFilterSettingsGeo } from '../../serviceWorkers/firebaseAPI';
import { TestUserContext } from '../../../../user-context';
import { useDeepCompare } from '../../helpers/customHooks';

import classes from './map-view.module.scss'
import nerby_map_btn from '../../../../assets/img/nerby/nerby@3x.png'
import markerImage from '../../../../assets/img/location/location@3x.png'
import markerHoverImg from '../../../../assets/img/location/location@3x_blue.png'

const getNewVisibleEvents = (clusters, bounds, currentZoom, isSaved, isFirstLoad) => {
    if (!clusters ) return []
    if (isSaved && isFirstLoad) return clusters.getMarkers()
    if (currentZoom <= 4) return clusters.getMarkers()
    if (clusters.getTotalClusters() === 0 && bounds) {
        const newVisibleEvents = clusters.getMarkers().filter( marker => {
            return marker.getPosition().lat() <= bounds.ne.lat
                && marker.getPosition().lat() >= bounds.sw.lat
                && marker.getPosition().lng() <= bounds.ne.lng
                && marker.getPosition().lng() >= bounds.sw.lng
        })
        return newVisibleEvents
    }

    if (bounds) {
        const newVisibleEvents = clusters.getClusters().map(cluster => {
            if (
                cluster.getCenter().lat() <= bounds.ne.lat
                && cluster.getCenter().lat() >= bounds.sw.lat
                && cluster.getCenter().lng() <= bounds.ne.lng
                && cluster.getCenter().lng() >= bounds.sw.lng ) {

                    return cluster.getMarkers()
                }
            return []
        }).flat(20)
        return newVisibleEvents
    }
    return []
}

export const CustomGoogleMap = (props) => {
    const {
        markers,
        currentPositionButton,
        handleChangeVisibleBoundaries,
        currentCity,
        defaultMapZoomLevel,
        handleOpenModal,
        idEventOnListItem,
        prevIdEventOnListItem,
        isSaved,
        tab,
        tabBoundaries,
        setTabBoundaries,
        isDataLoading,
    } = props

    const mapsRef = useRef()
    mapsRef.current = window.google.maps
    const mapRef = useRef()
    const infoWindowsRef = useRef()
    const idForClose = useRef()
    const user = useContext(TestUserContext)

    const [isInitMap, setIsInitMap] = useState(false)
    const [isFirstLoad, setIsFirstLoad] = useState(true)
    const [savedCounter, setSavedCounter] = useState(0)
    const [currentBoundaries, setCurrentBoundaries] = useState(false)
    const [clustersMy, setClustersMy] = useState(null)
    const [isChangeLocation, setIsChangeLocation] = useState(false)

    const [currentIdOpenedInfoWindow, setCurrentIdOpenedInfoWindow] = useState(null)
    const [prevIdOpenedInfoWindow, setPrevIdOpenedInfoWindow] = useState(null)
    
    const [prevTabName, setPrevTabName] = useState(tab)

    const saveBoundaryOnFirebase = (userID, tabName, lat, lng, zoom) => {
        updateWebFilterSettingsGeo(userID, tabName, {
            lat,
            lng,
            zoom,
        })
    }

    const debounceSaveBoundaryOnFirebase = useCallback(debounce( saveBoundaryOnFirebase, 10000), [] ) 

    useEffect(() => {
        initMap()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [ ])

    useEffect(() => {
        if (prevIdOpenedInfoWindow && currentIdOpenedInfoWindow !== prevIdOpenedInfoWindow) {
            infoWindowsRef.current[prevIdOpenedInfoWindow].close()
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentIdOpenedInfoWindow])

    useEffect(() => {

        if (!idForClose.current) idForClose.current = {}
        if (idEventOnListItem) {
            infoWindowsRef.current[idEventOnListItem].marker.setOptions({
                icon: {
                    url: markerHoverImg,
                    scaledSize: {
                        width: 55,
                        height: 75
                    },
                },
            })
            setPrevIdOpenedInfoWindow(idEventOnListItem)
        }
    }, [idEventOnListItem ])

    useEffect(() => {
        if (prevIdEventOnListItem) {
            infoWindowsRef.current[prevIdEventOnListItem].marker.setOptions({
                icon: {
                    url: markerImage,
                    scaledSize: {
                        width: 40,
                        height: 50
                    },
                },
            })
        }
    }, [prevIdEventOnListItem ])

    useEffect(() => {
        if (defaultMapZoomLevel) {
            mapRef.current.setZoom(defaultMapZoomLevel)
        }
    }, [defaultMapZoomLevel])

    useEffect(() => {

        const run = (async () => {
            const coords = await getCityGeoCoords(currentCity.value.value, currentCity.value.state)
            mapRef.current.setCenter({ ...coords })
            mapRef.current.setZoom(13)
            // if (tab) {
            //     debounceSaveBoundaryOnFirebase(user.id, tab, coords.lat, coords.lng, mapRef.current.getZoom())
            // }
        })

        if (currentCity && currentCity.isFilterOn) {
            run()
        }
    }, [currentCity, user.id])

    useEffect(() => {
        if (isInitMap) {
            const ms = markers.map((marker, index) => {
                const x = <InfoWindowGM
                            img={marker.img}
                            eventName={marker.eventName}
                            eventOrganizer={marker.eventOrganizer}
                            tags={marker.tags}
                            id={marker.id}
                            price={marker.price} />

                const contentInfoWindow = ReactDOMServer.renderToString(x)

                // let text = marker.price && `$${marker.price.min}+`
                // if (marker.tags && marker.tags.filter(tag => tag === '#free').length > 0) { text = 'Free' }

                const newMarker = new mapsRef.current.Marker({
                    position: { lat: marker.lat, lng: marker.lng },
                    // map: mapRef.current,
                    icon: {
                        url: markerImage,
                        scaledSize: {
                            width: 40,
                            height: 50
                        },
                    },
                    label: {
                        text: ' ',
                        fontSize: '1px',
                        color: '#ffffff00',
                        fontFamily: 'Avenir',
                        fontWeight: '500',
                        opacity: '0',
                        id: marker.id,
                        img: marker.img,
                        eventName: marker.eventName,
                        eventOrganizer: marker.eventOrganizer,
                        tags:  marker.tags,
                    },
                    zIndex: index,
                    shape: {
                        coords: [16, 21, 13],
                        type: 'circle'
                        // coords: [16,0, 10,11, 0,30, 16,45, 33,30, 28,11, 16,0],
                        // type: 'poly'
                    }
                })

                const infoWindow = new mapsRef.current.InfoWindow({
                    maxWidth: 200,
                    disableAutoPan: true,
                })

                // mapsRef.current.event.addListener(infoWindow, 'domready', ()=>{
                //     document.getElementById(marker.id).addEventListener("click", ()=>{
                //         handleOpenModal(marker.id)
                //     });
                // })

                // infoWindow.setContent(contentInfoWindow)
                infoWindowsRef.current[marker.id] = infoWindow
                infoWindowsRef.current[marker.id].marker = newMarker


                newMarker.addListener('mouseover', () => {
                    newMarker.setOptions({
                        icon: {
                            url: markerHoverImg,
                            scaledSize: {
                                width: 40,
                                height: 50
                            },
                        },
                    })
                    infoWindowsRef.current[marker.id].setContent(contentInfoWindow)
                    infoWindowsRef.current[marker.id].open(mapRef.current, newMarker)
                    setCurrentIdOpenedInfoWindow(marker.id)
                })

                newMarker.addListener('mouseout', () => {
                    newMarker.setOptions({icon: {
                        url: markerImage,
                        scaledSize: {
                            width: 40,
                            height: 50
                        },
                    },})
                    infoWindowsRef.current[marker.id].close()
                    setPrevIdOpenedInfoWindow(marker.id)
                })

                newMarker.addListener('click', debounce(function(){

                    // else {
                        // closeAllInfoWindows(infoWindowsRef.current)
                        // infoWindow.setContent(contentInfoWindow)
                        // infoWindow.open(mapRef, newMarker)
                        // infoWindowsRef.current[marker.id] = {
                        //     isOpen: true,
                        //     infoWindow
                        // }
                    // }
                    handleOpenModal(marker.id)
                }, 0))

                return newMarker
            })


            if (!clustersMy) {
                const markerCluster = new MarkerClusterer(mapRef.current, ms, {
                    // imagePath: 'public/img/clusters/m',
                    imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
                    // imagePath: clusterImg,
                    setImageSizes: [0],
                    averageCenter: true,
                    maxZoom: 1,
                });
                // markerCluster.setImagePath(clusterImg)
                setClustersMy(markerCluster)
            } else {
                clustersMy.clearMarkers()
                clustersMy.addMarkers(ms)
            }
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [markers])

    useEffect(() => {
        setSavedCounter(0)
    }, [isSaved])

    useEffect(() => {
        if (tabBoundaries && tabBoundaries[tab] && isFirstLoad) {
            mapRef.current.setCenter({ lat: tabBoundaries[tab].lat, lng: tabBoundaries[tab].lng, })
            mapRef.current.setZoom(tabBoundaries[tab].zoom)
            setIsFirstLoad(false)
        }

        if (tab !== prevTabName && tabBoundaries && tabBoundaries[tab]) {
                mapRef.current.setCenter({ lat: tabBoundaries[tab].lat, lng: tabBoundaries[tab].lng, })
                mapRef.current.setZoom(tabBoundaries[tab].zoom)
            }
        
        if (tab !== prevTabName ) {
            setPrevTabName(tab)
        }
        if (tab !== prevTabName && prevTabName) {

            // setTabBoundaries({
            //     ...tabBoundaries,
            //     [prevTabName]: {
            //         lat: mapRef.current.getCenter().lat(),
            //         lng: mapRef.current.getCenter().lng(),
            //         zoom: mapRef.current.getZoom()
            //     }
            // })

            // if (prevTabName) {
            if (user.id) {
                saveBoundaryOnFirebase(
                    user.id,
                    prevTabName,
                    tabBoundaries[prevTabName].lat,
                    tabBoundaries[prevTabName].lng,
                    tabBoundaries[prevTabName].zoom,
                )
            }
            // }
            // if (tabBoundaries && tabBoundaries[tab]) {
            //     mapRef.current.setCenter({ lat: tabBoundaries[tab].lat, lng: tabBoundaries[tab].lng, })
            //     mapRef.current.setZoom(tabBoundaries[tab].zoom)
            // }
            
        } else {
            if (mapRef.current.getCenter() && tab) {
                const { lat, lng } = mapRef.current.getCenter()
                const zoom = mapRef.current.getZoom()
                if (lat && lng && zoom) {
                    if (!tabBoundaries || !tabBoundaries[tab]) {
                        setTabBoundaries({
                            [tab]: {
                                lat: lat(),
                                lng: lng(),
                                zoom,
                                currentBoundaries,
                            }
                        })
                    }

                    if ((tabBoundaries && tabBoundaries[tab]) &&
                        ((tabBoundaries[tab].lat !== lat()) || (tabBoundaries[tab].lng !== lng()) || (tabBoundaries[tab].zoom !== zoom))) {
                        setTabBoundaries({
                            ...tabBoundaries,
                            [tab]: {
                                lat: lat(),
                                lng: lng(),
                                zoom,
                                currentBoundaries,
                            }
                        })
                    }
                }
            }
        }
    }, [tab, currentBoundaries, tabBoundaries, isFirstLoad, prevTabName, setTabBoundaries, user.id])

    useEffect(() => {
        console.time('TEST_getNewVisibleEvents')
        const newVisibleEvents = getNewVisibleEvents(
            clustersMy,
            currentBoundaries,
            mapRef.current.getZoom(),
            isSaved,
            savedCounter <= 2
        )
        
        if (!isDataLoading && isSaved && savedCounter === 0) setSavedCounter(savedCounter+1)
        if (!isDataLoading && isSaved && savedCounter <= 2) {
            const myBounds = new mapsRef.current.LatLngBounds()
            // mapRef.current.setZoom(5)
            newVisibleEvents.forEach(r => {
                myBounds.extend({lat: r.getPosition().lat(), lng: r.getPosition().lng()})
            })

            if (newVisibleEvents.length === 0) {
                mapRef.current.setCenter({ lat: 34.053952, lng: -118.249612 })
                mapRef.current.setZoom(defaultMapZoomLevel)
            }
            if (newVisibleEvents.length > 0) {
                if (myBounds.getNorthEast().equals(myBounds.getSouthWest())) {
                    var extendPoint1 = new mapsRef.current.LatLng(myBounds.getNorthEast().lat() + 0.01, myBounds.getNorthEast().lng() + 0.01);
                    var extendPoint2 = new mapsRef.current.LatLng(myBounds.getNorthEast().lat() - 0.01, myBounds.getNorthEast().lng() - 0.01);
                    myBounds.extend(extendPoint1);
                    myBounds.extend(extendPoint2);
                }
                mapRef.current.fitBounds(myBounds)
                mapRef.current.setZoom(mapRef.current.getZoom() - 1)
            }
            setSavedCounter(savedCounter + 1)
        }

        handleChangeVisibleBoundaries(newVisibleEvents)
        console.timeEnd('TEST_getNewVisibleEvents')
        
    }, useDeepCompare([ tab, clustersMy, currentBoundaries, markers, isDataLoading, prevTabName ]))


    const initMap = () => {
        infoWindowsRef.current = {}
        const map = new mapsRef.current.Map(document.getElementById(classes.Map), {
                clickableIcons: false,
                center: { lat: 34.053952, lng: -118.249612 },
                zoom: 18,
                disableDefaultUI: true,
                zoomControl: true,
                zoomControlOptions: { position: 5 },

            })
        mapRef.current = map
        setIsInitMap(true)

        // map.addListener('click', () => {

        //     infoWindowsRef.current['viOm4LPCe7Ndu7bmBT06'].open(mapRef.current, infoWindowsRef.current['viOm4LPCe7Ndu7bmBT06'].marker)
        // })

        map.addListener('bounds_changed', debounce(() => {
            if (Object.keys(idForClose.current).length > 0) {
                Object.keys(idForClose.current).forEach(key => {
                    infoWindowsRef.current[key].close()
                })
            }
            // if (mapRef.current.getZoom() >= 13) idForClose.current = {}

            const newBounds = mapRef.current.getBounds() && {
                sw: {
                    lat: mapRef.current.getBounds().getSouthWest().lat(),
                    lng: mapRef.current.getBounds().getSouthWest().lng(),
                },
                ne: {
                    lat: mapRef.current.getBounds().getNorthEast().lat(),
                    lng: mapRef.current.getBounds().getNorthEast().lng(),
                }
            }
            setCurrentBoundaries(newBounds)
        }, 500))

        map.addListener('zoom_changed', debounce((e) => {
            if (Object.keys(idForClose.current).length > 0) {
                Object.keys(idForClose.current).forEach(key => {
                    infoWindowsRef.current[key].close()
                })
            }
            // if (mapRef.current.getZoom() >= 13) idForClose.current = {}
            if (isInitMap) {
                const newBounds = {
                    sw: {
                        lat: mapRef.current.getBounds().getSouthWest().lat(),
                        lng: mapRef.current.getBounds().getSouthWest().lng(),
                    },
                    ne: {
                        lat: mapRef.current.getBounds().getNorthEast().lat(),
                        lng: mapRef.current.getBounds().getNorthEast().lng(),
                    }
                }
                const newVisibleEvents = getNewVisibleEvents(clustersMy, newBounds, mapRef.current.getZoom(), isSaved, isFirstLoad)
                handleChangeVisibleBoundaries(newVisibleEvents)
                setCurrentBoundaries(newBounds)
            }
        }, 400))
    }

    const getCityGeoCoords = (cityName, stateName) => {
        const promise = new Promise((resolve, reject) => {
            const request = {
                query: `${cityName} state ${stateName} USA`,
                fields: ['name', 'geometry'],
            }
            const service = new mapsRef.current.places.PlacesService(mapRef.current)

            service.findPlaceFromQuery(request, function (results, status) {

                if (status === mapsRef.current.places.PlacesServiceStatus.OK) {
                    const newCenter = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng()
                    }
                    results.forEach(res => {
                    })
                    resolve(newCenter)
                } else {
                    reject({ Error: status })
                }
            })
        })
        return promise
    }
        return (
        <>
            <div id={classes.Map}>
            </div>
            {
                currentPositionButton && markers.length !== 1 &&
                <div className={classes.MapBtnWrapper}>
                    <div className={`${classes.CustomMapControls} ${isChangeLocation ? classes.Rotation : ''}`} onClick={() => {
                        if (!navigator.geolocation) {
                            console.log('Geolocation is not supported by your browser');
                        } else {
                            console.log('Locating…');
                            console.time('Current Location')
                            setIsChangeLocation(true)
                            navigator.geolocation.getCurrentPosition(({ coords }) => {
                                console.log(coords)
                                mapRef.current.setCenter({ lat: coords.latitude, lng: coords.longitude })
                                setIsChangeLocation(false)

                            }, (err) => {
                                console.log(err)
                                setIsChangeLocation(false)
                            });
                            console.timeEnd('Current Location')
                        }
                    }}>
                        <img src={nerby_map_btn} alt="" />
                    </div>
                </div>
            }
        </>
    )
}
