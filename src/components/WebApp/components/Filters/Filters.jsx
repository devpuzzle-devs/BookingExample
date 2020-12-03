import React, { useState, useContext } from 'react'
import Select from 'react-select';
import { CustomSearch } from '../CustomSearch/CustomSearch';
import { AgeSetting, DateSetting, CategorySetting } from './FilterSettings';
import { HandelsContext } from '../../context/handels-context';

import 'react-day-picker/lib/style.css';
import './day-newstyle.scss'
import classes from './filters.module.scss'

import search_locaion_ico from '../../../../assets/img/search-locaion/search-locaion.png'
import google_play_img from '../../../../assets/img/google-play-badge/google_play_icon_new.png'

const stl1 = {
    fontFamily: 'Avenir',
    fontSize: '15px',
    width: '100%',
    maxWidth: '230px',
    height: '40px',
    padding: '5px',
    paddingLeft: '30px',
    textAlign: 'left',
    color: '#b3b5c7',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: '#f7f8fc',
    borderRadius: '5px',
    outline: 'none',
    backgroundColor: '#f7f8fc',
    backgroundImage: `url(${search_locaion_ico})`,
    backgroundRepeat: 'no-repeat' ,
    backgroundPositionY: 'center',
}
const stl2 = {
    width: '100%',
    borderStyle: 'none',
    outline: 'none',
    backgroundColor: '#f7f8fc',
    minHeight: 'auto',
    top: '-10%'
}

const colourStyles = {
    container: styles => ({...styles, ...stl1}),
    control: styles => ({...styles, ...stl2,}),
    // indicatorsContainer: styles => ({ ...styles, display: 'none'}),
    valueContainer: styles => ({ ...styles, padding: '2px 0'}),
    indicatorsContainer: styles => ({ ...styles, padding: '0', width: '32px', height: '32px'} ),
    indicatorSeparator: styles => ({display: 'none'}),
};

export const Filters = (props) => {
    const {
        myClassName,
        filters,
        citiesLookUp,
        categoryLookUp,
        currentTab,
    } = props

    const {
        searchText,
        cityName,
        category,
        age,
        date,
    } = filters

    const {
        handleToggleFilter,
        handleClearAllFilters,
        handlerSearchByCity,
    } = useContext(HandelsContext)

    const [showCategory, setShowCategory] = useState(false);
    const [showAge, setShowAge] = useState(false);
    const [showDate, setShowDate] = useState(false);

    const isOneOfFiltersSet = date || age || searchText.isFilterOn || cityName.isFilterOn || category

    const closeAllFilterTags = () => {
        setShowAge(false)
        setShowDate(false)
        setShowCategory(false)
    }
    return (
        // d-md-flex align-content-between
        <div className={`navbar navbar-expand-lg navbar-light ${myClassName || ''} ${classes.FilterWrapper}`}>
                <Select
                    className={`mr-2 DeleteSvgCollapse ${classes.InputTown} ${cityName.IsFilterOn ? classes.FiltersActive : ''}`}
                    isSearchable
                    styles={colourStyles}
                    placeholder='Search city name'
                    isClearable
                    options={citiesLookUp}
                    isDisabled={!citiesLookUp}
                    value={cityName.value}
                    onChange={handlerSearchByCity}
                />

                <CustomSearch
                    className={classes.CustomSearch}
                    searchText={searchText}
                />

                <button className={`btn btn-light ${classes.Button} ${isOneOfFiltersSet ? classes.FiltersActive : '' }`} onClick={handleToggleFilter}>Filters</button>

                {currentTab && currentTab.name === 'summer_camp' &&
                    <div className={classes.FilterButtonWrappper}>
                        <button
                            className={`btn btn-light ${classes.FilterButtons} ${ category ? classes.FiltersActive : ''}`}
                            onClick={() => {
                                closeAllFilterTags()
                                setShowCategory(!showCategory)
                            }}
                            >
                                Category
                        </button>
                        { showCategory &&
                            <div className={ classes.PopoverWrapper }>
                                <CategorySetting
                                    categoryLookUp={ categoryLookUp }
                                    filterCategory={category}
                                    handleShowCategory={ setShowCategory }
                                    />
                            </div>
                        }
                    </div>
                }

                <div className={classes.FilterButtonWrappper}>
                    <button
                        className={`btn btn-light ${classes.FilterButtons} ${age ? classes.FiltersActive : ''}`}
                        onClick={() => {
                            closeAllFilterTags()
                            setShowAge(!showAge)
                        }}
                        >
                            {
                                age ?
                                `Age: ${age}` :
                                'Age'
                            }
                    </button>
                    { showAge &&
                        <div className={classes.PopoverWrapper}>
                            <AgeSetting
                                handleShowAge={setShowAge}
                                age={age}
                            />
                        </div>
                    }
                </div>

                {currentTab && currentTab.name === 'summer_camp' &&
                    <div className={classes.FilterButtonWrappper}>
                        <button
                            className={`btn btn-light ${classes.FilterButtons} ${date ? classes.FiltersActive : ''}`}
                            onClick={() => {
                                closeAllFilterTags()
                                setShowDate(!showDate)
                            }}
                            >
                                { date
                                    ? `${date ? date.toLocaleDateString('en-US', {month: 'short', day: '2-digit'}) : ''}`
                                    : 'Date'
                                }
                        </button>
                        { showDate &&
                            <div className={classes.PopoverWrapper} >
                                <DateSetting
                                    date={date}
                                    handleShowDate={setShowDate}
                                />
                            </div>
                        }
                    </div>
                }

                <div
                    onClick={ () => {
                        closeAllFilterTags()
                        handleClearAllFilters()
                    }}
                    className={`${classes.ClearAll}
                    ${isOneOfFiltersSet ? classes.FiltersActive : ''}`} >
                    Clear all
                </div>
        </div>
    )
}
