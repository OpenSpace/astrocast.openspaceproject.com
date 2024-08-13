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

import useInstanceOwnerName from '@/hooks/useInstanceOwnerName';
import StatisticsChart from './StatisticsChart';
import {
  InstanceBody,
  InstanceBodyEntry,
  InstanceHeader,
  InstanceHeaderChevron,
  InstanceHeaderEntry,
  InstanceWrapper
} from './InstanceMapper';
import { useState } from 'react';
import Container from 'react-bootstrap/Container';

interface InstanceHistoryProps {
  instance: InstanceHistoryData;
  statistics?: Statistics;
}
const InstanceHistory = ({ instance, statistics }: InstanceHistoryProps) => {
  const [showMore, setShowMore] = useState(false);

  const userName = useInstanceOwnerName(instance.owner);

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
            header="Created"
            value={new Date(instance.created).toLocaleString()}
            props={{ md: 2 }}
          />
          <InstanceHeaderEntry
            header="Total Usage"
            value={instance.usage}
            props={{ md: 1 }}
          />

          <InstanceHeaderEntry
            header="Last Used"
            value={new Date(instance.inactiveTimeStamp).toLocaleString()}
            props={{ md: 2 }}
          />

          <InstanceHeaderChevron
            showMore={showMore}
            callback={() => setShowMore(!showMore)}
          />
        </InstanceHeader>

        {showMore && (
          <InstanceBody>
            <InstanceBodyEntry header="ID" value={instance.id} />
            <InstanceBodyEntry header="Owner" value={userName ?? instance.owner} />
            {statistics && <StatisticsChart statistics={statistics} />}
          </InstanceBody>
        )}
      </Container>
    </InstanceWrapper>
  );
};

export default InstanceHistory;
