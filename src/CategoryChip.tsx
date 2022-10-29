import React, { useState } from "react";
import { colorForCategory } from "./CategoryColors";
import { Chip, MenuItem, Select, TextField } from "@mui/material";

export const CategoryChip = ({
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
  console.log(currentCategory ?? "Uncategorized");

  return (
    <>
      <Select
        label="Category"
        sx={{
          ".MuiOutlinedInput-notchedOutline": { border: 0 },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": { border: 0 },
        }}
        SelectDisplayProps={{ style: { paddingTop: 0, paddingBottom: 0 } }}
        value={
          customCategory !== null ? "__custom__" : currentCategory ?? "__null__"
        }
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
        <MenuItem value="__null__">
          <Chip label="Uncategorized" />
        </MenuItem>

        {categories.map((c) => (
          <MenuItem value={c}>
            <Chip label={c} style={{ backgroundColor: colorForCategory(c) }} />
          </MenuItem>
        ))}

        {allowCustom && (
          <MenuItem value="__custom__">
            <Chip label="Custom" />
          </MenuItem>
        )}
      </Select>

      {customCategory !== null && (
        <div style={{ display: "flex" }}>
          <TextField
            label="New category"
            value={customCategory}
            onChange={(e) => {
              setCustomCategory(e.currentTarget.value);
              onChange(e.currentTarget.value);
            }}
          />
        </div>
      )}
    </>
  );
};
