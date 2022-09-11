/**
 * Persisted to local storage. Don't add new non-optional properties to retain
 * reverse compatability
 */
export type Note = {
  id: string;
  subject: string;
  description: string;
  category?: string | null;
};

export const readNotesFromStorage = async (): Promise<Note[]> => {
  const rawNotes = await chrome.storage.local.get("tooltip-notes");
  let storageNotes = JSON.parse(rawNotes["tooltip-notes"] ?? "[]");
  if (!Array.isArray(storageNotes)) {
    storageNotes = [];
  }
  // TODO: better way to do this?
  storageNotes = storageNotes.filter(
    (note: any): note is Note =>
      "id" in note && "subject" in note && "description" in note
  );
  return storageNotes;
};
