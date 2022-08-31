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

router.get("/", function (req, res, next) {
  res
    .status(200)
    .json({ message: "Hello from server, the /api route is working!" });
});


// Get list of fixtures for the given gameweek
router.get("/gameweek/:event", async (req, res) => {
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

// Get list of news articles given a query
router.get("/news", async (req, res) => {
  try {

    const query = req.query;
    if (!query['query']) {
      throw new StatusError("you must include a query parameter!", 400);
    }

    // Get list of news articles from query
    const baseURL = "https://api.newscatcherapi.com/v2/search?";
    const buildURL = (q, lang='en', sort_by='relevancy', page='1', search_in='title', page_size=10) => {
      return baseURL + `q=${q}&lang=${lang}&sort_by=${sort_by}&page=${page}&search_in=${search_in}&page_size=${page_size}`
    }
    const headers = {
      headers: {
        'x-api-key': '690hLW9I6UfxS4vRnrRFWN_x-4HsrobrfW-xbFuwsSo'
      }
    }
    
    const url = buildURL(query["query"]);
    const raw_news = await axios.get(url, headers);

    // Send response
    res.status(200).json(raw_news.data.articles);

  } catch (err) {
    if (err instanceof StatusError) {
      res.status(err.status).json({ error: true, message: err.message });
    } else {
      res.status(500).json({ error: true, message: err.message });
    }
  }
});

// Get best player of the gameweek and associated statistics
router.get("/player/:event", async (req, res) => {
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

    const num_players = all_player_data.length;

    // Get sums
    for (let i = 0; i < num_players; i++) {
      inf += parseFloat(all_player_data[i].influence);
      cre += parseFloat(all_player_data[i].creativity);
      thr += parseFloat(all_player_data[i].threat);
      ict += parseFloat(all_player_data[i].ict_index);
    }

    // Get averages (rounded to 2 decimals)
    const avg_inf = (inf/num_players).toFixed(2);
    const avg_cre = (cre/num_players).toFixed(2);
    const avg_thr = (thr/num_players).toFixed(2);
    const avg_ict = (ict/num_players).toFixed(2);

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
      const percent = parseFloat(selected_by);
      const colors = "chco=81ff73%2Cff513d";
      const data = `&chd=t%3A${percent}%2C${100 - percent}`;
      const legend_labels = "&chdl=Selected%7CNot%20Selected";
      const legend_label_style = "&chdls=000000,20";
      const legend_pos = "&chdlp=b";
      const pie_labels = "&chl=8.0%25%7C90.0%25";
      const pie_label_style = "&chlps=font.size,20"
      const chart_size = "&chs=500x500";
      const chart_type = '&cht=pd';
      return base_url + colors + data + legend_labels + legend_pos + legend_label_style + pie_labels + pie_label_style + chart_size + chart_type;
    };
    const selected_image_url = build_selected_pie(player_data.selected_by_percent);
    
    // Get image data as binary data string in array Buffer
    const pie_chart = await axios.get(selected_image_url, {
      responseType: "arraybuffer",
    });
    // Convert binary data to base64 encoded data
    let pie_chart_64 = Buffer.from(pie_chart.data, "binary").toString("base64");

    // build bar chart for statistic averages
    const build_stat_bar = (avg, pyr) => {
      const colors = "chco=b3b3b3%2Cfffa69%7C3aa5e8%7Cff4053%7C7fff78";
      const data = `&chd=t%3A${avg[0]}%2C${avg[1]}%2C${avg[2]}%2C${avg[3]}%7C${pyr[0]}%2C${pyr[1]}%2C${pyr[2]}%2C${pyr[3]}`;
      const legend_labels = "&chdl=Average";
      const legend_pos = "&chdlp=b";
      const chart_size = "&chs=700x200";
      const chart_type = "&cht=bvg";
      const xlabel = "&chxl=0%3A%7CInfluence%7CCreativity%7CThreat%7CICT%20Index%7C";
      const axis = "&chxt=x%2Cy";
      return base_url + colors + data + legend_labels + legend_pos + chart_size + chart_type + xlabel + axis;
    };
    const global_avg = [avg_inf, avg_cre, avg_thr, avg_ict];
    const player_score = [
      player_data.influence,
      player_data.creativity,
      player_data.threat,
      player_data.ict_index,
    ];
    const stat_image_url = build_stat_bar(global_avg, player_score)

    // Get image data as binary data string in array Buffer
    const bar_chart = await axios.get(stat_image_url, {
      responseType: "arraybuffer",
    });
    // Convert binary data to base64 encoded data
    let bar_chart_64 = Buffer.from(bar_chart.data, "binary").toString("base64");

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
      stat_image: bar_chart_64,
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
