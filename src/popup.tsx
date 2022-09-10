import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Note, readNotesFromStorage } from "./localStorageNotes";
import { v4 as uuidv4 } from "uuid";

const useNotes = (): {
  notes: Note[];
  setNotes: (newVal: Note[]) => void;
} => {
  const [notes, setNotesInner] = useState<Note[]>([]);
  useEffect(() => {
    readNotesFromStorage().then((notes) => setNotesInner(notes));
  }, []);

  const setNotes = (newNotes: Note[]) => {
    console.log(newNotes);
    chrome.storage.local.set({ "tooltip-notes": JSON.stringify(newNotes) });
    setNotesInner(newNotes);
  };

  return {
    notes,
    setNotes,
  };
};

const Popup = () => {
  const { notes, setNotes } = useNotes();
  console.log(notes);

  return (
    <div>
      {notes.map((note) => (
        <>
          <input
            value={note.subject}
            onChange={(e) => {
              const newSubject = e.currentTarget.value;
              setNotes(
                // TODO: this is super lazy lol, maybe an id?
                notes.map((n) =>
                  n.subject === note.subject ? { ...n, subject: newSubject } : n
                )
              );
            }}
          />
          <button
            onClick={() =>
              setNotes(notes.filter((n) => n.subject !== note.subject))
            }
          >
            X
          </button>
          <textarea
            value={note.description}
            onChange={(e) => {
              const newText = e.currentTarget.value;
              setNotes(
                // TODO: this is super lazy lol, maybe an id?
                notes.map((n) =>
                  n.subject === note.subject
                    ? { ...n, description: newText }
                    : n
                )
              );
            }}
          />
        </>
      ))}
      <button
        onClick={() =>
          setNotes([...notes, { id: uuidv4(), subject: "", description: "" }])
        }
      >
        New note
      </button>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
