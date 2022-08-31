import { useEffect, useState } from "react";
import Offcanvas from "react-bootstrap/Offcanvas";
import NewsCard from "./NewsCard";

export default function LeftColumn(props) {
  const fixture = props.fixture;
  const visible = props.visible;
  const setVisible = props.setVisible;

  const [newsData, setNewsData] = useState([]);

  // ON GAMEWEEK CHANGE
  useEffect(() => {
    // RESET STATE
    setNewsData([]);

    // GET NEW DATA
    async function getData() {
      const res = await fetch(`/api/news/?query=${fixture}`);
      const data = await res.json();
      console.log(data);

      setNewsData(data);
    }
    if (fixture) {
      getData();
    }
  }, [fixture]);

  return (
    <Offcanvas show={visible} onHide={() => setVisible(false)}>
      <Offcanvas.Header closeButton>
        <Offcanvas.Title>News</Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body>
        {newsData.map(news => <NewsCard news={news}/>)}
        {newsData.length === 0 && <h3>No News to Show...</h3>}
      </Offcanvas.Body>
    </Offcanvas>
  );
}
