import React, { useState } from 'react'

import classes from './left-menu.module.scss'

const LEFT_MENU = ['All', 'Overnight Camp', 'Day Camp', 'Museum & free days', 'Events', 'Day trips' ]

export const LeftMenu = ({handleClickGeneralFilter}) => {

    const initialActiveFilter = LEFT_MENU[0].toLowerCase().replace(/ & /,'_').replace(/ /g, '_')
    const [state, setState] = useState(initialActiveFilter)

    const handlerClickFilter = (e) => {
        handleClickGeneralFilter(e.target.id)
        setState(e.target.id)
    }

    const menu = LEFT_MENU.map( (name, index) => {
        const newName = name.toLowerCase().replace(/ & /g,'_').replace(/ /g, '_')
        const regExp = new RegExp(`^${newName}$`)
        return (
            <div key={`${name}-${index}`}
                className={`${classes.MenuFont} ${state.match(regExp) ? classes.MenuActive : ''}`}
                onClick={handlerClickFilter}
                id={newName} >
                {name}
            </div>
        )
    })

    return (
        <div className={classes.WrapperLeftMenu}>
            { menu }
        </div>
    )
}
