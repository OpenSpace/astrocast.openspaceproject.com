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

import { useRef, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Overlay from 'react-bootstrap/Overlay';
import Tooltip from 'react-bootstrap/Tooltip';
import { FaRegCopy } from 'react-icons/fa6';

interface ShareServerLinkProps {
  instanceID: string;
}

function ShareServerLink({ instanceID }: ShareServerLinkProps) {
  const [showOverlay, setShowOverlay] = useState(false);

  const target = useRef(null);

  function copyToClipboard() {
    /*TODO: copy correct addres/port to clipboard */
    navigator.clipboard.writeText(`${window.location.origin}/join-server/${instanceID}`);
    setShowOverlay(true);
    setTimeout(() => {
      setShowOverlay(false);
    }, 1500);
  }

  return (
    <>
      <Button
        variant="outline-dark"
        className="d-flex justify-content-center align-items-center gap-2"
        ref={target}
        onClick={copyToClipboard}
      >
        Copy link <FaRegCopy />
      </Button>
      <Overlay target={target.current} show={showOverlay} placement="top">
        {(props) => (
          <Tooltip id="overlay-example" {...props}>
            Copied to clipboard!
          </Tooltip>
        )}
      </Overlay>
    </>
  );
}

export default ShareServerLink;
