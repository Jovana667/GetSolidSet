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
  const [success, setSuccess] = useState("");

  const handleSubmit = async () => {
    if (!formData.name || !formData.category) {
      alert("Please fill all entries");
      return;
    }
    setLoading(true);
    try {
      const response = await createCustomFood(formData);
      console.log("Food item added successfully");
      setSuccess("Food created successfully!");
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
    } catch (error: any) {
      console.error("Something went wrong:", error);
      setError("Failed to create food");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4">Add Custom Food</h3>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
      >
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            ref={nameInputRef}
            type="text"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Category</label>
          <select
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={formData.category}
            onChange={(e) =>
              setFormData({ ...formData, category: e.target.value })
            }
          >
            <option value="">Select a category</option>
            <option value="protein">Protein</option>
            <option value="fats">Fats</option>
            <option value="carbs">Carbs</option>
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Protein per 100g
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={formData.protein_per_100g}
            onChange={(e) =>
              setFormData({
                ...formData,
                protein_per_100g: parseFloat(e.target.value),
              })
            }
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Fat per 100g</label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={formData.fat_per_100g}
            onChange={(e) =>
              setFormData({
                ...formData,
                fat_per_100g: parseFloat(e.target.value),
              })
            }
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Carbs per 100g
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={formData.carbs_per_100g}
            onChange={(e) =>
              setFormData({
                ...formData,
                carbs_per_100g: parseFloat(e.target.value),
              })
            }
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">
            Calories per 100g
          </label>
          <input
            type="number"
            className="w-full border border-gray-300 rounded px-3 py-2"
            value={formData.calories_per_100g}
            onChange={(e) =>
              setFormData({
                ...formData,
                calories_per_100g: parseFloat(e.target.value),
              })
            }
          />
        </div>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-green-500 mb-4">{success}</p>}
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Custom Food"}
        </button>
      </form>
    </div>
  );
}

export default CustomFoodForm;
