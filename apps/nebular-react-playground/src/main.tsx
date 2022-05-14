import 'reflect-metadata';
import { container } from '@nebular-react';
import { Provider } from 'libs/nebular-react/src/ioc-provider';
import { StrictMode } from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';

import App from './app/app';

ReactDOM.render(
  <StrictMode>
    <BrowserRouter>
      <Provider container={container('en-US')}>
        <App />
      </Provider>
    </BrowserRouter>
  </StrictMode>,
  document.getElementById('root')
);
