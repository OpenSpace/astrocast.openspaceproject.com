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

import useIsUserAdmin from '@/hooks/useIsUserAdmin';
import Container from 'react-bootstrap/Container';
import Col from 'react-bootstrap/Col';
import NavBar from 'react-bootstrap/NavBar';
import Nav from 'react-bootstrap/Nav';
import { NavLink } from 'react-router-dom';

function PageNavigationHeader() {
  const isAdmin = useIsUserAdmin();

  return (
    <Container>
      <NavBar>
        <Col as={'h4'}>
          <Nav style={{ boxShadow: '0px -1px 0px 0px #c3c3c3 inset' }}>
            <Nav.Link as={NavLink} to={'/'}>
              Home
            </Nav.Link>{' '}
            {isAdmin && (
              <Nav.Link as={NavLink} to={'/admin'}>
                Admin
              </Nav.Link>
            )}
          </Nav>
        </Col>
      </NavBar>
    </Container>
  );
}

export default PageNavigationHeader;
