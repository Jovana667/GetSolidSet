import { useState, useEffect } from "react";
import {
  createClientNote,
  getClientNotes,
  deleteClientNote,
} from "../services/api";

interface ClientNote {
  id: number;
  note: string;
  created_at: string;
}

interface ClientNotesProps {
  trainerClientId: string;
}

const ClientNotes: React.FC<ClientNotesProps> = ({ trainerClientId }) => {
  const [notes, setNotes] = useState<ClientNote[]>([]);
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotes = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedNotes = await getClientNotes(trainerClientId);
        setNotes(fetchedNotes);
      } catch (err) {
        setError("Failed to fetch notes. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotes();
  }, [trainerClientId]);

  const handleAddNote = async () => {
    if (newNote.trim() === "") return;

    const createdNote = await createClientNote(trainerClientId, {
      note: newNote,
    });
    setNotes([createdNote, ...notes]);
    setNewNote("");
  };

  const handleDeleteNote = async (noteId: number) => {
    await deleteClientNote(trainerClientId, noteId);
    setNotes(notes.filter((note) => note.id !== noteId));
  };

  return (
    <div className="space-y-6">
      {/* Add note input */}
      <div>
        <textarea
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          placeholder="Add a note..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
        />
        <div className="flex justify-end mt-2">
          <button
            onClick={handleAddNote}
            disabled={newNote.trim() === ""}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            Add Note
          </button>
        </div>
      </div>

      {/* States */}
      {loading && <p className="text-gray-500 text-sm">Loading notes...</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}

      {/* Empty state */}
      {!loading && !error && notes.length === 0 && (
        <div className="text-center text-gray-500 py-8">
          <p>No notes yet. Add your first observation above.</p>
        </div>
      )}

      {/* Notes list */}
      <div className="space-y-3">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4"
          >
            <div className="flex justify-between items-start gap-4">
              <p className="text-sm text-gray-800 whitespace-pre-wrap flex-1">
                {note.note}
              </p>
              <button
                onClick={() => handleDeleteNote(note.id)}
                className="text-gray-400 hover:text-red-500 transition-colors text-sm shrink-0"
              >
                Delete
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              {new Date(note.created_at).toLocaleDateString("en-AU", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientNotes;