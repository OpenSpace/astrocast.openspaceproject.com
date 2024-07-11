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

import Col, { ColProps } from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";

interface InstanceWrapperProps {
  children: React.ReactNode;
}

export const InstanceWrapper = ({ children }: InstanceWrapperProps) => {
  return (
    <div
      className="my-3"
      style={{ background: "#ffff", boxShadow: "0 0 5px 0 #bdbdbd", borderRadius: 10 }}
    >
      {children}
    </div>
  );
};

interface InstanceHeaderProps {
  children: React.ReactNode;
}
export const InstanceHeader = ({ children }: InstanceHeaderProps) => {
  return (
    <Row
      className="py-3 pe-3"
      style={{
        backgroundColor: "#464646",
        color: "#ffff",
        boxShadow: "0 0 5px 0 #bdbdbd",
        borderRadius: 10,
      }}
    >
      {children}
    </Row>
  );
};

interface InstanceHeaderEntryProps {
  header: string;
  value: string | number | null | JSX.Element;
  props?: ColProps;
}
export const InstanceHeaderEntry = ({
  header,
  value,
  props,
}: InstanceHeaderEntryProps) => {
  return (
    <Col md={props?.md}>
      <Container>
        <Row style={{ fontSize: 12 }}>{header}</Row>
        <Row>{value}</Row>
      </Container>
    </Col>
  );
};

interface InstanceHeaderChevronProps {
  showMore: boolean;
  callback: () => void;
}

export const InstanceHeaderChevron = ({
  showMore,
  callback,
}: InstanceHeaderChevronProps) => {
  return (
    <Col
      onClick={callback}
      role="button"
      className="d-flex align-items-center justify-content-end"
    >
      {showMore ? <FaChevronUp /> : <FaChevronDown />}
    </Col>
  );
};

interface InstanceBodyProps {
  children: React.ReactNode;
}
export const InstanceBody = ({ children }: InstanceBodyProps) => {
  return (
    <Container
      className="my-2"
      style={{
        background: "#ffff",
        color: "#333333",
        borderRadius: "0 0 10px 10px",
      }}
    >
      {children}
    </Container>
  );
};

interface InstanceBodyEntryProps {
  header: string;
  value: string | number | null | JSX.Element;
}

export const InstanceBodyEntry = ({ header, value }: InstanceBodyEntryProps) => {
  return (
    <Row className="py-2 border-bottom">
      <Col>{header}</Col>
      <Col className="d-flex justify-content-end">{value}</Col>
    </Row>
  );
};
