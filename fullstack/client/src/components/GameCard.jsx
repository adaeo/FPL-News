import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";

export default function GameCard(props) {
  const fixture = props.fixture;
  const setSelectedFixture = props.setSelectedFixture;
  const setVisible = props.setVisible;

  const title = `${fixture.team_h_name} vs ${fixture.team_a_name}`;

  return (
    <Card className="mx-4 my-2">
      <Card.Body>
        <Card.Title style={{ fontSize: "1.5em" }}>{title}</Card.Title>
        <Card.Subtitle style={{ fontSize: "2em" }}>
          {fixture.team_h_score} - {fixture.team_a_score}
        </Card.Subtitle>
        <Card.Text>{new Date(fixture.kickoff_time).toLocaleString()}</Card.Text>
        <Button
          primary
          onClick={() => {
            setSelectedFixture(`${fixture.team_h_name} ${fixture.team_a_name}`);
            setVisible(true);
          }}
        >
          Read About These Teams
        </Button>
      </Card.Body>
    </Card>
  );
}
