import React, { useContext } from 'react'
import CreatableSelect from 'react-select/creatable';
import { HandelsContext } from '../../context/handels-context';

import classes from './custom-search.module.scss'
import search_ico from '../../../../assets/img/search/search.png'

const stl1 = {
    fontFamily: 'Avenir',
    fontSize: '15px',
    width: '240px',
    height: '40px',
    padding: '5px',
    paddingLeft: '30px',
    textAlign: 'left',
    color: '#b3b5c7',
    borderWidth: '1px',
    borderStyle: 'solid',
    backgroundColor: '#f7f8fc',
    backgroundRepeat: 'no-repeat' ,
    backgroundPositionY: 'center',
}
const stl2 = {
    width: '100%',
    borderStyle: 'none',
    outline: 'none',
    backgroundColor: '#f7f8fc',
    minHeight: 'auto',
    position: 'relative',
    top: '-2px',
}
const colourStyles2 = {
    container: styles => ({...styles, ...stl1, backgroundImage: `url(${search_ico})`}),
    control: styles => ({...styles, ...stl2,}),
    menu: styles => ({display: 'none'}),
    indicatorSeparator: styles => ({display: 'none'}),
    indicatorsContainer: styles => ({ ...styles, padding: '0', width: '32px', height: '32px'} ),
    valueContainer: styles => ({ ...styles, padding: '2px 0'}),
};

export const CustomSearch = ({searchText, className}) => {
    const { handleSearchTextClick } = useContext(HandelsContext)
    return (
        <CreatableSelect
            className={`${className ? className : ''} DeleteSvgCollapse ${searchText.IsFilterOn ? classes.FiltersActive : ''}`}
            styles={colourStyles2}
            placeholder='Search keyword'
            value={searchText.value}
            onChange={handleSearchTextClick}
            isClearable
        />
    )
}
