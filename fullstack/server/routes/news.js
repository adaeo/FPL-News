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

// Get list of news articles given a query
router.get("/", async (req, res) => {
  try {
    const query = req.query;
    if (!query["query"]) {
      throw new StatusError("you must include a query parameter!", 400);
    }

    // Get list of news articles from query
    const baseURL = "https://api.newscatcherapi.com/v2/search?";
    const buildURL = (
      q,
      lang = "en",
      sort_by = "relevancy",
      page = "1",
      search_in = "title",
      page_size = 10
    ) => {
      return (
        baseURL +
        `q=${q}&lang=${lang}&sort_by=${sort_by}&page=${page}&search_in=${search_in}&page_size=${page_size}`
      );
    };
    const headers = {
      headers: {
        "x-api-key": "690hLW9I6UfxS4vRnrRFWN_x-4HsrobrfW-xbFuwsSo",
      },
    };

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

module.exports = router;
