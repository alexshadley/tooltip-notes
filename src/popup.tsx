import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Note, readNotesFromStorage } from "./localStorageNotes";
import { v4 as uuidv4 } from "uuid";
import { Button, Dropdown, DropdownButton, Form } from "react-bootstrap";
import { MenuItem, Select, TextField } from "@mui/material";

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

const CategoryDropdown = ({
  currentCategory,
  categories,
  onChange,
  allowCustom,
}: {
  currentCategory: string | null;
  categories: string[];
  onChange: (newCategory: string | null) => void;
  allowCustom?: boolean;
}) => {
  const [customCategory, setCustomCategory] = useState<string | null>(null);

  return (
    <>
      <Select
        title="Category"
        value={currentCategory ?? "Uncategorized"}
        onChange={(e) => {
          const value = e.target.value;
          if (value === "__custom__") {
            setCustomCategory("");
          } else if (value === "__null__") {
            onChange(null);
          } else {
            onChange(value);
          }
        }}
      >
        <MenuItem value="__null__">Uncategorized</MenuItem>
        {categories.map((c) => (
          <MenuItem value={c}>{c}</MenuItem>
        ))}
        {allowCustom && <MenuItem value="__custom__">Custom</MenuItem>}
      </Select>
      {customCategory !== null && (
        <div style={{ display: "flex" }}>
          <TextField
            value={customCategory}
            onChange={(e) => setCustomCategory(e.currentTarget.value)}
          />
          <Button
            onClick={() => {
              onChange(customCategory);
              setCustomCategory(null);
            }}
          >
            Add
          </Button>
        </div>
      )}
    </>
  );
};

const NewNote = ({
  categories,
  onNewNote,
}: {
  categories: string[];
  onNewNote: (newNote: Note) => void;
}) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  return (
    <div>
      <TextField label="Subject" />
      <TextField label="Description" multiline />
      <CategoryDropdown
        currentCategory={category}
        categories={categories}
        onChange={setCategory}
        allowCustom
      />
      <div style={{ display: "flex" }}>
        <Button
          onClick={() =>
            onNewNote({ id: uuidv4(), subject, description, category })
          }
        >
          Add
        </Button>
      </div>
    </div>
  );
};

const Popup = () => {
  const { notes, setNotes } = useNotes();
  const categories = [
    ...new Set(
      notes.map((note) => note.category).filter((c): c is string => !!c)
    ),
  ];
  const [category, setCategory] = useState<string | null>(null);
  console.log(notes);

  return (
    <div style={{ padding: "10px" }}>
      <NewNote
        categories={categories}
        onNewNote={(newNote) => setNotes([...notes, newNote])}
      />
      <div style={{ marginBottom: "20px" }}>
        <div>Showing category:</div>
        <CategoryDropdown
          currentCategory={category}
          categories={categories}
          onChange={setCategory}
        />
      </div>
      {notes
        .filter((n) => (n.category ?? null) === category)
        .map((note) => (
          <div style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex" }}>
              <Form.Control
                value={note.subject}
                onChange={(e) => {
                  const newSubject = e.currentTarget.value;
                  setNotes(
                    notes.map((n) =>
                      n.id === note.id ? { ...n, subject: newSubject } : n
                    )
                  );
                }}
              />
              <Button
                variant="danger"
                onClick={() => setNotes(notes.filter((n) => n.id !== note.id))}
              >
                X
              </Button>
            </div>
            <div>Category:</div>
            <CategoryDropdown
              currentCategory={note.category ?? null}
              categories={categories}
              onChange={(newCategory) =>
                setNotes(
                  notes.map((n) =>
                    n.id === note.id ? { ...n, category: newCategory } : n
                  )
                )
              }
              allowCustom
            />
            <textarea
              value={note.description}
              onChange={(e) => {
                const newText = e.currentTarget.value;
                setNotes(
                  notes.map((n) =>
                    n.id === note.id ? { ...n, description: newText } : n
                  )
                );
              }}
            />
          </div>
        ))}
      <Button
        onClick={() =>
          setNotes([...notes, { id: uuidv4(), subject: "", description: "" }])
        }
      >
        New note
      </Button>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
