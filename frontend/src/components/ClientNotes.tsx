import { useState, useEffect } from "react";
import {
  createClientNote,
  getClientNotes,
  deleteClientNote,
} from "../services/api";

interface ClientNote {
  id: number;
  note: string;
  createdAt: string;
}

interface ClientNotesProps {
  trainerClientId: string;
}

const ClientNotes: React.FC<ClientNotesProps> = ({ trainerClientId }) => {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    const fetchNotes = async () => {
      const fetchedNotes = await getClientNotes(trainerClientId);
      setNotes(fetchedNotes);
    };

    fetchNotes();
  }, [trainerClientId]);

  const handleAddNote = async () => {
    if (newNote.trim() === "") return;

    const createdNote = await createClientNote(trainerClientId, {
      note: newNote,
    });
    setNotes([...notes, createdNote]);
    setNewNote("");
  };

  const handleDeleteNote = async (noteId: number) => {
    await deleteClientNote(trainerClientId, noteId);
    setNotes(notes.filter((note) => note.id !== noteId));
  };

  return (
    <div>
      <h2>Client Notes</h2>
      <ul>
        {notes.map((note) => (
          <li key={note.id}>
            {note.note}{" "}
            <button onClick={() => handleDeleteNote(note.id)}>Delete</button>
          </li>
        ))}
      </ul>
      <input
        type="text"
        value={newNote}
        onChange={(e) => setNewNote(e.target.value)}
        placeholder="Add a new note"
      />
      <button onClick={handleAddNote}>Add Note</button>
    </div>
  );
};

export default ClientNotes;
