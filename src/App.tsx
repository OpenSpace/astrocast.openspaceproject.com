import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { BrowserRouter, Route, Routes } from 'react-router';
import { MantineProvider } from '@mantine/core';
import { ModalsProvider } from '@mantine/modals';
import { Notifications } from '@mantine/notifications';

import { LuaApiProvider } from '@/api/LuaApiProvider';
import { AppLayout } from '@/components/AppLayout.tsx';
import { AdminPage } from '@/pages/AdminPage.tsx';
import { HomePage } from '@/pages/HomePage';
import { ServerLinkPage } from '@/pages/ServerLinkPage.tsx';
import { store } from '@/redux/store';

import { AuthListener } from './components/AuthListener.tsx';
import { theme } from './mantineTheme.ts';

import '@mantine/core/styles.css';
import '@mantine/charts/styles.css';
import '@mantine/notifications/styles.css';
import './App.css';

function App() {
  return (
    <Provider store={store}>
      {/* We want to place the Lua API provider outside the StrictMode as it creates a
      socket connection. Strict mode calls useEffects twice and the socket does not
      handle this well.*/}
      <LuaApiProvider>
        <StrictMode>
          <MantineProvider theme={theme} defaultColorScheme="dark">
            <ModalsProvider>
              <Notifications autoClose={6000} />
              <AuthListener />
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
            </ModalsProvider>
          </MantineProvider>
        </StrictMode>
      </LuaApiProvider>
    </Provider>
  );
}

export default App;
