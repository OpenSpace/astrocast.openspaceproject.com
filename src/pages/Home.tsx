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
import DropDownWrapper from "@/components/DropDownWrapper";
import RequestNewRoomForm from "@/components/RequestNewRoomForm";
import useServerInstanceData from "@/hooks/useServerInstanceData";
import { handleNewRoomForm } from "@/shared/api";
import { User } from "firebase/auth";
import { useContext, useState } from "react";
import Container from "react-bootstrap/Container";

const Home = () => {
  const user = useContext(AuthContext);
  const instances = useServerInstanceData();
  const [connectedInstance, setConnectedInstance] = useState<string>("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("New room created");

  const onRoomCreate = (data: ServerInstanceData) => {
    setToastMessage(`New room created: ${data.roomName}`);
    setShowToast(true);
  };

  const onError = (message: string) => {
    setToastMessage(message);
    setShowToast(true);
  };

  return (
    <>
      <CustomToast
        message={toastMessage}
        showToast={showToast}
        onClose={() => setShowToast(false)}
      />
      <Container>
        <h1>Sessions</h1>
        {instances.length > 0 ? (
          instances.map((instance) => (
            <DropDownWrapper
              key={instance.id}
              instance={instance}
              connectedInstance={connectedInstance}
              setConnectedInstance={setConnectedInstance}
            ></DropDownWrapper>
          ))
        ) : (
          <div className="mb-3">No server instances available</div>
        )}
        {user ? (
          <RequestNewRoomForm
            onSubmitCallback={(
              e: React.FormEvent<HTMLFormElement>,
              user: User | null
            ) => {
              return handleNewRoomForm(e, user, onRoomCreate, onError);
            }}
          />
        ) : (
          <h3>Login to create a new room</h3>
        )}
      </Container>
    </>
  );
};
export default Home;
