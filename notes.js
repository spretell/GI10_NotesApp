// - - - - - notes.js ( note data logic )- - - - -

// import node's built-in fs and path modules
const fs = require("fs");
// import node's built-in path module
const path = require("path");
// import chalk for colored terminal output
const chalk = require("chalk");
// define the path to the notes.json file
const NOTES_FILE = path.join(__dirname, "notes.json");

// load notes from the json file
const loadNotes = () => {
  try {
    // read the file contents
    const dataBuffer = fs.readFileSync(NOTES_FILE);
    // convert the binary data to a string and parse as json
    const dataJSON = dataBuffer.toString();
    return JSON.parse(dataJSON);
  } catch (e) {
    // if file does not exist , create an empty notes.json file
    fs.writeFileSync(NOTES_FILE, "[]");
    // return an empty array
    return [];
  }
};

// save notes back to the json file
const saveNotes = (notes) => {
  // convert notes array to json string and write to file
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes));
};

// add a new note
const addNote = (title, body) => {
  // load existing notes
  const notes = loadNotes();
  // check for duplicate titles
  const duplicate = notes.find((note) => note.title === title);

  // if a duplicate exists , do not add the note
  if (duplicate) {
    return false;
  }

  // push the new note and save
  notes.push({ title, body });
  saveNotes(notes);
  return true;
};

// return all notes
const getNotes = () => {
  return loadNotes();
};

// remove a note by title
const removeNote = (title) => {
  // load existing notes
  const notes = loadNotes();
  // create a new array without the note to be removed
  const filteredNotes = notes.filter((note) => note.title !== title);

  // if no note was removed , return false
  if (filteredNotes.length === notes.length) {
    return false;
  }

  // save the updated notes array
  saveNotes(filteredNotes);
  return true;
};

// list notes in the terminal
const listNotes = () => {
  // load existing notes
  const notes = loadNotes();

  // if no notes , inform the user
  if (notes.length === 0) {
    console.log(chalk.yellow("no notes found."));
    return;
  }

  // print each note title
  console.log(chalk.blue("your notes:"));
  notes.forEach((note) => console.log("- " + note.title));
};

// read a note by title
const readNote = (title) => {
  // load existing notes
  const notes = loadNotes();
  // find the note with the given title
  const note = notes.find((note) => note.title === title);

  // if not found , return null
  if (!note) {
    return null;
  }

  // return the found note
  return note;
};

// remove all notes
const removeAll = () => {
  // overwrite the notes file with an empty array
  saveNotes([]);
};

// edit a note's body
const editNote = (title, body) => {
  // load existing notes
  const notes = loadNotes();
  // find the note with the given title
  const note = notes.find((note) => note.title === title);

  // if not found , return false
  if (!note) {
    return false;
  }

  // update the note's body and save
  note.body = body;
  saveNotes(notes);
  return true;
};

// export the functions for use in other files
module.exports = {
  addNote,
  removeNote,
  listNotes,
  readNote,
  removeAll,
  editNote,
  getNotes,
};
