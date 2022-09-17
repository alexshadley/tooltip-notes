import { Button, TextField } from "@mui/material";
import React from "react";
import { useState } from "react";
import { CategoryDropdown } from "./CategoryDropdown";
import { Note } from "./localStorageNotes";
import { v4 as uuidv4 } from "uuid";

export const AddNodePage = ({
  categories,
  onNewNote,
  onCancel,
}: {
  categories: string[];
  onNewNote: (newNote: Note) => void;
  onCancel: () => void;
}) => {
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        width: "300px",
      }}
    >
      <TextField
        label="Subject"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
      />
      <TextField
        label="Description"
        multiline
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
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
