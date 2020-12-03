import React, { useState } from 'react'
import { Collapse } from 'react-bootstrap'

import classes from './collapse-component.module.scss'

export const CollapseComponent = ({ arrOfComponents, collapseText, number, nameIdForScrolling }) => {
  const [open, setOpen] = useState(false);
  const isCollapsed = arrOfComponents && arrOfComponents.length > 2

  const showAll = open ?
                  <div
                    className={classes.ShowText}
                    onClick={() => {
                      setOpen(!open)
                    }}>
                    Show less {collapseText} ({arrOfComponents && arrOfComponents.length})
                  </div>
                  :
                  <div
                    className={classes.ShowText} onClick={(e) => {
                      e.preventDefault()
                      setOpen(!open)
                      document.getElementById(nameIdForScrolling).scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                      })
                    }}>
                    Show all {collapseText} ({arrOfComponents && arrOfComponents.length})

                  </div>

  return (
    <>
      { !isCollapsed &&
        <div className={classes.DetailsText}>
            { !open && arrOfComponents && arrOfComponents }
        </div>
      }

      { isCollapsed &&
        <>
          <div className={classes.DetailsText}>
            { !open && arrOfComponents && arrOfComponents.slice(0,2)}
            { !open && showAll}
          </div>

          <Collapse
            dimension='height'
            in={open}>

            <div className={classes.DetailsText} >
              {arrOfComponents}
              {showAll}
            </div>
          </Collapse>
        </>
      }
    </>
  )
}
