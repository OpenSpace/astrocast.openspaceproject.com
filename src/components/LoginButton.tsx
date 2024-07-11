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

import { signInWith, supportedProviders } from "@/firebaseconfig";
import CustomToast from "./CustomToast";
import {
  GoogleAuthProvider,
  FacebookAuthProvider,
  GithubAuthProvider,
  TwitterAuthProvider,
} from "firebase/auth";
import { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";
import { FaGithub } from "react-icons/fa";
import { FaSquareFacebook, FaXTwitter } from "react-icons/fa6";
import { FcGoogle } from "react-icons/fc";

const LoginButton = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const icons = {
    [GoogleAuthProvider.PROVIDER_ID]: <FcGoogle />,
    [FacebookAuthProvider.PROVIDER_ID]: <FaSquareFacebook />,
    [GithubAuthProvider.PROVIDER_ID]: <FaGithub />,
    [TwitterAuthProvider.PROVIDER_ID]: <FaXTwitter />,
  };

  const onSignInError = (methods: string[]) => {
    methods = methods.map((method) => method.split(".")[0]);

    setToastMessage(
      `An account with this email already exists. Please sign in with your ` +
        `${methods.join("or ")} account, and link your accounts under account settings.`
    );
    setShowToast(true);
  };

  return (
    <>
      <CustomToast
        showToast={showToast}
        message={toastMessage}
        onClose={() => {
          setShowToast(false);
        }}
        delay={10000}
      />
      <Button onClick={() => setShowLoginModal(true)}>Sign in</Button>

      <Modal show={showLoginModal}>
        <Modal.Header
          closeButton
          onHide={() => {
            setShowLoginModal(false);
          }}
        >
          <Modal.Title>Sign in</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {supportedProviders.map((provider) => (
            <Row key={provider} className="my-2">
              <Button
                onClick={() => {
                  signInWith(provider).catch((methods) => {
                    onSignInError(methods);
                  });
                }}
                variant="outline-dark"
                className="py-2 d-flex align-items-center"
              >
                {icons[provider]}
                <span className="d-flex w-100 justify-content-center">
                  Continue with {}
                  {/*Removes the '.com' and capitalizes first letter */}
                  {provider.split(".")[0][0].toUpperCase() +
                    provider.split(".")[0].slice(1)}
                </span>
              </Button>
            </Row>
          ))}
        </Modal.Body>
      </Modal>
    </>
  );
};

export default LoginButton;
