import React, { StrictMode, Suspense } from 'react';
import * as ReactDOM from 'react-dom';

import App from './App';
import './index.css';

ReactDOM.render(
  <StrictMode>
    <Suspense fallback="Loading...">
      <App />
    </Suspense>
  </StrictMode>,
  document.getElementById('root'),
);
