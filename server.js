var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");

// Our scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");
var request = require("request");

// Require all models
var db = require("./models");

// Initialize Express
var PORT = process.env.PORT || 3000;
var app = express();

// Configure middleware

// Use morgan logger for logging requests
app.use(logger("dev"));
// Use body-parser for handling form submissions
app.use(bodyParser.urlencoded({ extended: false }));
// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// Connect to the Mongo DB
// mongoose.connect("mongodb://127.0.0.1/mongoHomework");

// Routes

app.get("/", function (req, res) {
    res.send(index.html);
});

// A GET route for scraping the invision blog
app.get("/scrape", function (req, res) {
    request('https://news.ycombinator.com', function (error, response, html) {
        if (!error && response.statusCode == 200) {
            var $ = cheerio.load(html);
            $('span.comhead').each(function (i, element) {
                console.log(a.text());

                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = a.text();
                console.log(result.title);

                db.Article.findOne({ title: result.title }).then(function (data) {
                    console.log(data);

                    if (data === null) {

                        db.Article.create(result.title).then(function (dbArticle) {
                            res.json(dbArticle);
                        });
                    }
                }).catch(function (err) {
                    res.json(err);
                });
            });
        }
    });
});





// If deployed, use the deployed database. Otherwise use the local mongoHeadlines database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1/mongoHeadlines";

// Set mongoose to leverage built in JavaScript ES6 Promises
// Connect to the Mongo DB
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);
// Start the server
app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});