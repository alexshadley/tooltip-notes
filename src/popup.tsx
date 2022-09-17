import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Note, readNotesFromStorage } from "./localStorageNotes";
import { Button, Form } from "react-bootstrap";
import { CategoryDropdown } from "./CategoryDropdown";
import { AddNodePage } from "./AddNotePage";

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
  const [currentPage, setCurrentPage] = useState<"view" | "add">("view");

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
      {currentPage === "add" && (
        <AddNodePage
          categories={categories}
          onNewNote={(newNote) => {
            setNotes([...notes, newNote]);
            setCurrentPage("view");
          }}
          onCancel={() => setCurrentPage("view")}
        />
      )}
      {currentPage === "view" && (
        <>
          <Button onClick={() => setCurrentPage("add")}>Add Note</Button>
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
                    onClick={() =>
                      setNotes(notes.filter((n) => n.id !== note.id))
                    }
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
        </>
      )}
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
