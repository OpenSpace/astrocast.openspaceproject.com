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

import { User } from "firebase/auth";

export const handleNewRoomForm = async (
  e: React.FormEvent<HTMLFormElement>,
  user: User | null,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onSuccess: (data: ServerInstanceData) => void,
  onError: (message: string) => void
) => {
  e.preventDefault();

  // Read the form data
  const form = e.currentTarget;
  const formData = new FormData(form);
  // Convert to JSON object
  const formJson = Object.fromEntries(formData.entries());

  // Add the user token id if they are online
  const uid = await user?.getIdToken();
  if (uid) {
    formJson["token"] = uid;
  }

  const apiUrl = import.meta.env.VITE_SERVER_API_PATH;

  fetch(`${apiUrl}/request-server-instance`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formJson),
  })
    .then((response) => {
      if (!response.ok) {
        return response.json().then((obj) => {
          throw new Error(obj.error);
        });
      }
      return response.json();
    })
    .then((data: ServerInstanceData) => {
      onSuccess(data);
    })
    .catch((error) => {
      onError(error.message);
    });
};

export const handleAdminRightsForm = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();

  const form = e.currentTarget;
  const formData = new FormData(form);
  const formJson = Object.fromEntries(formData.entries());
  const apiUrl = import.meta.env.VITE_SERVER_API_PATH;

  const response = await fetch(`${apiUrl}/request-admin-rights`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formJson),
  });

  const data = await response.json();

  if (!response.ok) {
    throw data.error;
  }
  return data.message;
};

export const isUserAdmin = async (user: User | null): Promise<boolean> => {
  if (!user) return false;

  const tokenResult = await user.getIdTokenResult();
  return tokenResult.claims?.admin === true;
};
