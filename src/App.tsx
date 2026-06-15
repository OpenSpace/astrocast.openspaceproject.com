import { StrictMode } from 'react';
import { Provider } from 'react-redux';

import { LuaApiProvider } from '@/api/LuaApiProvider';
import { store } from '@/redux/store';

import { Foo } from './somepage';

import './App.css';

function App() {
  return (
    <Provider store={store}>
      {/* We want to place the Lua API provider outside the StrictMode as it creates a
      socket connection. Strict mode calls useEffects twice and the socket does not
      handle this well.*/}
      <LuaApiProvider>
        <StrictMode>
          <>
            <div>Hello</div>
            <Foo />
          </>
        </StrictMode>
      </LuaApiProvider>
    </Provider>
  );
}

export default App;
