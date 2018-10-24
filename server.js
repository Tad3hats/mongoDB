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
                var a = $(this).prev();
                console.log(a.text());
                var title=a.text();
                var url = a.attr('href');
                var result = {};

                // Add the text and href of every link, and save them as properties of the result object
                result.title = a.text();
                // need to figure out how to get this link
                result.link=a.link();
                console.log(result.title);
                
                db.Article.create(result).then(function (dbArticle) {
                    res.json(dbArticle);
                });

                // request("https://www.invisionapp.com/blog", function (error, response, html) {

                //     var $ = cheerio.load(html);

                //     $(".title-link").each(function (i, element) {

                //         var title = $(element).children().text();
                //         var link = $(element).attr("href");
                //         var snippet = $(element).siblings('p').text().trim();
                //         var articleCreated = moment().format("YYYY MM DD hh:mm:ss");

                //         var result = {
                //             title: title,
                //             link: link,
                //             snippet: snippet,
                //             articleCreated: articleCreated,
                //             isSaved: false
                //         }

                //         console.log(result);


            });
        };
    });
    // end request
});



// Route for getting all Articles from the db
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article
        .find({})
        .sort({ articleCreated: -1 })
        .then(function (dbArticle) {
            // If we were able to successfully find Articles, send them back to the client
            res.json(dbArticle);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});

// Route for grabbing a specific Article by id, populate it with it's note
app.get("/articles/:id", function (req, res) {

    db.Article
        .findOne({ _id: req.params.id })
        .populate("note")
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving/updating an Article's associated Note
app.post("/articles/:id", function (req, res) {

    db.Note
        .create(req.body)
        .then(function (dbNote) {
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { note: dbNote._id }, { new: true });
        })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for saving/updating article to be saved
app.put("/saved/:id", function (req, res) {

    db.Article
        .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: true } })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for getting saved article
app.get("/saved", function (req, res) {

    db.Article
        .find({ isSaved: true })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
        });
});

// Route for deleting/updating saved article
app.put("/delete/:id", function (req, res) {

    db.Article
        .findByIdAndUpdate({ _id: req.params.id }, { $set: { isSaved: false } })
        .then(function (dbArticle) {
            res.json(dbArticle);
        })
        .catch(function (err) {
            res.json(err);
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
