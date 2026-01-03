// - - - - - server.js - - - - -

// import node's built-in "path" module
const path = require("path");

// import the express library
const express = require("express");

// import notes logic from notes.js
const notes = require("./notes");

// create an express application
const app = express();

// create a port number to listen on ; use environment variable or default to 3000
const port = process.env.PORT || 3000;

// create the full path to the "public" folder
const publicDir = path.join(__dirname, "public");

// tell express to serve static files from /public
app.use(express.static(publicDir));

// express automatically parses json data
app.use(express.json());

// split a command string into parts ( tokens )
// output tokens:
// ["add", "--title=\"ideas\"", "--body=\"create node app\""]
const tokenize = (input) => input.match(/(?:[^\s"]+|"[^"]*")+/g) || [];

// extract a value from a flag like --title="hello"
const getFlagValue = (tokens, flag) => {
  // find the token that starts with the flag name
  const found = tokens.find((t) => t.startsWith(flag + "="));

  // if the flag is missing , return empty string
  if (!found) return "";

  // remove "--title=" or "--body=" from the start
  const raw = found.slice(flag.length + 1);

  // remove quotes
  return raw.replace(/^"|"$/g, "");
};

// - - - - - api run command route - - - - -

// receives commands typed in the browser ui
app.post("/api/command", (req, res) => {
  // read the command from the request body ; if doesn't exist , default to an empty string
  const input = (req.body.command || "").trim();

  // if the user submitted nothing, return an error
  if (!input) {
    return res.status(400).json({ error: "please type a command." });
  }

  // break the input into tokens
  const tokens = tokenize(input);

  // the first word is the command ; convert it to lowercase so commands aren't case-sensitive
  const command = (tokens[0] || "").toLowerCase();

  try {
    // add command
    if (command === "add") {
      // extract title and body values
      const title = getFlagValue(tokens, "--title");
      const body = getFlagValue(tokens, "--body");

      // if either is missing , return an error
      if (!title || !body) {
        return res
          .status(400)
          .json({ error: 'use: add --title="..." --body="..."' });
      }

      // addnote returns true if successful , false if duplicate
      const ok = notes.addNote(title, body);

      // send a response back to the browser
      return res.json({
        message: ok ? "note added!" : "that title already exists.",
        notes: notes.getNotes(),
      });
    }

    // list command
    if (command === "list") {
      return res.json({
        message: "here are your notes:",
        notes: notes.getNotes(),
      });
    }

    // read command
    if (command === "read") {
      // get the title flag
      const title = getFlagValue(tokens, "--title");

      // title is required
      if (!title) {
        return res.status(400).json({ error: 'use: read --title="..."' });
      }

      // look up the note
      const note = notes.readNote(title);

      // if the note does not exist , return 404
      if (!note) {
        return res.status(404).json({ error: "note not found." });
      }

      // return the note data
      return res.json({
        message: `${note.title}: ${note.body}`,
        note,
        notes: notes.getNotes(),
      });
    }

    // remove command
    if (command === "remove") {
      const title = getFlagValue(tokens, "--title");

      if (!title) {
        return res.status(400).json({ error: 'use: remove --title="..."' });
      }

      // remove the note
      const success = notes.removeNote(title);

      return res.json({
        message: success ? "note removed!" : "note not found.",
        notes: notes.getNotes(),
      });
    }

    // remove-all command
    if (command === "remove-all") {
      // delete all notes
      notes.removeAll();

      return res.json({
        message: "all notes removed!",
        notes: notes.getNotes(),
      });
    }

    // edit command
    if (command === "edit") {
      const title = getFlagValue(tokens, "--title");
      const body = getFlagValue(tokens, "--body");

      if (!title || !body) {
        return res
          .status(400)
          .json({ error: 'use: edit --title="..." --body="..."' });
      }

      // update the note
      const success = notes.editNote(title, body);

      return res.json({
        message: success ? "note updated!" : "note not found.",
        notes: notes.getNotes(),
      });
    }

    // unrecognized command
    return res.status(400).json({
      error: "unknown command. try: add, list, read, edit, remove, remove-all",
    });
  } catch (e) {
    // catch any unexpected server errors
    return res
      .status(500)
      .json({ error: e?.message || "something went wrong." });
  }
});

// get all notes route
app.get("/api/notes", (req, res) => {
  res.json(notes.getNotes());
});

// route to confirm the server is running
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// start the server and listen on the specified port
app.listen(port, () => {
  console.log(`node notes running at http://localhost:${port}`);
});
