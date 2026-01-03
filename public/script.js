// public/script.js

document.getElementById("year").textContent = new Date().getFullYear();

// grab the elements from the page
const commandInput = document.getElementById("commandInput");
const runBtn = document.getElementById("runBtn");
const terminal = document.getElementById("terminal");
const notesList = document.getElementById("notesList");

// print one line into the "chalk terminal"
function printLine(text, className = "") {
  const p = document.createElement("p");
  p.className = `line ${className}`;
  p.textContent = text;
  terminal.appendChild(p);
  terminal.scrollTop = terminal.scrollHeight;
}

// show the notes under the terminal
function renderNotes(notes) {
  notesList.innerHTML = "";

  if (!notes || notes.length === 0) {
    notesList.innerHTML = "<li class='dim'>no notes yet ˙ᵕ˙</li>";
    return;
  }

  notes.forEach((note) => {
    const li = document.createElement("li");
    li.textContent = note.title;

    // when a note title is clicked, show its body in the terminal
    li.addEventListener("click", () => {
      printLine(`read "${note.title}"`, "chalk-blue");
      printLine(note.body, "chalk-purple");
    });

    notesList.appendChild(li);
  });
}

// get the latest notes from the server and render them
function refreshNotes() {
  fetch("/api/notes")
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "could not load notes");
      return data;
    })
    .then((notes) => renderNotes(notes))
    .catch((err) => {
      // if something goes wrong, show it in the terminal
      printLine(`error: ${err.message}`, "chalk-red");
    });
}

// run a command string by sending it to the server
function runCommand() {
  const input = commandInput.value.trim();

  // clear the chalk terminal (client-side only)
  if (input === "clear") {
    terminal.innerHTML = "";
    commandInput.value = "";
    commandInput.focus();
    return;
  }

  if (!input) {
    printLine("please type a command first ˙ᵕ˙", "chalk-yellow");
    return;
  }

  // echo what the user typed (like a real terminal)
  printLine(`> ${input}`, "dim");

  fetch("/api/command", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ command: input }),
  })
    .then(async (res) => {
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "something went wrong");
      return data;
    })
    .then((data) => {
      // show success message if we got one
      if (data.message) {
        printLine(data.message, "chalk-green");
      }

      // if the server sent back notes, update the list
      if (data.notes) {
        renderNotes(data.notes);
      } else {
        // otherwise, just refresh the notes list from the server
        refreshNotes();
      }

      // clear the input after running
      commandInput.value = "";
      commandInput.focus();
    })
    .catch((err) => {
      printLine(`error: ${err.message}`, "chalk-red");
    });
}

// click to run
runBtn.addEventListener("click", runCommand);

// press enter to run
commandInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runCommand();
});

// load notes when the page first opens
refreshNotes();
