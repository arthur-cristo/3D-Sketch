import TwoDimensionCanvas from "./components/2d";
import ThreeDimensionsCanvas from "./components/3d";
import ChangeModeButton from "./components/ui/ChangeModeButton";

function App() {
  return (
    <>
      <TwoDimensionCanvas />
      <ThreeDimensionsCanvas />
      <ChangeModeButton />
    </>
  );
}

export default App;
