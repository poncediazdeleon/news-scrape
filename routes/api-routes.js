var db = require("../models");
var cheerio = require("cheerio");
var request = require("request");

module.exports = function(app) {
  
  // get route to display all the new articles
  app.get("/newarticles", function(req, res) {

    // get all the saved titles in the database and push them to an array by themselves
    var savedTitles = [];
    db.Article.find({}, {title: 1, _id: 0}, function (err, result){
      if (err) {
        res.send(500);
        console.log(err);
      } else {
        result.forEach(function(item){
          savedTitles.push(item.title);
        });

        // request call to grab the HTML body 
        request("https://www.theonion.com/", function(error, response, html) {

          // Load the HTML into cheerio and save it to a variable
          var $ = cheerio.load(html);

          // empty object containing an array to save the scraped data
          var data = {
            articles: []
          };

          // select the information scraped from the web page
          $(".js_post_item").each(function(i, element) {

            var link = $(element).children("header").children("h1").children("a").attr("href");
            var title = $(element).children("header").children("h1").children("a").text();
            var summary = $(element).children(".js_item-content").children(".entry-summary").children("p").text();
            var picture = $(element).children(".js_item-content").children("figure").children("a").children(".img-wrapper").children("picture").children("source").attr("data-srcset");

            // checks the scraped title against the savedTitles
            if (savedTitles.indexOf(title) === -1){
              data.articles.push({
                title: title,
                link: link,
                summary: summary,
                picture: picture,
                saved: false
              });
            };

          });

          // render the page using the scraped data that has not been saved
          res.render("index", data);
        });
      };
    });
  });

  // get route to display all the saved articles
  app.get("/savedarticles", function(req, res) {
    db.Article.find({
    }, function(err, data){
      if (err){
        res.send(500);
        console.log(err);
      } else {
        data.forEach(function(item){
          item.saved = true;
        })
        res.render("index", {articles: data});
      };
    });
  });

  // post route to save an atricle to the database
  app.post("/savedarticles", function(req, res) {
    db.Article.create({
      title: req.body.title,
      link: req.body.link,
      summary: req.body.summary,
      picture: req.body.picture
    }).then(function(dbArticle){
      res.json(dbArticle);
    }).catch(function(err){
      res.json(err);
    });
  });

  // delete route to remove a saved article from the database
  app.delete("/savedarticles", function(req, res) {
    // first remove any note associated with the article
    db.Note.remove({
      article: req.body.id
    // then remove the article itself
    }).then(function(dbNote){
      return db.Article.remove({_id: req.body.id})
    // respond to the browser
    }).then(function(dbArticle){
      res.json(dbArticle);
    }).catch(function(err){
      res.json(err);
    });
  });

  // get route to retrieve the comments associated with a specified article
  app.get("/savednotes", function(req, res) {
    db.Note.find({
      article: req.query.articleId
    }).then(function(dbNote) {
      res.json(dbNote);
    }).catch(function(err) {
      res.json(err);
    });
  });

  // post route to add a comment to the specified article
  app.post("/savednotes", function(req, res) {
    db.Note.create({
      body: req.body.body,
      article: req.body.article
    }).then(function(dbNote){
      res.json(dbNote);
    }).catch(function(err){
      res.json(err);
    });
  });

  // delete route to remove a comment
  app.delete("/savednotes", function(req, res) {
    db.Note.remove({
      _id: req.body.id
    }, function(err, data){
      if (err) {
        res.send(500);
        console.log(err);
      } else {
        res.json(data);
      };
    });
  });
};