/*****************************************************************************************
 *                                                                                       *
 * Wormhole                                                                              *
 *                                                                                       *
 * Copyright (c) 2022-2024                                                               *
 *                                                                                       *
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this  *
 * software and associated documentation files (the "Software"), to deal in the Software *
 * without restriction, including without limitation the rights to use, copy, modify,    *
 * merge, publish, distribute, sublicense, and/or sell copies of the Software, and to    *
 * permit persons to whom the Software is furnished to do so, subject to the following   *
 * conditions:                                                                           *
 *                                                                                       *
 * The above copyright notice and this permission notice shall be included in all copies *
 * or substantial portions of the Software.                                              *
 *                                                                                       *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,   *
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A         *
 * PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT    *
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF  *
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE  *
 * OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.                                         *
 ****************************************************************************************/

import { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

interface CloseServerButtonProps {
  instanceID: string;
  text: string;
  onRoomClosed: (message: string) => void;
}

function CloseServerButton({ instanceID, text, onRoomClosed }: CloseServerButtonProps) {
  const [isButtonActive, setButtonActive] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const apiUrl = import.meta.env.VITE_SERVER_API_PATH;

  function handleCloseModal() {
    setShowModal(false);
    setButtonActive(true);
  }

  function handleShowModal() {
    setShowModal(true);
    setButtonActive(false);
  }

  function requestServerClose() {
    fetch(`${apiUrl}/remove-server-instance/${instanceID}`)
      .then((response) => {
        if (!response.ok) {
          setTimeout(() => {
            setButtonActive(true);
          }, 1500);
        }
        return response.json();
      })
      .then((data) => {
        onRoomClosed(data.message);
      })
      .catch((error) => {
        console.log(`ERROR on server remove: ${error}`);
        onRoomClosed('Internal server error, check logs.');
      });
  }

  return (
    <>
      <Button variant="outline-dark" disabled={!isButtonActive} onClick={handleShowModal}>
        {!isButtonActive ? 'Removing...' : text}
      </Button>
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Warning</Modal.Title>
        </Modal.Header>
        <Modal.Body>You are about to {text.toLowerCase()} a server, continue?</Modal.Body>
        <Modal.Footer>
          <Button autoFocus variant="success" onClick={handleCloseModal}>
            Abort
          </Button>
          <Button variant="secondary" onClick={requestServerClose}>
            Continue
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default CloseServerButton;
