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

import useInstanceOwnerName from "@/hooks/useInstanceOwnerName";
import CloseServerButton from "./CloseServerButton";
import {
  InstanceBody,
  InstanceBodyEntry,
  InstanceHeader,
  InstanceHeaderChevron,
  InstanceHeaderEntry,
  InstanceWrapper,
} from "./InstanceMapper";
import StatisticsChart from "./StatisticsChart";
import { useState } from "react";
import Col from "react-bootstrap/Col";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import { FaCheck, FaX } from "react-icons/fa6";

type InstanceStatusProps = {
  instance: ServerInstanceData;
  statistics?: Statistics;
  callback: (message: string) => void;
};

const InstanceStatus = ({ instance, statistics, callback }: InstanceStatusProps) => {
  const [showMore, setShowMore] = useState(false);

  const userName = useInstanceOwnerName(instance.owner);

  const formatUpTime = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;

    // Convert milliseconds to hours, minutes, and seconds
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    // Format as a string
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  return (
    <InstanceWrapper>
      <Container>
        <InstanceHeader>
          <InstanceHeaderEntry
            header="Room Name"
            value={instance.roomName}
            props={{ md: 2 }}
          />
          <InstanceHeaderEntry
            header="Owner"
            value={userName ?? instance.owner}
            props={{ md: 2 }}
          />
          <InstanceHeaderEntry
            header="Created"
            value={new Date(instance.created).toLocaleString()}
            props={{ md: 2 }}
          />
          <InstanceHeaderEntry
            header="Uptime"
            value={formatUpTime(instance.created)}
            props={{ md: 2 }}
          />
          <InstanceHeaderEntry
            header="Status"
            value={
              instance.active ? (
                <div className="d-flex justify-content-start align-items-center gap-2 p-0">
                  Active
                  <FaCheck fill="#54bf87" />
                </div>
              ) : (
                <div className="d-flex justify-content-start align-items-center gap-2 p-0">
                  Inactive <FaX fill="#ff7a75" />
                </div>
              )
            }
            props={{ md: 1 }}
          />
          <InstanceHeaderChevron
            showMore={showMore}
            callback={() => setShowMore(!showMore)}
          />
        </InstanceHeader>
      </Container>

      {showMore && (
        <>
          <InstanceBody>
            <InstanceBodyEntry header="ID" value={instance.id} />
            <InstanceBodyEntry
              header="Address"
              value={import.meta.env.VITE_WORMHOLE_ADDRESS}
            />
            <InstanceBodyEntry header="Port" value={import.meta.env.VITE_WORMHOLE_PORT} />
            <InstanceBodyEntry
              header="Access"
              value={instance.isPrivate ? "Private" : "Public"}
            />
            <InstanceBodyEntry header="Total Usage" value={instance.usage} />
            {!instance.active && (
              <InstanceBodyEntry
                header="Inactive Time"
                value={formatUpTime(instance.inactiveTimeStamp)}
              />
            )}
            <InstanceBodyEntry header="Password" value={instance.password} />
            <InstanceBodyEntry header="Host Password" value={instance.hostPassword} />
            {instance.active && (
              <>
                <InstanceBodyEntry header="# Peers" value={instance.nPeers} />
                <InstanceBodyEntry header="Host" value={instance.currentHost} />
              </>
            )}
            <InstanceBodyEntry header="Profile" value={instance.profile} />

            <Row>
              <Col className="d-flex justify-content-end my-3 gap-2">
                <CloseServerButton
                  instanceID={instance.id}
                  text="Remove"
                  onRoomClosed={callback}
                />
              </Col>

              {statistics && <StatisticsChart statistics={statistics} />}
            </Row>
          </InstanceBody>
        </>
      )}
    </InstanceWrapper>
  );
};

export default InstanceStatus;
