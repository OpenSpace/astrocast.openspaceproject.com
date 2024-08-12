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

import { AuthContext } from "@/components/AuthProvider";
import CustomToast from "@/components/CustomToast";
import { OpenSpaceContext } from "@/components/OpenSpaceProivder";
import useServerInstanceWithID from "@/hooks/useServerInstanceWithID";
import { useContext, useEffect, useState } from "react";
import Button from "react-bootstrap/Button";
import { useParams } from "react-router-dom";
import Container from "react-bootstrap/Container";

const ServerLink = () => {
  const openspace = useContext(OpenSpaceContext);
  const user = useContext(AuthContext);

  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const username = user?.displayName || "Guest";

  // Retrieve the server ID from the URL
  const { id } = useParams();
  const instance = useServerInstanceWithID(id);

  // Get the server instance from firebase
  const connectToInstanceServer = async () => {
    if (!openspace) {
      setToastMessage("Not connected to OpenSpace");
      setShowToast(true);
      return;
    }
    if (isConnecting) {
      return;
    }
    if (!instance) {
      setToastMessage("Could not find the session");
      setShowToast(true);
      return;
    }
    setIsConnecting(true);
    // We don't set the host password when joining from a link. Since this room is most
    // likely private
    await openspace.parallel.joinServer(
      import.meta.env.VITE_WORMHOLE_PORT.toString(),
      import.meta.env.VITE_WORMHOLE_ADDRESS.toString(),
      instance.roomName,
      instance.password,
      "",
      username
    );
    setToastMessage(`Joined session: ${instance.roomName}`);
    setShowToast(true);
    setIsConnected(true);
  };

  useEffect(() => {
    connectToInstanceServer();
  }, [instance]);

  return (
    <>
      <CustomToast
        message={toastMessage}
        showToast={showToast}
        onClose={() => {
          setShowToast(false);
        }}
      ></CustomToast>
      <Container>
        <div>
          <p>Your session has started in OpenSpace</p>
          <p>
            If you don't see the session, click <b>Join Session</b> below
          </p>
        </div>

        <Button
          variant="success"
          className="px-5 py-2 mt-3"
          onClick={() => {
            // If the automatic connection failed we need to reset the connection flag
            setIsConnecting(false);
            setIsConnected(false);
            connectToInstanceServer();
          }}
        >
          {isConnected
            ? "Connected"
            : isConnecting
              ? "Joining Session..."
              : "Join Session"}
        </Button>
      </Container>
    </>
  );
};

export default ServerLink;
