import { useState, useEffect, useRef } from "react";
import { createSkinFold, updateSkinFold } from "../services/api";

export interface SkinFoldEntry {
  id: number | null;
  trainer_client_id?: number;
  week_number: number;
  weight_kg: number | null;
  triceps: number | null;
  biceps: number | null;
  chest: number | null;
  subscapular: number | null;
  midaxillary: number | null;
  suprailiac: number | null;
  abdominal: number | null;
  thigh: number | null;
  hamstring: number | null;
  notes: string | null;
  created_at?: string;
}

interface SkinFoldsTableProps {
  skinFolds: SkinFoldEntry[];
  trainerClientId: string;
  onEntryCreated: () => void;
  onEntryUpdated: () => void;
}

interface EditableCellProps {
  value: number | null;
  week: number;
  column: string;
  editingCell: { week: number; column: string } | null;
  setEditingCell: (cell: { week: number; column: string } | null) => void;
  onSave: (week: number, column: string, value: string) => void;
}

function EditableCell({
  value, week, column, editingCell, setEditingCell, onSave
}: EditableCellProps) {
  const [editValue, setEditValue] = useState(value?.toString() ?? "");
  const savedRef = useRef(false);
  const isEditing = editingCell?.week === week && editingCell?.column === column;

  useEffect(() => {
    if (isEditing) {
      setEditValue(value?.toString() ?? "");
    }
  }, [isEditing, value]);

  return (
    <td
      className={`border-b border-x cursor-pointer p-0 ${
        isEditing ? "outline outline-2 outline-gray-400" : "hover:bg-gray-50"
      }`}
      onClick={() => setEditingCell({ week, column })}
    >
      {isEditing ? (
        <input
          autoFocus
          type="text"
          inputMode="decimal"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              savedRef.current = true;
              onSave(week, column, editValue);
            }
          }}
          onBlur={() => {
            if (!savedRef.current) {
              onSave(week, column, editValue);
            }
            savedRef.current = false;
          }}
          className="w-full text-center outline-none bg-transparent py-2 px-4"
        />
      ) : (
        <span className="block py-2 px-4">{value ?? ""}</span>
      )}
    </td>
  );
}

