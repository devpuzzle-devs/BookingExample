// for better understanding of how CSS in JS works look here: https://cssinjs.org/react-jss/?v=v10.0.0-alpha.9

export const styles = {
    wrapper: {
        display: 'flex',
        justifyContent: 'space-between',
    },
    controlButtons: {
        display: 'flex',
        justifyContent: 'flex-end',
        width: '37%',

        '@media (min-width: 1276px) and (max-width: 1444px)': {
            '&>button': {
                fontSize: 'small',
            }
        },
        '@media (min-width: 993px) and (max-width: 1275px)': {
            '&>button': {
                fontSize: 'x-small',
            }
        }
    },
    leftBar: {
        display: 'flex',
        width: '63%',
        height: '52px',
    },
    select: {
        display: 'flex',
        width: '215px',
        zIndex: '2', // to make dropdown be above all elements
        '& > div': {
            width: '100%',
        },
    },
};
