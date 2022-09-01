import { useEffect, useState } from "react";
import GameCard from "./GameCard";
import SideContent from "./SideContent";

export default function LeftColumn(props) {
  const gameweek = props.gameweek;

  const [fixtureData, setFixtureData] = useState([]);
  const [selectedFixture, setSelectedFixture] = useState("");
  const [visible, setVisible] = useState(false);

  // ON GAMEWEEK CHANGE
  useEffect(() => {
    // RESET STATE
    setFixtureData([]);

    // GET NEW DATA
    async function getData() {
      const res = await fetch(`/gameweek/${gameweek}`);
      const data = await res.json();

      setFixtureData(data);
    }
    getData();
  }, [gameweek]);

  return (
    <>
      <SideContent
        visible={visible}
        setVisible={setVisible}
        fixture={selectedFixture}
      />
      <div className="halfContainer left">
        <div className="center">
          <div className="sectionContainerRow">
            <h1 className="center">Fixtures</h1>
            <h2 className="center">Gameweek {gameweek}</h2>
          </div>
          <hr></hr>
          <div className="sectionContainerRow">
            {fixtureData.map((fixture) => (
              <GameCard
                fixture={fixture}
                setSelectedFixture={setSelectedFixture}
                setVisible={setVisible}
              />
            ))}
          </div>
          <hr></hr>
        </div>
      </div>
    </>
  );
}
