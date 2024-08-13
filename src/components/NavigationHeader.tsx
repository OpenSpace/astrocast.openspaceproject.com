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

import '@/styles/global.css';
import { AuthContext } from './AuthProvider';
import LoginButton from './LoginButton';
import UserProfile from './UserProfile';
import { useContext } from 'react';
import Col from 'react-bootstrap/Col';
import Image from 'react-bootstrap/Image';
import NavBar from 'react-bootstrap/NavBar';
import { Link } from 'react-router-dom';

const NavigationHeader = () => {
  const authenticatedUser = useContext(AuthContext);

  return (
    <NavBar className="px-3" style={{ background: '#ffff', minHeight: 74 }}>
      <NavBar.Brand as={Link} to={'/'}>
        <Image
          src={'/images/icon.png'}
          width={30}
          height={30}
          className="d-inline-block align-top"
        />{' '}
        <h4 className="d-inline-block">Parallel Connection</h4>
      </NavBar.Brand>

      <Col className="d-flex justify-content-end">
        {authenticatedUser ? <UserProfile /> : <LoginButton />}
      </Col>
    </NavBar>
  );
};

export default NavigationHeader;
