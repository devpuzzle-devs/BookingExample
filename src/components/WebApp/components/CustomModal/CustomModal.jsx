import React from 'react'
import { Modal } from 'react-bootstrap';

export const CustomModal = ({showModal, handleClose, title, text}) => {
    return (
        <>
            <Modal show={showModal} onHide={handleClose} centered>
                <Modal.Header>
                    <Modal.Title>{title}</Modal.Title>
                </Modal.Header>
                <Modal.Body>{text}</Modal.Body>
            </Modal>
        </>
    );
}
