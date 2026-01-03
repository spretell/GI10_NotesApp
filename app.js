// - - - - - app.js - - - - -

// title message when running the app
console.log("node notes ✎ᝰ.ᐟ");

// import yargs
const yargs = require("yargs");
// import notes logic from notes.js
const notes = require("./notes");
// import chalk for colored console output
const chalk = require("chalk");

// add command
yargs.command({
  // command name types in terminal
  command: "add",
  // description shown in --help
  describe: "Add a new note",
  // define expected options / arguments
  builder: {
    // --title option
    title: {
      describe: "Note title",
      demandOption: true, // required
      type: "string",
    },
    // --body option
    body: {
      describe: "Note body",
      demandOption: true, // required
      type: "string",
    },
  },
  // run when command is used
  handler(argv) {
    // argvs are the parsed options
    notes.addNote(argv.title, argv.body);
  },
});

// list command
yargs.command({
  command: "list",
  describe: "List all notes",
  handler() {
    // call the listNotes function from notes.js
    notes.listNotes();
  },
});

// read command
yargs.command({
  command: "read",
  describe: "Read a note",
  // define expected options / arguments
  builder: {
    // require --title option
    title: { describe: "Note title", demandOption: true, type: "string" },
  },
  // run when command is used
  handler(argv) {
    // find the note by title
    const note = notes.readNote(argv.title);

    // if note found , print title and body
    if (note) {
      console.log(note.title);
      console.log(note.body);
    } else {
      // note not found
      console.log(chalk.red("Note not found!"));
    }
  },
});

// remove command
yargs.command({
  command: "remove",
  describe: "Remove a note",
  builder: {
    title: { describe: "Note title", demandOption: true, type: "string" },
  },
  handler(argv) {
    // attempt to remove the note
    const success = notes.removeNote(argv.title);
    // print success or failure message
    console.log(
      success ? chalk.green("Note removed!") : chalk.red("Note not found!")
    );
  },
});

// remove-all command
yargs.command({
  command: "remove-all",
  describe: "Remove all notes",
  handler() {
    // delete all notes
    notes.removeAll();
    // print success message
    console.log(chalk.green("All notes removed!"));
  },
});

// edit command
yargs.command({
  command: "edit",
  describe: "Edit a note",
  builder: {
    title: { describe: "Note title", demandOption: true, type: "string" },
    body: { describe: "New note body", demandOption: true, type: "string" },
  },
  handler(argv) {
    // attempt to edit the note
    const success = notes.editNote(argv.title, argv.body);
    console.log(
      // print success or failure message
      success ? chalk.green("Note updated!") : chalk.red("Note not found!")
    );
  },
});

// parse the  command line arguments
yargs.parse();
