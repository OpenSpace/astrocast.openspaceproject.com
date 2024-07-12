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

import { handleAdminRightsForm } from "@/shared/api";
import CustomToast from "./CustomToast";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import FloatingLabel from "react-bootstrap/FloatingLabel";
import Form from "react-bootstrap/Form";
import Row from "react-bootstrap/Row";

const RequestAdminRightsForm = () => {
  const [validated, setValidated] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const requestAdminRights = async (event: React.FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget;
    if (!form.checkValidity()) {
      event.preventDefault();
      event.stopPropagation();
    } else {
      try {
        const message = await handleAdminRightsForm(event);
        // If we succeded we clear the form
        setToastMessage(message);
        setShowToast(true);
        setValidated(false);
      } catch (error) {
        setToastMessage(`Error: ${error}`);
        setShowToast(true);
      }
    }
    setValidated(true);
  };

  return (
    <>
      <CustomToast
        showToast={showToast}
        message={toastMessage}
        onClose={() => setShowToast(false)}
      />
      <Form method="post" onSubmit={requestAdminRights} noValidate validated={validated}>
        <Row className="mb-2">
          <Form.Group as={Col}>
            <FloatingLabel label="User ID" controlId="floatingUserID">
              <Form.Control required type="text" name="uid" placeholder="uid" />
              <Form.Control.Feedback type="invalid">
                Enter a user ID
              </Form.Control.Feedback>
            </FloatingLabel>
          </Form.Group>
          <Form.Group as={Col}>
            <FloatingLabel label="Secret" controlId="floatingSecret">
              <Form.Control required type="text" name="secret" placeholder="secret" />
              <Form.Control.Feedback type="invalid">Enter a secret</Form.Control.Feedback>
            </FloatingLabel>
          </Form.Group>
        </Row>

        <Row>
          <Form.Group as={Col} className="d-flex justify-content-end">
            <Button variant="success" type="submit" className="px-3 py-2 ">
              Make user admin
            </Button>
          </Form.Group>
        </Row>
      </Form>
    </>
  );
};

export default RequestAdminRightsForm;
