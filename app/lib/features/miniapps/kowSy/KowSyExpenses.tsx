
import React, { useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Plus, PieChart, BarChart2, MessageCircle } from "lucide-react";
import { useKowSyExpenses, useKowSySalary } from "./kowSyState";
import { useKowSyPeriods, KowSyPeriod } from "./kowSyPeriods";
import { KOWSY_CATEGORIES } from "./kowSyCategories";
import KowSyPieChart from "./KowSyPieChart";
import KowSyPeriodDetail from "./KowSyPeriodDetail";

export default function KowSyExpenses() {
  const navigate = useNavigate();
  // Gestion des périodes
  const { periods, add, remove } = useKowSyPeriods();
  const [showCreate, setShowCreate] = useState(false);
  const [newPeriod, setNewPeriod] = useState({
    start: "",
    end: "",
    salary: ""
  });
  const [error, setError] = useState("");
  // Pour l'affichage des dépenses d'une période sélectionnée
  const [activePeriod, setActivePeriod] = useState<KowSyPeriod | null>(null);
  const { expenses, addExpense, removeExpense, editExpense } = useKowSyExpenses(activePeriod ? activePeriod.id : undefined);

  // Couleurs fixes pour le camembert
  const pieColors = ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa", "#f87171"];

  // Regroupe les dépenses par catégorie pour le graphique (période sélectionnée)
  const pieData = KOWSY_CATEGORIES.map((cat, i) => ({
    label: cat.label,
    value: expenses.filter(e => e.category === cat.key).reduce((sum, e) => sum + e.amount, 0),
    color: pieColors[i % pieColors.length],
  })).filter(d => d.value > 0);

  // Formulaire création période
  function handleCreatePeriod(e: React.FormEvent) {
    e.preventDefault();
    if (!newPeriod.start || !newPeriod.end || !newPeriod.salary || isNaN(Number(newPeriod.salary))) {
      setError("Remplis toutes les infos de la période");
      return;
    }
    add({
      id: Date.now().toString(),
      start: newPeriod.start,
      end: newPeriod.end,
      salary: Number(newPeriod.salary)
    });
    setNewPeriod({ start: "", end: "", salary: "" });
    setShowCreate(false);
    setError("");
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-amber-500" />
        </button>
        <h1 className="text-xl font-bold text-amber-700">Suivi des périodes KowSy</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-start py-6 w-full">
        <div className="mb-6 w-full max-w-md">
          <button className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-semibold mb-2" onClick={() => setShowCreate(f => !f)}>
            <Plus className="w-5 h-5 inline" /> Créer une période
          </button>
          {showCreate && (
            <form className="bg-gray-50 p-4 rounded-xl shadow w-full max-w-md mb-4" onSubmit={handleCreatePeriod}>
              <div className="flex gap-2 mb-2">
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Début</label>
                  <input type="date" value={newPeriod.start} onChange={e => setNewPeriod(p => ({ ...p, start: e.target.value }))} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Fin</label>
                  <input type="date" value={newPeriod.end} onChange={e => setNewPeriod(p => ({ ...p, end: e.target.value }))} className="border rounded px-3 py-2 w-full" required />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium mb-1">Salaire</label>
                  <input type="number" min="0" value={newPeriod.salary} onChange={e => setNewPeriod(p => ({ ...p, salary: e.target.value }))} className="border rounded px-3 py-2 w-full" required />
                </div>
              </div>
              {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
              <button type="submit" className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl font-semibold w-full mt-2">Valider la période</button>
            </form>
          )}
        </div>
        <div className="w-full max-w-md">
          <h2 className="text-lg font-bold mb-2">Périodes créées</h2>
          {periods.length === 0 ? (
            <p className="text-gray-500 mb-4">Aucune période créée.</p>
          ) : (
            <ul className="divide-y">
              {periods.map(period => (
                <li key={period.id} className="py-3 flex flex-col gap-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                    <div>
                      <span className="font-semibold">{period.start} → {period.end}</span>
                      <span className="ml-2 text-emerald-700">{period.salary} FCFA</span>
                    </div>
                    <div className="flex flex-wrap gap-1 w-full sm:w-auto">
                      <button className="bg-amber-500 hover:bg-amber-600 text-white px-2 py-1 rounded flex items-center text-xs min-w-[32px] max-w-[64px] overflow-hidden" style={{maxWidth:'64px'}} onClick={() => setActivePeriod(period)}>
                        <Plus className="w-4 h-4 mr-1" /> <span className="truncate">Dép.</span>
                      </button>
                      <button className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded flex items-center text-xs min-w-[32px] max-w-[64px] overflow-hidden" style={{maxWidth:'64px'}} onClick={() => navigate(`/miniapps/kowsy/dashboard/${period.id}`)}>
                        <BarChart2 className="w-4 h-4 mr-1" /> <span className="truncate">Dash</span>
                      </button>
                      <button className="bg-gray-200 hover:bg-gray-300 text-amber-700 px-2 py-1 rounded flex items-center text-xs min-w-[32px] max-w-[64px] overflow-hidden" style={{maxWidth:'64px'}} onClick={() => {/* IA analyse */}}>
                        <MessageCircle className="w-4 h-4 mr-1" /> <span className="truncate">IA</span>
                      </button>
                      <button className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded flex items-center text-xs min-w-[32px] max-w-[64px] overflow-hidden" style={{maxWidth:'64px'}} onClick={() => remove(period.id)}>
                        <span className="truncate">Suppr</span>
                      </button>
                    </div>
                  </div>
                  {activePeriod && activePeriod.id === period.id && (
                    <KowSyPeriodDetail
                      period={period}
                      expenses={expenses}
                      addExpense={addExpense}
                      removeExpense={removeExpense}
                      editExpense={editExpense}
                      categories={KOWSY_CATEGORIES}
                      pieData={pieData}
                    />
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
