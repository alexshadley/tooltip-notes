import React from "react";
import ReactDOM from "react-dom/client";
import { readNotesFromStorage } from "./localStorageNotes";

const AnnotatedEntity = ({
  subject,
  matchedText,
  description,
}: {
  subject: string;
  matchedText: string;
  description: string;
}) => {
  return (
    <span className="tooltip-notes-word">
      {matchedText}
      <div className="tooltip-notes-tooltip">
        <div className="tooltip-notes-subject">{subject}</div>
        {/* TODO: better way to break */}
        {/* <br /> */}
        <div>{description}</div>
      </div>
    </span>
  );
};

const annotateInTextNode = (taggedNode: TaggedNode) => {
  if (!taggedNode.node.textContent) {
    return;
  }

  const textContent = taggedNode.node.textContent;

  // Find matched option in node.
  const matchedText = taggedNode.annotatedNote.matchOptions.find((option) =>
    textContent.includes(option)
  )!;
  console.log("word ", matchedText);

  const start = textContent.indexOf(matchedText);
  const end = start + matchedText.length;

  const beforeWord = document.createTextNode(textContent.slice(0, start));
  const container = document.createElement("span");
  const afterWord = document.createTextNode(textContent.slice(end));

  taggedNode.node.replaceWith(beforeWord, container, afterWord);
  const root = ReactDOM.createRoot(container);
  root.render(
    <AnnotatedEntity
      subject={taggedNode.annotatedNote.subject}
      matchedText={matchedText}
      description={taggedNode.annotatedNote.description}
    />
  );
};

// TODO: better name?
// type SubjectAndId = { noteId: string; text: string };

export type AnnotatedNote = {
  id: string;
  subject: string;
  description: string;
  matchOptions: string[];
};

type TaggedNode = {
  node: ChildNode;
  annotatedNote: AnnotatedNote;
};

/**
 * Returns HTML elements that match `annotatedNotes`.
 */
const getMatchingTextNodes = (
  element: HTMLElement,
  annotatedNotes: AnnotatedNote[]
): TaggedNode[] => {
  let nodes: TaggedNode[] = [];
  for (const elem of element.childNodes) {
    if (elem.nodeType === Node.TEXT_NODE) {
      for (const note of annotatedNotes) {
        if (note.matchOptions.some((opt) => elem.textContent?.includes(opt))) {
          nodes.push({ node: elem, annotatedNote: note });
        }
      }
    }
    if (elem instanceof HTMLElement) {
      nodes = nodes.concat(getMatchingTextNodes(elem, annotatedNotes));
    }
  }

  return nodes;
};

const onStartup = async () => {
  const notes = await readNotesFromStorage();
  console.log("notes", notes);
  const annotatedNotes: AnnotatedNote[] = [];
  for (const note of notes) {
    const subject = note.subject;
    // last names of politicians
    const subjectSplit = subject.split(" ");
    const lastName = subjectSplit[subjectSplit.length - 1];
    const matchOptions = [subject, lastName];
    const annotatedNote = { ...note, matchOptions };
    annotatedNotes.push(annotatedNote);
  }
  console.log("words", annotatedNotes);

  const nodes = getMatchingTextNodes(document.body, annotatedNotes);
  console.log("nodes found: ", nodes.length);
  for (const node of nodes) {
    annotateInTextNode(node);
  }
};

onStartup();
