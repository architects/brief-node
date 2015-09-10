define("Page")

attributes(
  "title", 
  "status", 
  "subheading"
)

attribute("subheading").extract("main h2")

section("Features")
  .aka("Stories", "User Stories")
  .hasMany("user_stories", {
    title: "h3",
    components: "p"
  })

exports = close()
