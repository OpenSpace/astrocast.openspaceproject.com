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

import CustomToast from '@/components/CustomToast';
import InstanceHistory from '@/components/InstanceHistory';
import InstanceStatus from '@/components/InstanceStatus';
import RequestNewRoomForm from '@/components/RequestNewRoomForm';
import useServerInstanceData from '@/hooks/useServerInstanceData';
import useServerInstanceHistory from '@/hooks/useServerInstanceHistory';
import useServerStatisticsData from '@/hooks/useServerStatisticsData';
import { handleNewRoomForm } from '@/shared/api';
import { User } from 'firebase/auth';
import { useState } from 'react';
import Container from 'react-bootstrap/Container';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';
import RequestAdminRightsForm from '@/components/RequestAdminRightsForm';

const Admin = () => {
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const instances = useServerInstanceData(true);
  const statistics = useServerStatisticsData();
  const history = useServerInstanceHistory();

  // Sort history records by latest first
  history.sort((a, b) => {
    return b.created - a.created;
  });

  const onRoomCreate = (data: ServerInstanceData) => {
    setShowModal(false);
    setToastMessage(`New room created: ${data.roomName}`);
    setShowToast(true);
  };

  const onRoomDestroyed = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  const onRoomCreateError = (msg: string) => {
    setToastMessage(`Error creating room: ${msg}`);
    setShowToast(true);
    setShowModal(false);
  };

  return (
    <>
      <CustomToast
        message={toastMessage}
        showToast={showToast}
        onClose={() => {
          setShowToast(false);
        }}
      />

      <Modal show={showModal}>
        <Modal.Header
          closeButton
          onHide={() => {
            setShowModal(false);
          }}
        >
          <Modal.Title>Create New Room</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <RequestNewRoomForm
            onSubmitCallback={(
              e: React.FormEvent<HTMLFormElement>,
              user: User | null
            ) => {
              return handleNewRoomForm(e, user, onRoomCreate, onRoomCreateError);
            }}
          />
        </Modal.Body>
      </Modal>

      <Container className="d-flex justify-content-end mb-2">
        <Button
          className="py-2"
          variant="success"
          onClick={() => {
            setShowModal(true);
          }}
        >
          Create New Room
        </Button>
      </Container>

      <Container>
        <RequestAdminRightsForm />
      </Container>

      <Container>
        <h1>Server Instance Status</h1>
        {instances.map((instance: ServerInstanceData) => (
          <InstanceStatus
            key={instance.id}
            instance={instance}
            statistics={statistics.find((stat) => stat.id === instance.id)}
            callback={onRoomDestroyed}
          ></InstanceStatus>
        ))}
      </Container>
      <Container>
        <h2>History</h2>
        {history.map((instance: InstanceHistoryData) => (
          <InstanceHistory
            key={instance.id + '-history'}
            instance={instance}
            statistics={statistics.find((stat) => stat.id === instance.id)}
          />
        ))}
      </Container>
    </>
  );
};

export default Admin;
