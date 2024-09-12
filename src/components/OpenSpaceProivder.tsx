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

import CustomToast from './CustomToast';
import OpenSpaceApi from 'openspace-api-js';
import { createContext, useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import Row from 'react-bootstrap/Row';

interface AuthProviderProps {
  children: React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const OpenSpaceContext = createContext<any | null>(null);

function OpenSpaceProvider({ children }: AuthProviderProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [openspace, setOpenSpace] = useState<any | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [apiRef, setApiRef] = useState<any | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  // State to control if we can click connect/disconnect button
  const [buttonValid, setButtonValid] = useState(true);

  function connectOpenSpace() {
    if (isConnected) {
      return;
    }
    setButtonValid(false);
    apiRef?.connect();
  }

  function disconnectOpenSpace() {
    if (!isConnected) {
      return;
    }
    setButtonValid(false);
    apiRef?.disconnect();
  }

  useEffect(() => {
    const api = OpenSpaceApi(
      import.meta.env.VITE_OPENSPACE_ADDRESS,
      import.meta.env.VITE_OPENSPACE_PORT
    );

    api.onConnect(async () => {
      const os = await api.singleReturnLibrary();
      setOpenSpace(os);
      setIsConnected(true);
      setToastMessage('Connected to OpenSpace');
      setShowToast(true);
      setButtonValid(true);
    });

    api.onDisconnect(async () => {
      setIsConnected(false);
      setOpenSpace(null);
      setToastMessage('Disconnected from OpenSpace');
      setShowToast(true);
      setButtonValid(true);
    });

    setTimeout(() => {
      api.connect();
      setApiRef(api);
    }, 2000);
  }, []);

  return (
    <>
      <CustomToast
        message={toastMessage}
        showToast={showToast}
        onClose={() => {
          setShowToast(false);
        }}
      />
      <Container>
        <Container
          className="my-4 py-3"
          style={{ background: '#3db4c1', borderRadius: 10 }}
        >
          <Row>
            <Col style={{ color: '#ffff' }}>
              <div style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>
                Connected to OpenSpace
              </div>
              <div> {isConnected ? 'Yes' : 'No'}</div>
            </Col>
            <Col className="d-flex justify-content-end align-items-center">
              {isConnected ? (
                <Button
                  className="px-4 py-2"
                  variant="outline-light"
                  onClick={disconnectOpenSpace}
                  disabled={!buttonValid}
                >
                  {buttonValid ? 'Disconnect' : 'Disconnecting...'}
                </Button>
              ) : (
                <Button
                  className="px-4 py-2"
                  variant="outline-light"
                  onClick={connectOpenSpace}
                  disabled={!buttonValid}
                >
                  {buttonValid ? 'Connect' : 'Connecting...'}
                </Button>
              )}
            </Col>
          </Row>
        </Container>
      </Container>

      <OpenSpaceContext.Provider value={openspace}>{children}</OpenSpaceContext.Provider>
    </>
  );
}

export default OpenSpaceProvider;
