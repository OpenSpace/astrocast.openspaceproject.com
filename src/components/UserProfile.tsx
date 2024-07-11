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

import { auth, getProvider, supportedProviders } from "@/firebaseconfig";
import { AuthContext } from "./AuthProvider";
import CustomToast from "./CustomToast";
import { linkWithPopup, signOut } from "firebase/auth";
import { useContext, useState } from "react";
import Button from "react-bootstrap/Button";
import Image from "react-bootstrap/Image";
import Modal from "react-bootstrap/Modal";
import Row from "react-bootstrap/Row";

const UserProfile = () => {
  const user = useContext(AuthContext);
  const [showModal, setShowModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const linkedAccounts = user?.providerData.map((provider) => provider.providerId);
  const unlinkedAccounts = supportedProviders.filter(
    (provider) => !linkedAccounts?.includes(provider)
  );

  const handleClose = () => {
    setShowModal(false);
  };
  const handleShow = () => {
    setShowModal(true);
  };

  const logout = async () => {
    await signOut(auth);
    setShowModal(false);
  };

  return (
    <>
      <CustomToast
        showToast={showToast}
        message={toastMessage}
        onClose={() => {
          setShowToast(false);
        }}
      />
      {
        <Image
          style={{ maxHeight: "58px" }}
          role={"button"}
          // eslint-disable-next-line no-unneeded-ternary
          roundedCircle={user ? true : false}
          src={user?.photoURL ?? "/images/icon.png"}
          referrerPolicy="no-referrer"
          onClick={handleShow}
        />
      }
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title as={"div"} className="ms-auto">
            {user?.email}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="d-flex flex-column justify-content-center align-items-center gap-3">
          <Image
            // eslint-disable-next-line no-unneeded-ternary
            roundedCircle={user ? true : false}
            src={user?.photoURL ?? "/images/icon.png"}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/images/icon.png";
            }}
          />
          <h3>Hi {user?.displayName ?? "Anonymous"}!</h3>
          <Row>
            <p>Linking your account allows you to login using multiple providers</p>
            {unlinkedAccounts.map((provider) => (
              <Button
                key={provider + "link"}
                onClick={() => {
                  linkWithPopup(user!, getProvider(provider))
                    .then((_result) => {
                      setToastMessage("Account linked successfully");
                      setShowToast(true);
                      unlinkedAccounts.splice(unlinkedAccounts.indexOf(provider), 1);
                    })
                    .catch((error) => {
                      console.log(error);
                      setToastMessage("Error linking account. Please try again.");
                      setShowToast(true);
                      setShowModal(false);
                    });
                }}
                className="py-2 my-1"
                variant="outline-dark"
              >
                Link account with {provider.split(".")[0]}
              </Button>
            ))}
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={logout} className="lg">
            Sign out
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default UserProfile;
