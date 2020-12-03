import React from "react";
import classes from "./burger-menu.module.scss";

export const BurgerButton = ({mobileNavOpened, handleToggleBurgerMenu}) => {

  return (
    <div className={classes.WrapperBurgerMenu} onClick={handleToggleBurgerMenu}>
      <div className={`${classes.MenuIcon} ${mobileNavOpened && classes.MenuClose} `} ></div>
    </div>
  );
};