exports = define("Epic")

attributes(
  "title", 
  "status", 
  "project"
)

section("Features")
  .aka("Stories", "User Stories")
  .hasMany("User Stories", {
    title: "h3"
  })

action("publish", function (params) {
  var epic = this;

  epic.setStatus("published")
})
