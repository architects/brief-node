define("Project")

attributes(
  "title",
  "status"
)

hasMany("epics", {key: "title"})

exports = close()
