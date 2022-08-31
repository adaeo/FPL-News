import Card from "react-bootstrap/Card";

export default function GameCard(props) {
  const news = props.news;

  return (
    <Card className="mx-2 my-2">
      <Card.Body>
        <Card.Title style={{ fontSize: "1.5em" }}>{news.title}</Card.Title>
        <Card.Subtitle style={{ fontSize: "1em" }}>
          By {news.author}
        </Card.Subtitle>
        <Card.Text className="text-muted mb-2">{news.published_date}</Card.Text>
        <Card.Text>{news.excerpt}</Card.Text>
        <Card.Link href={news.link}>Read More</Card.Link>
      </Card.Body>
    </Card>
  );
}
