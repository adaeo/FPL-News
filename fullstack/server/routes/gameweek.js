var express = require("express");
var router = express.Router();
const axios = require("axios");

// Custom error type to have variable message and status code.
class StatusError extends Error {
  constructor(message, status) {
    super(message, status);
    this.message = message;
    this.status = status;
  }
}

// Get list of fixtures for the given gameweek
router.get("/:event", async (req, res) => {
  try {
    if (!req.params.event || req.params.event <= 0 || req.params.event >= 39) {
      throw new StatusError("event parameter must be between 1 and 38 inclusive!", 400);
    }

    const event = req.params.event;

    // Check if string is integer
    if (/^\d+$/.test(event) == false) {
      throw new StatusError("parameter must be an integer!", 400);
    }

    const url = "https://fantasy.premierleague.com/api/";

    // Get raw team data
    const raw_ele = await axios.get(`${url}bootstrap-static/`);
    const raw_team_data = raw_ele.data.teams;

    // Get raw fixture data
    const raw_fix = await axios.get(`${url}fixtures/?event=${event}`);
    const raw_fix_data = raw_fix.data;

    // Process data
    const prc_data = raw_fix_data.map(item => {
      
      const team_a_name = raw_team_data.find(team => team.id == item.team_a);
      const team_h_name = raw_team_data.find(team => team.id == item.team_h);

      // Build processed item
      prc_item = {
        event: item.event,
        finished: item.finished,
        id: item.id,
        kickoff_time: item.kickoff_time,
        team_a_id: item.team_a,
        team_a_name: team_a_name.name,
        team_a_score: item.team_a_score,
        team_h_id: item.team_h,
        team_h_name: team_h_name.name,
        team_h_score: item.team_h_score,
      }

      return prc_item;
    })

    // Send response
    res.status(200).json(prc_data);

  } catch (err) {
    if (err instanceof StatusError) {
      res.status(err.status).json({ error: true, message: err.message });
    } else {
      res.status(500).json({ error: true, message: err.message });
    }
  }
});

module.exports = router;
