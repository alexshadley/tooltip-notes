import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Note, readNotesFromStorage } from "./localStorageNotes";
import { v4 as uuidv4 } from "uuid";
import {
  Button as ButtonOld,
  Dropdown,
  DropdownButton,
  Form,
} from "react-bootstrap";

import Card from "@mui/material/Card";
import CardHeader from "@mui/material/CardHeader";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Chip from "@mui/material/Chip";

import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";

import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";

import MenuItem from "@mui/material/MenuItem";

import Select, { SelectChangeEvent } from "@mui/material/Select";

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
      <DropdownButton title={currentCategory ?? "Uncategorized"}>
        <Dropdown.Item onClick={() => onChange(null)}>
          Uncategorized
        </Dropdown.Item>
        {categories.map((c) => (
          <Dropdown.Item onClick={() => onChange(c)}>{c}</Dropdown.Item>
        ))}
        {allowCustom && (
          <Dropdown.Item onClick={() => setCustomCategory("")}>
            Custom
          </Dropdown.Item>
        )}
      </DropdownButton>
      {customCategory !== null && (
        <div style={{ display: "flex" }}>
          <Form.Control
            value={customCategory}
            onChange={(e) => setCustomCategory(e.currentTarget.value)}
          />
          <ButtonOld
            onClick={() => {
              onChange(customCategory);
              setCustomCategory(null);
            }}
          />
        </div>
      )}
    </>
  );
};

const NewNote = () => {};

const Popup = () => {
  const { notes, setNotes } = useNotes();
  const categories = [
    ...new Set(
      notes.map((note) => note.category).filter((c): c is string => !!c)
    ),
  ];
  const [category, setCategory] = useState<string | null>(null);
  console.log(notes);

  const handleCategoryChange = (event: SelectChangeEvent) => {
    setCategory(event.target.value as string);
  };

  return (
    <div style={{ padding: "10px" }}>
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
          <Card sx={{ minWidth: 275 }}>
            <CardContent>
              <Stack direction="column" spacing={1}>
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

                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    label={category}
                    onChange={handleCategoryChange}
                  >
                    {categories.map((c) => (
                      <MenuItem value={c}>{c}</MenuItem>
                    ))}
                  </Select>
                </Stack>

                <Stack direction="row">
                  <TextField
                    id="outlined-multiline-flexible"
                    multiline
                    rows={1}
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
                </Stack>

                <Stack direction="row" alignItems="flex-end">
                  <IconButton
                    aria-label="delete"
                    size="small"
                    onClick={() =>
                      setNotes(notes.filter((n) => n.id !== note.id))
                    }
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        ))}

      <ButtonOld
        onClick={() =>
          setNotes([...notes, { id: uuidv4(), subject: "", description: "" }])
        }
      >
        New note
      </ButtonOld>
    </div>
  );
};

ReactDOM.render(
  <React.StrictMode>
    <Popup />
  </React.StrictMode>,
  document.getElementById("root")
);
