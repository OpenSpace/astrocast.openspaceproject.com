import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router';
import { MantineProvider } from '@mantine/core';

import { LuaApiProvider } from '@/api/LuaApiProvider';
import { AdminPage } from '@/pages/AdminPage.tsx';
import { HomePage } from '@/pages/HomePage';
import { ServerLinkPage } from '@/pages/ServerLinkPage.tsx';
import { store } from '@/redux/store';

import { theme } from './mantineTheme.ts';

import '@mantine/core/styles.css';
import './App.css';
import { AppLayout } from '@/components/AppLayout.tsx';

function App() {
  return (
    <Provider store={store}>
      {/* We want to place the Lua API provider outside the StrictMode as it creates a
      socket connection. Strict mode calls useEffects twice and the socket does not
      handle this well.*/}
      <LuaApiProvider>
        <StrictMode>
          <MantineProvider theme={theme} defaultColorScheme="dark">
            <BrowserRouter>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/admin" element={<AdminPage />} />
                  <Route path="/join-server/:id" element={<ServerLinkPage />} />
                  {/* Fallback route for any undefined paths */}
                  <Route path="*" element={<HomePage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </MantineProvider>
        </StrictMode>
      </LuaApiProvider>
    </Provider>
  );
}

export default App;
