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

import { db } from '@/firebaseconfig';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { useEffect, useState } from 'react';

function useServerStatisticsData() {
  const [statistics, setStatistics] = useState<Statistics[]>([]);

  useEffect(() => {
    const statisticsRef = ref(db, 'Statistics');

    const handleData = (snapshot: DataSnapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // Get the server instance IDs
        const ids = Object.keys(data);

        // Convert the data to an array of Statistics objects
        const tmp: Statistics[] = [];
        for (const id of ids) {
          const stats = data[id];
          const statsData = Object.values<StatisticData>(stats);

          const stat: Statistics = {
            id: id,
            data: statsData
          };
          tmp.push(stat);
        }
        setStatistics(tmp);
      } else {
        setStatistics([]);
      }
    };

    const handleError = (error: Error) => {
      console.log('Error fetching statistics data: ', error);
      setStatistics([]);
    };

    const unsubscribe = onValue(statisticsRef, handleData, handleError);

    return () => {
      unsubscribe();
    };
  }, []);
  return statistics;
}

export default useServerStatisticsData;
