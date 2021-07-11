import { Stack, Heading } from './ui';

import './App.css';

function App() {
  return (
    <Stack axis="y" width="100%" height="100vh" padding={32} background="black">
      <Heading level={1}>
        Open
        <br />
        Source
        <br />
        Design
      </Heading>
    </Stack>
  );
}

export default App;
