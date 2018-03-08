var lunrIndex, $results, pagesIndex;

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

var query = getQueryVariable('q');

// Initialize lunrjs using our generated index file
function initLunr() {
    // First retrieve the index file
    $.getJSON("/index.json")
        .done(function(index) {
            pagesIndex = index;
            console.log("index:", pagesIndex);
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
            console.error("Error getting Hugo index flie:", err);
        });
}

function search(query) {
    return lunrIndex.search(query).map(function(result) {
            return pagesIndex.filter(function(page) {
                return page.uri === result.ref;
            })[0];
        });
}

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


function initUI() {
  $results = $("#results");
  if (query.length < 3) {
    return;
  }
  renderResults(search(query));
}

// Let's get started
initLunr();
$(document).ready(function() {
  initUI();
});
