import React, { useRef, useState } from "react";
import { createPortal } from "react-dom";
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
  const [wordRef, setWordRef] = useState<HTMLSpanElement | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const windowHeight = window.innerHeight;
  const { x, y } = wordRef?.getBoundingClientRect() ?? { x: 0, y: 0 };

  const tooltip = (
    <div
      className="tooltip-notes-tooltip"
      style={{
        // it's a little strange to me that we have to modify this by the window
        // scroll, but it seems to work
        bottom: `${windowHeight - window.scrollY - y}px`,
        left: `${x}px`,
      }}
    >
      <div className="tooltip-notes-subject">{subject}</div>
      <div>{description}</div>
    </div>
  );

  return (
    <span
      ref={setWordRef}
      className="tooltip-notes-word"
      onMouseOver={() => setIsHovered(true)}
      onMouseOut={() => setIsHovered(false)}
    >
      {matchedText}
      {isHovered && createPortal(tooltip, document.body)}
    </span>
  );
};

/**
 * `word` separated by a non-letter in front and behind
 */
const regexForWord = (word: string) => {
  return RegExp(`([^A-Za-z]|^)(${word})([^A-Za-z]|$)`);
};

const annotateInTextNode = (taggedNode: TaggedNode) => {
  if (!taggedNode.node.textContent) {
    return;
  }

  const textContent = taggedNode.node.textContent;

  // Find matched option in node.
  const option = taggedNode.annotatedNote.matchOptions.find((option) =>
    textContent.match(option.regex)
  )!;
  console.log("word ", option.text);

  const match = textContent.match(option.regex)!;
  // the match may include a space before the word, if so add 1
  const start = match.index! + match[0].indexOf(option.text);
  const end = start + option.text.length;

  const beforeWord = document.createTextNode(textContent.slice(0, start));
  const container = document.createElement("span");
  const afterWord = document.createTextNode(textContent.slice(end));

  taggedNode.node.replaceWith(beforeWord, container, afterWord);
  const root = ReactDOM.createRoot(container);
  root.render(
    <AnnotatedEntity
      subject={taggedNode.annotatedNote.subject}
      matchedText={option.text}
      description={taggedNode.annotatedNote.description}
    />
  );
};

type MatchOption = { text: string; regex: RegExp };

export type AnnotatedNote = {
  id: string;
  subject: string;
  description: string;
  matchOptions: MatchOption[];
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
        if (
          note.matchOptions.some((opt) => elem.textContent?.match(opt.regex))
        ) {
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
    const matchOptions = [
      { text: subject, regex: regexForWord(subject) },
      { text: lastName, regex: regexForWord(lastName) },
    ];
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
