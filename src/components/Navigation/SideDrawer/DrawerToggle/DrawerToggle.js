import React from 'react';

import classes from './DrawerToggle.module.css'

const toggleItem = (props) => (
    <div onClick={props.clicked} className={classes.DrawerToggle}>
        <div></div>
        <div></div>
        <div></div>
        {props.children}
    </div>
);

export default toggleItem;