define("Epic")

attributes(
  "title", 
  "status", 
  "project",
  "subheading"
)

belongsTo("project", {references: "title"})

// note, this api never worked and i like
// the more explicit one i use in the outline model better
attribute("subheading").extract("main h2")

section("Features")
  .aka("Stories", "User Stories")
  .hasMany("User Stories", {
    title: "h3"
  })

action("publish", function (params) {
  var epic = this;

  epic.setStatus("published")
})

exports = close()
