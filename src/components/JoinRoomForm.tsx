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
import { OpenSpaceContext } from './OpenSpaceProivder';
import { useContext } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Row from 'react-bootstrap/Row';
import Tooltip from 'react-bootstrap/Tooltip';
import { RxEnter } from 'react-icons/rx';

interface JoinRoomFormProps {
  instance: ServerInstanceData;
  setConnectedInstance: (instance: string) => void;
  onCallback: Function;
  onConnectCallback: Function;
}

function JoinRoomForm({
  instance,
  setConnectedInstance,
  onCallback,
  onConnectCallback
}: JoinRoomFormProps) {
  const openspace = useContext(OpenSpaceContext);
  const user = useContext(AuthContext);

  // If OpenSpace is connected, we can automatically join the room using OpenSpace API
  async function connectToInstanceServer(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!openspace) {
      return;
    }
    // Retrieve the form data
    const form = event.currentTarget;
    const formData = new FormData(form);
    const formJson = Object.fromEntries(formData.entries());
    const hostPassword = formJson['hostpassword'];
    const username = formJson['username'] || 'Guest';
    // Join the OpenSpace room
    await openspace.parallel.joinServer(
      import.meta.env.VITE_WORMHOLE_PORT.toString(),
      import.meta.env.VITE_WORMHOLE_ADDRESS.toString(),
      instance.roomName,
      instance.password,
      hostPassword,
      // If we are signed in but the user set a username we will use that, if no username
      // was set we use the display name of the user, otherwise it defaults to guest
      user && username === 'Guest' ? user.displayName : username
    );
    setConnectedInstance(instance.id);
    onConnectCallback();
  }

  return (
    <Form method="post" onSubmit={connectToInstanceServer}>
      <Row className="mb-2">
        <Container>
          <FloatingLabel label="Host Password" controlId="floatingHostPw">
            <Form.Control type="text" name="hostpassword" placeholder="" />
          </FloatingLabel>
        </Container>
      </Row>
      <Row className="mb-2">
        <Container>
          <OverlayTrigger
            placement="top"
            delay={{ show: 250, hide: 400 }}
            overlay={(props) => (
              <Tooltip id="button-tooltip" {...props}>
                {user
                  ? `Defaults to ${user.displayName} if left empty`
                  : 'Optional username shown in OpenSpace'}
              </Tooltip>
            )}
          >
            <FloatingLabel label="Username" controlId="floatingUsername" className="mt-2">
              <Form.Control type="text" name="username" placeholder="" />
            </FloatingLabel>
          </OverlayTrigger>
        </Container>
      </Row>
      <Row>
        <Form.Group
          as={Container}
          className="justify-content-end d-flex"
          style={{ gap: 5 }}
        >
          <Button
            className="d-flex justify-content-center align-items-center gap-2"
            variant="success"
            type="submit"
            disabled={openspace == null}
            onClick={() => {
              onCallback();
            }}
          >
            Join Session
            <RxEnter />
          </Button>
        </Form.Group>
      </Row>
    </Form>
  );
}

export default JoinRoomForm;
