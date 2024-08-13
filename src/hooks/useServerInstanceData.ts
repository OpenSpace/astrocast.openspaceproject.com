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

import { AuthContext } from '@/components/AuthProvider';
import { db } from '@/firebaseconfig';
import { DataSnapshot, onValue, ref } from 'firebase/database';
import { useContext, useEffect, useState } from 'react';

function useServerInstanceData(isAdmin: boolean = false) {
  const user = useContext(AuthContext);

  // TODO: Actually validate admin status over using a flag
  const [instances, setInstances] = useState<ServerInstanceData[]>([]);

  useEffect(() => {
    const instanceDbRef = ref(db, 'InstanceData');

    function handleData(snapshot: DataSnapshot) {
      if (snapshot.exists()) {
        const data = snapshot.val();

        // If we are admin we want to see all instances
        if (isAdmin) {
          setInstances(Object.values<ServerInstanceData>(data));
          return;
        }

        // If we are not admin, and logged in we can see both public and private servers
        // created by this user. Otherwise we will only show public instances
        const filteredInstances = Object.values<ServerInstanceData>(data).filter(
          (instance: ServerInstanceData) => {
            // If the server is public we include it
            if (!instance.isPrivate) {
              return true;
            }

            return user?.uid === instance.owner;
          }
        );

        setInstances(Object.values<ServerInstanceData>(filteredInstances));
      } else {
        // TODO: Handle no data available
        setInstances([]);
      }
    }

    function handleError(error: Error) {
      // TODO: Handle error
      console.log('Error fetching instance data: ', error);
      setInstances([]);
    }

    const unsubscribe = onValue(instanceDbRef, handleData, handleError);

    return () => {
      // Cleanup
      unsubscribe();
    };
  }, [user]);

  return instances;
}

export default useServerInstanceData;
