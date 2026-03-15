
import React from "react";
import { useNavigate, useParams } from "react-router";
import { useKowSyExpenses, useKowSySalary } from "./kowSyState";
import { getPeriodById } from "./kowSyPeriods";
import { KOWSY_CATEGORIES } from "./kowSyCategories";
import KowSyPieChart from "./KowSyPieChart";
import { ArrowLeft, PieChart, MessageCircle, Plus } from "lucide-react";

function KowSyDashboard() {
  const navigate = useNavigate();
  const { periodId } = useParams();
  const period = periodId ? getPeriodById(periodId) : null;
  const { expenses } = useKowSyExpenses(period ? period.id : undefined);
  const { salary, setSalary } = useKowSySalary(period ? period.id : undefined);
  const filteredExpenses = period ? expenses.filter(e => e.date >= period.start && e.date <= period.end) : [];
  const total = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Optimisation intelligente : conseils personnalisés
  let conseil = "";
  let solution = "";
  if (salary > 0 && period) {
    const ratio = total / salary;
    if (ratio > 1) {
      conseil = "Attention : vous avez dépassé votre salaire ce mois-ci.";
      solution = "Réduisez vos dépenses non essentielles (loisirs, sorties, achats impulsifs) et fixez-vous un budget hebdomadaire. Essayez d’épargner au moins 10% de votre salaire le mois prochain.";
    } else if (ratio > 0.8) {
      conseil = "Vous avez dépensé plus de 80% de votre salaire.";
      solution = "Analysez vos plus grosses catégories de dépenses et fixez une limite pour chacune. Essayez de mettre de côté 5 à 10% de votre salaire dès le début du mois.";
    } else if (ratio > 0.5) {
      conseil = "Vous avez consommé plus de la moitié de votre salaire.";
      solution = "Continuez à suivre vos dépenses. Pour épargner, mettez de côté une somme fixe chaque semaine (ex: 5 000 FCFA).";
    } else if (ratio > 0.2) {
      conseil = "Bonne gestion ! Vous avez encore une marge confortable ce mois-ci.";
      solution = "Profitez-en pour augmenter votre épargne ce mois-ci (ex: 15% du salaire).";
    } else {
      conseil = "Excellent ! Vos dépenses sont très bien maîtrisées.";
      solution = "Pensez à investir ou à placer une partie de votre épargne pour la faire fructifier.";
    }
  } else {
    conseil = "Déclarez votre salaire pour obtenir des conseils personnalisés.";
    solution = "Ajoutez votre salaire pour activer l’optimisation.";
  }
  const pieColors = ["#fbbf24", "#34d399", "#60a5fa", "#f472b6", "#a78bfa", "#f87171"];
  const pieData = KOWSY_CATEGORIES.map((cat, i) => ({
    label: cat.label,
    value: expenses.filter(e => e.category === cat.key).reduce((sum, e) => sum + e.amount, 0),
    color: pieColors[i % pieColors.length],
  })).filter(d => d.value > 0);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="flex items-center gap-4 p-4 border-b">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full">
          <ArrowLeft className="w-6 h-6 text-amber-500" />
        </button>
        <h1 className="text-xl font-bold text-amber-700">Tableau de bord KowSy</h1>
      </div>
      <div className="flex-1 flex flex-col items-center justify-start py-6">
        {period ? (
          <div className="mb-4 w-full max-w-xs">
            <div className="text-gray-500 text-sm mb-2">Période : <span className="font-semibold">{period.start} → {period.end}</span></div>
            <label className="block text-sm font-medium mb-1">Salaire (FCFA)</label>
            <input
              type="number"
              min="0"
              value={salary}
              onChange={e => setSalary(Number(e.target.value))}
              className="border rounded px-3 py-2 w-full mb-2"
              placeholder="Ex: 200000"
            />
          </div>
        ) : (
          <div className="mb-4 text-gray-500">Aucune période sélectionnée.</div>
        )}
        {period && (
          <>
            <div className="mb-4">
              <KowSyPieChart data={pieData} />
            </div>
            <div className="text-2xl font-bold text-amber-700 mb-2">{total} FCFA</div>
            <div className="text-gray-500 mb-2">Dépenses totales</div>
            <div className="text-gray-500 mb-6">Salaire déclaré : <span className="font-semibold text-emerald-700">{salary} FCFA</span></div>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl p-4 mb-6 w-full max-w-xs text-sm">
              <strong>Conseil KowSy&nbsp;:</strong> {conseil}
              <br />
              <span className="block mt-2 text-emerald-900 font-medium">Solution&nbsp;: {solution}</span>
            </div>
          </>
        )}
        <div className="flex gap-4 mb-4">
          <button onClick={() => navigate("/miniapps/kowsy/expenses")} className="bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 font-semibold">
            <PieChart className="w-5 h-5" /> Suivi dépenses
          </button>
          <button onClick={() => navigate("/miniapps/kowsy/chat")} className="bg-white border border-amber-400 text-amber-700 px-4 py-2 rounded-xl font-semibold hover:bg-amber-50 flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> Chat IA
          </button>
        </div>
        <button onClick={() => navigate("/miniapps/kowsy/expenses")}
          className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-xl flex items-center gap-2 font-semibold">
          <Plus className="w-5 h-5" /> Ajouter une dépense
        </button>
      </div>
    </div>
  );
}

export default KowSyDashboard;
