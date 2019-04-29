$(document).ready(function(){

  // function to get any notes associated with the article
  function getSavedNotes(articleId){
    $.ajax({
      method: "GET",
      url: "/savednotes",
      data: {articleId: articleId}
    }).then(function(data) {
      $("#comment-list").empty();
      if (data.length === 0){
        $("#comment-list").append('<li class="list-group-item">No comments for this article yet.</li>')
      } else {
        createCommentsList(data);
      };
    });
  };

  // function creating the list of saved articles in the modal
  function createCommentsList(dataArray){
    dataArray.forEach(function(item){
      var displayDate = item.created.substr(0, 10);
      var newListItem = $("<li>")
      newListItem.attr("class", "list-group-item d-flex justify-content-between align-items-center");
      newListItem.text(`${displayDate}: ${item.body}`);
      var newBttn = $("<button>");
      newBttn.attr("class", "btn badge badge-primary badge-pill delNote");
      newBttn.attr("data-id", item._id);
      newBttn.text("x");
      newListItem.append(newBttn);
      $("#comment-list").prepend(newListItem);
    })
  };

  // save article button click
  $(document).on("click", ".save", function(event){
    var data = {
      title: $(this).attr("data-title"),
      link: $(this).attr("data-link"),
      summary: $(this).attr("data-summary"),
      picture: $(this).attr("data-picture")
    };
    $.ajax({
      method: "POST",
      url: "/savedarticles",
      data: data
    }).done(function(result){
      location.reload();
    }).fail(function(xhr, responseText, responseStatus){
      if (xhr){
        console.log(xhr.responseText);
      };
    });
  });

  // delete article button click
  $(document).on("click", ".delArticle", function(event){
    var data = {
      id: $(this).attr("data-id")
    };
    $.ajax({
      method: "DELETE",
      url: "/savedarticles",
      data: data
    }).done(function(result){
      location.reload();
    }).fail(function(xhr, responseText, responseStatus){
      if (xhr){
        console.log(xhr.responseText);
      };
    });
  });

  // comments button click to bring up the comments modal
  $(document).on("click", ".note", function(event){
    $("#comment-title").empty();
    var articleId = $(this).attr("data-id");
    var title = `Article Comments:
${articleId}`;
    $("#comment-title").attr("data-id", articleId);
    $("#comment-title").text(title);
    getSavedNotes(articleId);
  });

  // save comment button click
  $(document).on("click", "#save-comment", function(event){
    event.preventDefault();
    var articleId = $("#comment-title").attr("data-id");
    var newComment = $("#comment-text").val().trim();
    $("#comment-text").val("");
    var commentData = {
      body: newComment,
      article: articleId
    };
    if (newComment != "" && newComment != null){
      $.ajax({
        method: "POST",
        url: "/savednotes",
        data: commentData
      }).then(function(data) {
        console.log("Comment saved!");
      });
    };
  });

  // delete comment button click (deletes a single comment)
  $(document).on("click", ".delNote", function(event){
    var data = {
      id: $(this).attr("data-id")
    };
    $.ajax({
      method: "DELETE",
      url: "/savednotes",
      data: data
    }).done(function(result){
      var articleId = $("#comment-title").attr("data-id");
      getSavedNotes(articleId);
    }).fail(function(xhr, responseText, responseStatus){
      if (xhr){
        console.log(xhr.responseText);
      };
    });
  });
});