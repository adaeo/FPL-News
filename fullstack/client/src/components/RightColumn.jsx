import { useEffect, useState } from "react";
import { Image } from "react-bootstrap";

export default function RightColumn(props) {
  const [playerData, setPlayerData] = useState("");
  const [playerStatImage, setPlayerStatImage] = useState(null);
  const [playerSelectedImage, setPlayerSelectedImage] = useState(null);
  const [playerProfileImage, setPlayerProfileImage] = useState(null);

  const gameweek = props.gameweek;

  // ON GAMEWEEK CHANGE
  useEffect(() => {
    // RESET STATE
    setPlayerData("");
    setPlayerStatImage(null);
    setPlayerSelectedImage(null);
    setPlayerProfileImage(null);

    // GET NEW DATA

    async function getData() {
      try {
        const res = await fetch(`/player/${gameweek}`);
        if (res.status !== 200) {
          throw new Error("Status was not ok!");
        }
        const data = await res.json();
        setPlayerData(data);
        setPlayerStatImage(data.stat_image);
        setPlayerSelectedImage(data.selected_image);
        setPlayerProfileImage(data.photo);
      } catch (err) {
        setPlayerData("This gameweek has not been started!");
        setPlayerStatImage(null);
        setPlayerSelectedImage(null);
        setPlayerProfileImage(null);
      }
    }
    getData();
  }, [gameweek]);

  return (
    <div className="halfContainer right">
      <div className="center">
        <div className="sectionContainerRow">
          <h1 className="center">Player of the Week</h1>
          <h2 className="center">{playerData.name}</h2>
        </div>
        <hr></hr>
        <div className="sectionContainerCol">
          <div className="columnContainer">
            {playerProfileImage && (
              <>
                <h3>{playerData.name}</h3>
                <Image
                  className="center responsiveImg"
                  src={playerProfileImage}
                />
              </>
            )}
          </div>
          {playerData === "This gameweek has not been started!" ? (
            <h3>{playerData}</h3>
          ) : (
            <div className="columnContainer">
              <h3>Player Information</h3>
              <h5>Team: {playerData.team}</h5>
              <h5>Position: {playerData.position}</h5>
              <h5>Influence: {playerData.influence}</h5>
              <h5>Creativity: {playerData.creativity}</h5>
              <h5>Threat: {playerData.threat}</h5>
              <h5>ICT Index: {playerData.ict_index}</h5>
              <h5>This Week's Points: {playerData.points}</h5>
            </div>
          )}
          <div className="columnContainer">
            {playerStatImage && (
              <>
                <h3>% Selected</h3>
                <Image
                  className="center responsiveImg"
                  src={`data:image/jpeg;base64,${playerSelectedImage}`}
                />
              </>
            )}
          </div>
        </div>
        <hr></hr>
        <div className="sectionContainerRow">
          {playerStatImage && (
            <>
              <h4>{playerData.name}'s Performance Compared to all Players</h4>
              <Image
                className="center responsiveImg"
                src={`data:image/jpeg;base64,${playerStatImage}`}
              />
            </>
          )}
        </div>
        <hr></hr>
      </div>
    </div>
  );
}
