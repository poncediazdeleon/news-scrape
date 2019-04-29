// dependency
var mongoose = require("mongoose");

// schema constructor
var Schema = mongoose.Schema;

// create new schema for the notes
var NoteSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  body: {
    type: String
  },
  article: {
    type: String
  }
});

// create a model from the schema
var Note = mongoose.model("Note", NoteSchema);

// Export the Article model
module.exports = Note;