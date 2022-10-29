import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import { Note, readNotesFromStorage } from "./localStorageNotes";
import { CategoryDropdown } from "./CategoryDropdown";
import { CategoryChip } from "./CategoryChip";
import { AddNodePage } from "./AddNotePage";

import {
  Card,
  CardContent,
  Fab,
  IconButton,
  Stack,
  TextField,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";

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
        <Stack spacing={2}>
          <CategoryDropdown
            currentCategory={category}
            categories={categories}
            onChange={setCategory}
          />

          {notes
            .filter((n) => (n.category ?? null) === category)
            .map((note) => (
              <Card sx={{ minWidth: 275 }}>
                <CardContent>
                  <Stack direction="row" justifyContent="flex-end">
                    <IconButton
                      aria-label="delete"
                      size="small"
                      onClick={() =>
                        setNotes(notes.filter((n) => n.id !== note.id))
                      }
                    >
                      <CloseIcon sx={{ fontSize: "12px" }}></CloseIcon>
                    </IconButton>
                  </Stack>

                  <Stack direction="row" spacing={1}>
                    <TextField
                      variant="standard"
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

                    <CategoryChip
                      currentCategory={note.category ?? null}
                      categories={categories}
                      onChange={(newCategory) =>
                        setNotes(
                          notes.map((n) =>
                            n.id === note.id
                              ? { ...n, category: newCategory }
                              : n
                          )
                        )
                      }
                    />
                  </Stack>

                  <Stack direction="row">
                    <TextField
                      multiline
                      maxRows={4}
                      variant="standard"
                      value={note.description}
                      onChange={(e) => {
                        const newText = e.currentTarget.value;
                        setNotes(
                          notes.map((n) =>
                            n.id === note.id
                              ? { ...n, description: newText }
                              : n
                          )
                        );
                      }}
                    />
                  </Stack>
                </CardContent>
              </Card>
            ))}

          <Stack direction="row" justifyContent="flex-end">
            <Fab
              color="primary"
              aria-label="add"
              onClick={() => setCurrentPage("add")}
            >
              <AddIcon />
            </Fab>
          </Stack>
        </Stack>
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
