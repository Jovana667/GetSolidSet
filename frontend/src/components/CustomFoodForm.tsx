import { useState, useEffect, useRef } from "react";
import { createCustomFood } from "../services/api";

function CustomFoodForm({
  onSuccess,
  onFoodAdded,
}: {
  onSuccess: () => void;
  onFoodAdded: () => void;
}) {
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    nameInputRef.current?.focus();
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    protein_per_100g: 0,
    fat_per_100g: 0,
    carbs_per_100g: 0,
    calories_per_100g: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) {
      setError("Please fill in all fields");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await createCustomFood(formData);
      setFormData({
        name: "",
        category: "",
        protein_per_100g: 0,
        fat_per_100g: 0,
        carbs_per_100g: 0,
        calories_per_100g: 0,
      });
      await onFoodAdded();
      onSuccess();
    } catch (err: any) {
      setError(err?.response?.data?.error || "Failed to create food");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-6 bg-gray-50">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">
        Add Custom Food
      </h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="mb-3">
          <label className={labelClass}>Name</label>
          <input
            ref={nameInputRef}
            type="text"
            className={inputClass}
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div className="mb-3">
          <label className={labelClass}>Category</label>
          <select
            className={inputClass}
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="">Select a category</option>
            <option value="protein">Protein</option>
            <option value="carbs">Carbs</option>
            <option value="vegetables">Vegetables</option>
            <option value="fruits">Fruits</option>
            <option value="fats">Fats</option>
            <option value="supplements">Supplements</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className={labelClass}>Protein per 100g</label>
            <input
              type="number"
              className={inputClass}
              value={formData.protein_per_100g}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  protein_per_100g: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Fat per 100g</label>
            <input
              type="number"
              className={inputClass}
              value={formData.fat_per_100g}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  fat_per_100g: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Carbs per 100g</label>
            <input
              type="number"
              className={inputClass}
              value={formData.carbs_per_100g}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  carbs_per_100g: parseFloat(e.target.value),
                })
              }
            />
          </div>
          <div>
            <label className={labelClass}>Calories per 100g</label>
            <input
              type="number"
              className={inputClass}
              value={formData.calories_per_100g}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  calories_per_100g: parseFloat(e.target.value),
                })
              }
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Custom Food"}
        </button>
      </form>
    </div>
  );
}

export default CustomFoodForm;
