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
import { User } from 'firebase/auth';
import { useContext, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';

interface RequestNewRoomFormProps {
  onSubmitCallback: (
    e: React.FormEvent<HTMLFormElement>,
    user: User | null
  ) => Promise<void>;
}

const RequestNewRoomForm = ({ onSubmitCallback }: RequestNewRoomFormProps) => {
  const user = useContext(AuthContext);

  const [validated, setValidated] = useState(false);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      onSubmitCallback(event, user);
    }

    setValidated(true);
  };

  return (
    <Form
      method="post"
      onSubmit={handleSubmit}
      noValidate
      validated={validated}
      className="p-3 my-3"
      style={{ boxShadow: '0 0 5px 0 #bdbdbd', borderRadius: 10, background: '#ffff' }}
    >
      <h2 className="mb-3">Create a new room</h2>
      <Row>
        <Form.Group as={Col}>
          <FloatingLabel label="Room Name" controlId="floatingRoomName" className="mb-3">
            <Form.Control required type="text" name="roomname" placeholder="room name" />
            <Form.Control.Feedback type="invalid">
              Enter a room name
            </Form.Control.Feedback>
          </FloatingLabel>
        </Form.Group>

        <Form.Group as={Col}>
          <FloatingLabel
            label="Profile Name"
            controlId="floatingProfileName"
            className="mb-3"
          >
            <Form.Control
              required
              type="text"
              name="profile"
              placeholder="profile name"
            />
            <Form.Control.Feedback type="invalid">
              Enter a profile name
            </Form.Control.Feedback>
          </FloatingLabel>
        </Form.Group>
      </Row>

      <Row className="mb-3">
        <Form.Group as={Col}>
          <FloatingLabel label="Room Password" controlId="floatingPassword">
            <Form.Control required type="text" name="password" placeholder="password" />
            <Form.Control.Feedback type="invalid">
              Enter a room password
            </Form.Control.Feedback>
          </FloatingLabel>
        </Form.Group>

        <Form.Group as={Col}>
          <FloatingLabel label="Host Password" controlId="floatingHostPw">
            <Form.Control
              required
              type="text"
              name="hostpassword"
              placeholder="host password"
            />
            <Form.Control.Feedback type="invalid">
              Enter a host password
            </Form.Control.Feedback>
          </FloatingLabel>
        </Form.Group>
      </Row>

      <Form.Group className="mb-3">
        <Form.Check label="Make private" type="checkbox" name="roomaccess" />
      </Form.Group>

      <Col className="d-flex justify-content-end">
        <Button variant="success" type="submit">
          Create Room
        </Button>
      </Col>
    </Form>
  );
};

export default RequestNewRoomForm;
