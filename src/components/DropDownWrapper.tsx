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

import { AuthContext } from './AuthProvider';
import CustomToast from './CustomToast';
import {
  InstanceHeader,
  InstanceBody,
  InstanceBodyEntry,
  InstanceHeaderChevron,
  InstanceHeaderEntry,
  InstanceWrapper
} from './InstanceMapper';
import JoinRoomForm from './JoinRoomForm';
import { OpenSpaceContext } from './OpenSpaceProivder';
import ShareServerLink from './ShareServerLink';
import { useContext, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Row from 'react-bootstrap/Row';
import { FaCheck, FaX } from 'react-icons/fa6';
import { RxEnter, RxExit } from 'react-icons/rx';

type InstanceStatusProps = {
  instance: ServerInstanceData;
  connectedInstance: string;
  setConnectedInstance: (instance: string) => void;
};

const DropDownWrapper = ({
  instance,
  connectedInstance,
  setConnectedInstance
}: InstanceStatusProps) => {
  const openspace = useContext(OpenSpaceContext);
  const user = useContext(AuthContext);

  const [showMore, setShowMore] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // True if this instance is the server we are connected to, false otherwise
  const isConnected = connectedInstance === instance.id;

  // Tell OpenSpace we want to disconnect from the current room
  const disconnectFromInstanceServer = async () => {
    // If we are connected to OpenSpace we send the disconnect message
    if (openspace) {
      await openspace.parallel.disconnect();
    }
    // We also reset the connected instance regardless of the OpenSpace connection
    // This might be beacuse the OpenSpace connection was lost but the disconnect button
    // is still visible
    setConnectedInstance('');
    setToastMessage(`Left session: '${instance.roomName}'`);
    setShowToast(true);
  };

  return (
    <InstanceWrapper>
      <CustomToast
        message={toastMessage}
        showToast={showToast}
        onClose={() => {
          setShowToast(false);
        }}
      />

      <Container>
        <InstanceHeader>
          <InstanceHeaderEntry
            header="Room Name"
            value={instance.roomName}
            props={{ md: 3 }}
          />

          <InstanceHeaderEntry
            header="Profile"
            value={instance.profile}
            props={{ md: 2 }}
          />

          <InstanceHeaderEntry
            header="Status"
            value={
              instance.active ? (
                <div className="d-flex justify-content-start align-items-center gap-2 p-0">
                  Active
                  <FaCheck fill="#54bf87" />
                </div>
              ) : (
                <div className="d-flex justify-content-start align-items-center gap-2 p-0">
                  Inactive <FaX fill="#ff7a75" />
                </div>
              )
            }
            props={{ md: 2 }}
          />

          <InstanceHeaderEntry
            header="Access"
            value={instance.isPrivate ? 'Private' : 'Public'}
            props={{ md: 1 }}
          />

          <InstanceHeaderChevron
            showMore={showMore}
            callback={() => setShowMore(!showMore)}
          />
        </InstanceHeader>
      </Container>

      {/* Additional toggleable information on server*/}
      {showMore && (
        <>
          <InstanceBody>
            <InstanceBodyEntry
              header="Address"
              value={import.meta.env.VITE_WORMHOLE_ADDRESS}
            />
            <InstanceBodyEntry header="Port" value={import.meta.env.VITE_WORMHOLE_PORT} />
            <InstanceBodyEntry header="Password" value={instance.password} />
            <InstanceBodyEntry header="In Session" value={instance.nPeers} />
            <InstanceBodyEntry
              header="Host"
              value={instance.currentHost !== 'null' ? instance.currentHost : 'No host'}
            />

            {user?.uid === instance.owner && (
              <InstanceBodyEntry header="Host Password" value={instance.hostPassword} />
            )}

            <Row>
              <Col className="d-flex justify-content-end my-3 gap-2">
                <ShareServerLink instanceID={instance.id}></ShareServerLink>
                {isConnected && openspace ? (
                  <Button
                    className="d-flex justify-content-center align-items-center gap-2"
                    variant="success"
                    onClick={disconnectFromInstanceServer}
                  >
                    Leave Session
                    <RxExit />
                  </Button>
                ) : (
                  <Button
                    className="d-flex justify-content-center align-items-center gap-2"
                    disabled={openspace == null}
                    variant="success"
                    onClick={() => setShowModal(true)}
                  >
                    Join Session
                    <RxEnter />
                  </Button>
                )}
              </Col>
            </Row>
          </InstanceBody>

          <Modal show={showModal} onHide={() => setShowModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Join Room</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <JoinRoomForm
                instance={instance}
                setConnectedInstance={setConnectedInstance}
                onCallback={() => setShowModal(false)}
                onConnectCallback={() => {
                  setToastMessage(`Joined session: '${instance.roomName}'`);
                  setShowToast(true);
                }}
              ></JoinRoomForm>
            </Modal.Body>
          </Modal>
        </>
      )}
    </InstanceWrapper>
  );
};

export default DropDownWrapper;
