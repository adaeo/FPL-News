import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { useState } from "react";
import RightColumn from "./components/RightColumn";
import LeftColumn from "./components/LeftColumn";

function App() {
  const [gameweek, setGameWeek] = useState(1);

  return (
    <div className="App">
      <div className="navigation">
        {gameweek > 1 && (
          <div className="prevContainer" onClick={() => setGameWeek(gameweek - 1)}>
            <h1>Previous</h1>
          </div>
        )}
        <div className="titleContainer">
          <h1>Gameweek {gameweek}</h1>
        </div>
        {gameweek < 38 && (
          <div className="nextContainer" onClick={() => setGameWeek(gameweek + 1)}>
            <h1>Next</h1>
          </div>
        )}
      </div>
      <div className="mainContainer">
        <LeftColumn gameweek={gameweek} />
        <RightColumn gameweek={gameweek} />
      </div>
    </div>
  );
}

export default App;