export default function SkinFoldsTable({
  skinFolds,
  trainerClientId,
  onEntryCreated,
  onEntryUpdated,
}: SkinFoldsTableProps) {
  const [editingCell, setEditingCell] = useState<{ week: number; column: string } | null>(null);
  
  // 1. Maintain local state to avoid "disappearing numbers" during async operations
  const [localSkinFolds, setLocalSkinFolds] = useState<SkinFoldEntry[]>(skinFolds);

  // Sync local state whenever the parent component refetches data
  useEffect(() => {
    setLocalSkinFolds(skinFolds);
  }, [skinFolds]);

  const rows = Array.from({ length: 50 }, (_, i) => {
    const weekNumber = i + 1;
    const existing = localSkinFolds.find((f) => f.week_number === weekNumber);
    return existing || {
      week_number: weekNumber,
      id: null,
      weight_kg: null,
      triceps: null,
      biceps: null,
      chest: null,
      subscapular: null,
      midaxillary: null,
      suprailiac: null,
      abdominal: null,
      thigh: null,
      hamstring: null,
      notes: null,
    };
  });

  const handleSave = async (week: number, column: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);
    const existing = localSkinFolds.find((f) => f.week_number === week);

    if (numValue === null && !existing?.id) {
      setEditingCell(prev => (prev?.week === week && prev?.column === column ? null : prev));
      return;
    }

    // 2. Optimistically update local state immediately
    setLocalSkinFolds((prevFolds) => {
      const exists = prevFolds.some((f) => f.week_number === week);
      if (exists) {
        return prevFolds.map((f) =>
          f.week_number === week ? { ...f, [column]: numValue } : f
        );
      } else {
        return [
          ...prevFolds,
          {
            week_number: week,
            id: null,
            weight_kg: null,
            triceps: null,
            biceps: null,
            chest: null,
            subscapular: null,
            midaxillary: null,
            suprailiac: null,
            abdominal: null,
            thigh: null,
            hamstring: null,
            notes: null,
            [column]: numValue,
          } as SkinFoldEntry,
        ];
      }
    });

    // 3. Intelligently clear the active editing view only if the user hasn't clicked somewhere else
    setEditingCell(prev => (prev?.week === week && prev?.column === column ? null : prev));

    try {
      if (existing?.id) {
        await updateSkinFold(trainerClientId, existing.id, { [column]: numValue });
        onEntryUpdated();
      } else {
        await createSkinFold(trainerClientId, { week_number: week, [column]: numValue });
        onEntryCreated();
      }
    } catch (error) {
      console.error("Failed to save:", error);
      // Fallback: revert back to the verified parent state if api fails
      setLocalSkinFolds(skinFolds);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-300 border-collapse">
        <thead>
          <tr>
            <th className="py-2 px-4 border-b border-x">Week</th>
            <th className="py-2 px-4 border-b border-x">Weight (kg)</th>
            <th className="py-2 px-4 border-b border-x">Triceps</th>
            <th className="py-2 px-4 border-b border-x">Biceps</th>
            <th className="py-2 px-4 border-b border-x">Chest</th>
            <th className="py-2 px-4 border-b border-x">Subscapular</th>
            <th className="py-2 px-4 border-b border-x">Midaxillary</th>
            <th className="py-2 px-4 border-b border-x">Suprailiac</th>
            <th className="py-2 px-4 border-b border-x">Abdominal</th>
            <th className="py-2 px-4 border-b border-x">Thigh</th>
            <th className="py-2 px-4 border-b border-x">Hamstring</th>
            <th className="py-2 px-4 border-b border-x">Date</th>
            <th className="py-2 px-4 border-b border-x font-medium">Total</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry: any) => {
            const measurements = [
              entry.triceps, entry.biceps, entry.chest,
              entry.subscapular, entry.midaxillary, entry.suprailiac,
              entry.abdominal, entry.thigh, entry.hamstring,
            ];
            const hasMeasurements = measurements.some(v => v !== null);
            
            return (
              <tr key={entry.week_number} className="text-center">
                <td className="py-2 px-4 border-b border-x text-gray-500">{entry.week_number}</td>
                <EditableCell value={entry.weight_kg} week={entry.week_number} column="weight_kg" editingCell={editingCell} setEditingCell={setEditingCell} onSave={handleSave} />
                <EditableCell value={entry.triceps} week={entry.week_number} column="triceps" editingCell={editingCell} setEditingCell={setEditingCell} onSave={handleSave} />
                <EditableCell value={entry.biceps} week={entry.week_number} column="biceps" editingCell={editingCell} setEditingCell={setEditingCell} onSave={handleSave} />
                <EditableCell value={entry.chest} week={entry.week_number} column="chest" editingCell={editingCell} setEditingCell={setEditingCell} onSave={handleSave} />
                <EditableCell value={entry.subscapular} week={entry.week_number} column="subscapular" editingCell={editingCell} setEditingCell={setEditingCell} onSave={handleSave} />
                <EditableCell value={entry.midaxillary} week={entry.week_number} column="midaxillary" editingCell={editingCell} setEditingCell={setEditingCell} onSave={handleSave} />
                <EditableCell value={entry.suprailiac} week={entry.week_number} column="suprailiac" editingCell={editingCell} setEditingCell={setEditingCell} onSave={handleSave} />
                <EditableCell value={entry.abdominal} week={entry.week_number} column="abdominal" editingCell={editingCell} setEditingCell={setEditingCell} onSave={handleSave} />
                <EditableCell value={entry.thigh} week={entry.week_number} column="thigh" editingCell={editingCell} setEditingCell={setEditingCell} onSave={handleSave} />
                <EditableCell value={entry.hamstring} week={entry.week_number} column="hamstring" editingCell={editingCell} setEditingCell={setEditingCell} onSave={handleSave} />
                <td className="py-2 px-4 border-b border-x text-gray-400 text-sm">
                  {entry.created_at ? new Date(entry.created_at).toLocaleDateString() : ""}
                </td>
                <td className="py-2 px-4 border-b border-x font-medium">
                  {/* 4. Display totals instantly based on presence of data, not just row IDs */}
                  {hasMeasurements
                    ? measurements.filter(v => v !== null).reduce((sum, v) => sum + v!, 0).toFixed(1)
                    : ""}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}