/*
  load search results page w/ lunr.
*/

var lunrIndex

// initialize lunrjs using generated index file.
  function initLunr() {
    // retrieve index file.
    $.getJSON("/index.json")
      .done(function(index) {
        pagesIndex = index;
        // put that index file in console for safe keeping.
        console.log("index", pagesIndex);
        lunrIndex = lunr(function() {
          this.field("title", { boost: 2 });
          this.field("tags", { boost: 4 });
          this.field("content", { boost: 10 });
          this.ref("uri");

          pagesIndex.forEach(function (page) {
            this.add(page)
          }, this)
        });
      })
      .fail(function(jqxhr, textStatus, error) {
        var err = textStatus + ", " + error;
        console.error("Error getting Hugo index file:", err);
      });
  }

// initialize lunr.
  initLunr();

// search the lunrIndex.
  function search(query) {
    return lunrIndex.search(query).map(function(result) {
      return pagesIndex.filter(function(page) {
        return page.uri === result.ref;
          })[0];
        });
  }

// render the results in html.
  function renderResults(results) {
    if (!results.length) {
      return;
    }

    results.slice(0, 10).forEach(function(result) {
      var $result = $("<li>");
      $result.append($("<a>", {
        href: result.uri,
        text: result.title
      }));
      $results.append($result);
    });
  }

// putting it all together.

  function initUI() {
    // get the searchTerm from url
      function getQueryVariable(variable) {
        var query = window.location.search.substring(1);
        var vars = query.split('&');

        for (var i = 0; i < vars.length; i++) {
          var pair = vars[i].split('=');

          if (pair[0] === variable) {
            return decodeURIComponent(pair[1].replace(/\+/g, '%20'));
          }
        }
      }

    // register searchTerm.
      var query = getQueryVariable('q');
      $results = $("#results");
      if (query.length < 3) {
        return;
      }

      var results = search(query)
      renderResults(results);
  }

$(document).ready(function() {
  initUI();
});
