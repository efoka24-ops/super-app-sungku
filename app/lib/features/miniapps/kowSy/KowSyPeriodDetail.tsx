
import React, { useState } from "react";

export default function KowSyPeriodDetail({ period, expenses, addExpense, removeExpense, editExpense, categories, pieData }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    label: "",
    amount: "",
    date: period.start,
    category: categories[0].key,
  });
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.label.trim() || !form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError("Remplis tous les champs correctement");
      return;
    }
    if (editId) {
      editExpense(editId, {
        label: form.label,
        amount: Number(form.amount),
        date: form.date,
        category: form.category,
      });
    } else {
      addExpense({
        label: form.label,
        amount: Number(form.amount),
        date: form.date,
        category: form.category,
      });
    }
    setForm({ label: "", amount: "", date: period.start, category: categories[0].key });
    setShowForm(false);
    setError("");
    setEditId(null);
  }

  function handleEdit(expense) {
    setForm({
      label: expense.label,
      amount: String(expense.amount),
      date: expense.date,
      category: expense.category,
    });
    setShowForm(true);
    setEditId(expense.id);
  }

  function handleDelete(id) {
    if (window.confirm("Supprimer cette dépense ?")) {
      removeExpense(id);
      // If editing the same expense, reset form
      if (editId === id) {
        setForm({ label: "", amount: "", date: period.start, category: categories[0].key });
        setShowForm(false);
        setEditId(null);
      }
    }
  }

  return (
    <div className="bg-gray-50 rounded-xl p-3 mt-2">
      <h3 className="font-semibold mb-2">Dépenses de la période</h3>
      <button className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded flex items-center mb-2" onClick={() => {
        setShowForm(f => !f);
        setForm({ label: "", amount: "", date: period.start, category: categories[0].key });
        setEditId(null);
      }}>
        <span className="mr-1">+</span> Ajouter une dépense
      </button>
      {showForm && (
        <form className="bg-white p-3 rounded-xl shadow mb-2" onSubmit={handleSubmit}>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Libellé</label>
            <input name="label" value={form.label} onChange={handleChange} className="border rounded px-3 py-2 w-full" placeholder="Ex: Courses, Taxi..." required />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Montant (FCFA)</label>
            <input name="amount" type="number" min="1" value={form.amount} onChange={handleChange} className="border rounded px-3 py-2 w-full" placeholder="Ex: 2500" required />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Catégorie</label>
            <select name="category" value={form.category} onChange={handleChange} className="border rounded px-3 py-2 w-full">
              {categories.map(cat => (
                <option key={cat.key} value={cat.key}>{cat.label}</option>
              ))}
            </select>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Date</label>
            <input name="date" type="date" value={form.date} onChange={handleChange} className="border rounded px-3 py-2 w-full" required />
          </div>
          {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
          <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold w-full mt-2">{editId ? "Modifier" : "Ajouter"}</button>
        </form>
      )}
      {expenses.length === 0 ? (
        <p className="text-gray-500 mb-2">Aucune dépense enregistrée pour cette période.</p>
      ) : (
        <ul className="divide-y">
          {expenses.map(e => (
            <li key={e.id} className="py-2 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-0">
              <div className="flex-1">
                <span>{e.label} <span className="text-xs text-gray-400">({categories.find(c => c.key === e.category)?.label || e.category})</span></span>
                <span className="block sm:inline text-amber-700 font-bold ml-2">{e.amount} FCFA</span>
              </div>
              <div className="flex gap-1 mt-1 sm:mt-0">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs" onClick={() => handleEdit(e)}>Éditer</button>
                <button className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs" onClick={() => handleDelete(e.id)}>Supprimer</button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-2">
        <h4 className="font-semibold mb-1">Répartition graphique</h4>
        <div className="bg-white rounded-xl p-2">
          {/* Pie chart */}
          {pieData.length > 0 ? <>{/* @ts-ignore */}<div><KowSyPieChart data={pieData} /></div></> : <span className="text-gray-400">Aucune donnée</span>}
        </div>
      </div>
    </div>
  );
}