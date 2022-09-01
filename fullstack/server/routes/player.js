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

// Get best player of the gameweek and associated statistics
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

    // Get data from API
    const url = "https://fantasy.premierleague.com/api/";
    const raw_ele = await axios.get(`${url}bootstrap-static/`);

    // Get position types
    const all_position_data = raw_ele.data.element_types;

    // Get all team data
    const all_team_data = raw_ele.data.teams;

    // Get all player data
    const all_player_data = raw_ele.data.elements;

    // Get global player data averages
    let inf = 0; // influence score
    let cre = 0; // creativity score
    let thr = 0; // threat score
    let ict = 0; // ict index score
    let countedPlayers = 0; // players who are counted

    const num_players = all_player_data.length;

    // Get sums from players who have at least 1 point
    for (let i = 0; i < num_players; i++) {
      if (all_player_data[i].total_points > 0) {
        inf += parseFloat(all_player_data[i].influence);
        cre += parseFloat(all_player_data[i].creativity);
        thr += parseFloat(all_player_data[i].threat);
        ict += parseFloat(all_player_data[i].ict_index);
        countedPlayers++;
      }
    }

    // Get averages (rounded to 2 decimals)
    const avg_inf = (inf/countedPlayers).toFixed(2);
    const avg_cre = (cre/countedPlayers).toFixed(2);
    const avg_thr = (thr/countedPlayers).toFixed(2);
    const avg_ict = (ict/countedPlayers).toFixed(2);

    // Get best player of the week
    const event_data = raw_ele.data.events.find((item) => item.id == event);
    if (event_data.top_element_info == null) {
      throw new StatusError("This game week has not been started yet!", 400);
    }
    const player_id = event_data.top_element_info.id;

    // Get player data
    const player_data = raw_ele.data.elements.find((player) => player.id == player_id);

    // Get player's team
    const team_data = all_team_data.find((team) => team.id == player_data.team);
    const team = team_data.name;

    // Get player's position
    const position_data = all_position_data.find((pos) => pos.id == player_data.element_type);
    const position = position_data.singular_name;

    // Get image id and retrieve from Premier League database
    const image_id = player_data.photo.split('.')[0];
    const player_image = `https://resources.premierleague.com/premierleague/photos/players/250x250/p${image_id}.png`

    // Build charts and get data
    const base_url = "https://image-charts.com/chart?";

    // build pie chart for selected by percentage
    const build_selected_pie = (selected_by) => {
      const percent = parseFloat(selected_by).toFixed(1);
      const remain = (100 - percent).toFixed(1);
      const colors = "chco=81ff73%2Cff513d";
      const data = `&chd=t%3A${percent}%2C${remain}`;
      const legend_labels = "&chdl=Selected%7CNot%20Selected";
      const legend_label_style = "&chdls=000000,20";
      const legend_pos = "&chdlp=b";
      const pie_labels = `&chl=${percent}%25%7C${remain}%25`;
      const pie_label_style = "&chlps=font.size,20"
      const chart_size = "&chs=500x500";
      const chart_type = '&cht=p';
      return base_url + colors + data + legend_labels + legend_pos + legend_label_style + pie_labels + pie_label_style + chart_size + chart_type;
    };
    const selected_image_url = build_selected_pie(player_data.selected_by_percent);
    
    // Get image data as binary data string in array Buffer
    const pie_chart = await axios.get(selected_image_url, {
      responseType: "arraybuffer",
    });
    // Convert binary data to base64 encoded data
    let pie_chart_64 = Buffer.from(pie_chart.data, "binary").toString("base64");

    // build radar chart for statistic averages
    const build_radar_bar = (avg, pyr) => {
      const colors = "chco=3aa5e8%2Cb3b3b3";
      const data = `&chd=t%3A${pyr[0]}%2C${pyr[1]}%2C${pyr[2]}%2C${pyr[3]}%2C0%7C${avg[0]}%2C${avg[1]}%2C${avg[2]}%2C${avg[3]}%2C0`;
      const legend_labels = "&chdl=Player%7CAverage";
      const axis_labels = "&chl=Influence%7CCreativity%7CThreat%7CICT%20Index";
      const legend_pos = "&chdlp=b";
      const chart_size = "&chs=550x550";
      const chart_type = "&cht=r";
      const axis = "&chxt=r";
      return base_url + colors + data + legend_labels + legend_pos + axis_labels + chart_size + chart_type + axis;
    };
    const global_avg = [avg_inf, avg_cre, avg_thr, avg_ict];
    const player_score = [
      player_data.influence,
      player_data.creativity,
      player_data.threat,
      player_data.ict_index,
    ];
    const stat_image_url = build_radar_bar(global_avg, player_score);

    // Get image data as binary data string in array Buffer
    const radar_chart = await axios.get(stat_image_url, {
      responseType: "arraybuffer",
    });
    // Convert binary data to base64 encoded data
    let radar_chart_64 = Buffer.from(radar_chart.data, "binary").toString("base64");

    const top_player = {
      id: event_data.top_element_info.id,
      points: event_data.top_element_info.points,
      name: `${player_data.first_name} ${player_data.second_name}`,
      team: team,
      position: position,
      selected_by: player_data.selected_by_percent,
      influence: player_data.influence,
      creativity: player_data.creativity,
      threat: player_data.threat,
      ict_index: player_data.ict_index,
      photo: player_image,
      selected_image: pie_chart_64,
      stat_image: radar_chart_64,
    };

    // Send response
    res.status(200).json(top_player);

  } catch (err) {
    if (err instanceof StatusError) {
      res.status(err.status).json({ error: true, message: err.message });
    } else {
      res.status(500).json({ error: true, message: err.message });
    }
  }
});

module.exports = router;
