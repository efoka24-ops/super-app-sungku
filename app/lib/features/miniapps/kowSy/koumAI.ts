// Modèle KoumAI : assistant financier pour le chat IA KowSy
// (Mock, à brancher sur backend IA ou API plus tard)

export interface KoumAIRequest {
  userId: string;
  messages: { role: "user" | "assistant"; content: string }[];
  context?: {
    salary?: number;
    expenses?: any[];
  };
}

export interface KoumAIResponse {
  reply: string;
  usage?: { promptTokens: number; completionTokens: number };
}

export async function askKoumAI(req: KoumAIRequest): Promise<KoumAIResponse> {
  // Simule une réponse IA intelligente (à remplacer par appel API réel)
  const last = req.messages[req.messages.length - 1]?.content.toLowerCase() || "";
  const salary = req.context?.salary || 0;
  const expenses = req.context?.expenses || [];
  // Calcul des dépenses du mois courant
  const now = new Date();
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthExpenses = expenses.filter((e: any) => e.date && e.date.startsWith(month));
  const total = monthExpenses.reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
  let reply = "Je suis KoumAI, ton assistant financier. Pose-moi une question sur tes dépenses ou ton budget !";
  if (last.includes("dépensé") || last.includes("total")) {
    reply = salary > 0
      ? `Tu as dépensé ${total} FCFA ce mois-ci. Cela représente ${salary ? Math.round((total / salary) * 100) : 0}% de ton salaire.`
      : `Tu as dépensé ${total} FCFA ce mois-ci.`;
  } else if (last.includes("conseil") || last.includes("optimis") || last.includes("amélior")) {
    if (salary > 0) {
      const ratio = total / salary;
      if (ratio > 1) {
        reply = "Attention : tu as dépassé ton salaire ce mois-ci. Essaie de réduire certaines dépenses !";
      } else if (ratio > 0.8) {
        reply = "Tu as dépensé plus de 80% de ton salaire. Sois vigilant sur la fin du mois.";
      } else if (ratio > 0.5) {
        reply = "Tu as consommé plus de la moitié de ton salaire. Pense à économiser pour tes objectifs !";
      } else if (ratio > 0.2) {
        reply = "Bonne gestion ! Tu as encore une marge confortable ce mois-ci.";
      } else {
        reply = "Excellent ! Tes dépenses sont très bien maîtrisées.";
      }
    } else {
      reply = "Déclare ton salaire pour obtenir des conseils personnalisés.";
    }
  } else if (last.includes("salaire")) {
    reply = salary > 0 ? `Ton salaire déclaré est de ${salary} FCFA.` : "Tu n'as pas encore déclaré ton salaire.";
  } else if (last.includes("catégorie")) {
    // Catégorie la plus dépensière
    if (monthExpenses.length > 0) {
      const byCat: Record<string, number> = {};
      for (const e of monthExpenses) {
        byCat[e.category] = (byCat[e.category] || 0) + (e.amount || 0);
      }
      const maxCat = Object.entries(byCat).sort((a, b) => b[1] - a[1])[0];
      reply = maxCat ? `Ce mois-ci, tu as le plus dépensé en catégorie "${maxCat[0]}" (${maxCat[1]} FCFA).` : "Pas assez de données pour répondre.";
    } else {
      reply = "Aucune dépense enregistrée ce mois-ci.";
    }
  }
  return Promise.resolve({ reply });
}
