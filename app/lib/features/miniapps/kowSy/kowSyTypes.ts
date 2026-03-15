// Modèles de données pour KowSy

export interface Expense {
  id: string;
  label: string;
  amount: number;
  date: string; // ISO
  category: string;
}

export interface KowSyMessage {
  id: string;
  sender: "user" | "kowSy";
  text: string;
  createdAt: string;
}

export interface KowSyUserData {
  salary: number;
}
