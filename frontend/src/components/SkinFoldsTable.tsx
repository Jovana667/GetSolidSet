import { useState, useEffect } from "react";
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
  updated_at?: string;
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
  value,
  week,
  column,
  editingCell,
  setEditingCell,
  onSave,
}: EditableCellProps) {
  const [editValue, setEditValue] = useState(value?.toString() ?? "");
  const isEditing =
    editingCell?.week === week && editingCell?.column === column;

  useEffect(() => {
    if (isEditing) {
      setEditValue(value?.toString() ?? "");
    }
  }, [isEditing]);

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
          onBlur={(e) => {
            setTimeout(() => {
              onSave(week, column, editValue);
            }, 100);
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
}: SkinFoldsTableProps) {
  const [editingCell, setEditingCell] = useState<{
    week: number;
    column: string;
  } | null>(null);

  const [localSkinFolds, setLocalSkinFolds] =
    useState<SkinFoldEntry[]>(skinFolds);

useEffect(() => {
  if (skinFolds.length !== localSkinFolds.length) {
    setLocalSkinFolds(skinFolds);
  }
}, [skinFolds]);

  const rows = Array.from({ length: 50 }, (_, i) => {
    const weekNumber = i + 1;
    const existing = localSkinFolds.find((f) => f.week_number === weekNumber);
    return (
      existing || {
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
      }
    );
  });

  const handleSave = async (week: number, column: string, value: string) => {
    const numValue = value === "" ? null : parseFloat(value);

    if (numValue === null) {
      setEditingCell(null);
      return;
    }

    // Optimistically update local state immediately
    setLocalSkinFolds((prevFolds) => {
      const exists = prevFolds.some((f) => f.week_number === week);
      if (exists) {
        return prevFolds.map((f) =>
          f.week_number === week ? { ...f, [column]: numValue } : f,
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

    setEditingCell(null);

try {
  await createSkinFold(trainerClientId, {
    week_number: week,
    [column]: numValue,
  });
  onEntryCreated();
} catch (error) {
  console.error("Failed to save:", error);
  setLocalSkinFolds(skinFolds);
}
  };

  const handleClearRow = async (week: number, entryId: number | null) => {
    if (!entryId) return;

    const clearedData = {
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

    setLocalSkinFolds((prevFolds) =>
      prevFolds.map((f) =>
        f.week_number === week ? { ...f, ...clearedData } : f,
      ),
    );

    try {
      await updateSkinFold(trainerClientId, entryId, clearedData);
    } catch (error) {
      console.error("Failed to clear row:", error);
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
            <th className="py-2 px-4 border-b border-x"></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((entry: any) => {
            const measurements = [
              entry.triceps,
              entry.biceps,
              entry.chest,
              entry.subscapular,
              entry.midaxillary,
              entry.suprailiac,
              entry.abdominal,
              entry.thigh,
              entry.hamstring,
            ];
            const hasData = measurements.some((v) => v !== null);

            return (
              <tr key={entry.week_number} className="text-center">
                <td className="py-2 px-4 border-b border-x text-gray-500">
                  {entry.week_number}
                </td>
                <EditableCell
                  value={entry.weight_kg}
                  week={entry.week_number}
                  column="weight_kg"
                  editingCell={editingCell}
                  setEditingCell={setEditingCell}
                  onSave={handleSave}
                />
                <EditableCell
                  value={entry.triceps}
                  week={entry.week_number}
                  column="triceps"
                  editingCell={editingCell}
                  setEditingCell={setEditingCell}
                  onSave={handleSave}
                />
                <EditableCell
                  value={entry.biceps}
                  week={entry.week_number}
                  column="biceps"
                  editingCell={editingCell}
                  setEditingCell={setEditingCell}
                  onSave={handleSave}
                />
                <EditableCell
                  value={entry.chest}
                  week={entry.week_number}
                  column="chest"
                  editingCell={editingCell}
                  setEditingCell={setEditingCell}
                  onSave={handleSave}
                />
                <EditableCell
                  value={entry.subscapular}
                  week={entry.week_number}
                  column="subscapular"
                  editingCell={editingCell}
                  setEditingCell={setEditingCell}
                  onSave={handleSave}
                />
                <EditableCell
                  value={entry.midaxillary}
                  week={entry.week_number}
                  column="midaxillary"
                  editingCell={editingCell}
                  setEditingCell={setEditingCell}
                  onSave={handleSave}
                />
                <EditableCell
                  value={entry.suprailiac}
                  week={entry.week_number}
                  column="suprailiac"
                  editingCell={editingCell}
                  setEditingCell={setEditingCell}
                  onSave={handleSave}
                />
                <EditableCell
                  value={entry.abdominal}
                  week={entry.week_number}
                  column="abdominal"
                  editingCell={editingCell}
                  setEditingCell={setEditingCell}
                  onSave={handleSave}
                />
                <EditableCell
                  value={entry.thigh}
                  week={entry.week_number}
                  column="thigh"
                  editingCell={editingCell}
                  setEditingCell={setEditingCell}
                  onSave={handleSave}
                />
                <EditableCell
                  value={entry.hamstring}
                  week={entry.week_number}
                  column="hamstring"
                  editingCell={editingCell}
                  setEditingCell={setEditingCell}
                  onSave={handleSave}
                />
                <td className="py-2 px-4 border-b border-x text-gray-400 text-sm">
                  {hasData && entry.updated_at
                    ? new Date(entry.updated_at).toLocaleDateString()
                    : ""}
                </td>
                <td className="py-2 px-4 border-b border-x font-medium">
                  {hasData
                    ? measurements
                        .filter((v) => v !== null)
                        .reduce((sum, v) => sum + v!, 0)
                        .toFixed(1)
                    : ""}
                </td>

                {/* Bin icon — add here */}
                <td className="py-2 px-4 border-b border-x">
                  {entry.id && hasData && (
                    <button
                      onClick={() =>
                        handleClearRow(entry.week_number, entry.id)
                      }
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6" />
                        <path d="M10 11v6m4-6v6" />
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2" />
                      </svg>
                    </button>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
