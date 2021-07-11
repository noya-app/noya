import { Stack, Heading } from '../components/ui';

function App() {
  return (
    <Stack
      axis="y"
      width="100%"
      height="100vh"
      padding="10rem"
      background="black"
    >
      <header style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
        <span>Noya</span>
        <span style={{ justifySelf: 'end' }}>GitHub</span>
      </header>
      <Heading level={1}>
        Open
        <br />
        Source
        <br />
        Design
      </Heading>
      <p>Build your own design tool.</p>
      {/* <p>Noya is an open-source toolkit to build your own design tool.</p> */}
      {/* <p>An open-source toolkit to build your own design tool.</p> */}
    </Stack>
  );
}

export default App;
