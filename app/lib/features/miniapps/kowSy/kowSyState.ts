
import { useState, useEffect } from "react";
import { Expense, KowSyMessage, KowSyUserData } from "./kowSyTypes";

function getPeriodKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}
const EXPENSES_PREFIX = "kowSy.expenses.";
const SALARY_PREFIX = "kowSy.salary.";

export function useKowSyExpenses(period?: string) {
  const key = EXPENSES_PREFIX + (period || getPeriodKey());
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : [];
  });
  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(expenses));
  }, [expenses, key]);
  const addExpense = (e: Omit<Expense, "id">) => {
    setExpenses((prev) => [
      { ...e, id: Date.now().toString() },
      ...prev,
    ]);
  };
  const removeExpense = (id: string) => {
    setExpenses((prev) => prev.filter(e => e.id !== id));
  };
  const editExpense = (id: string, data: Partial<Omit<Expense, "id">>) => {
    setExpenses((prev) => prev.map(e => e.id === id ? { ...e, ...data } : e));
  };
  return { expenses, addExpense, removeExpense, editExpense };
}

export function useKowSySalary(period?: string) {
  const key = SALARY_PREFIX + (period || getPeriodKey());
  const [salary, setSalary] = useState<number>(() => {
    const saved = localStorage.getItem(key);
    return saved ? Number(saved) : 0;
  });
  useEffect(() => {
    localStorage.setItem(key, String(salary));
  }, [salary, key]);
  return { salary, setSalary };
}

export function useKowSyChat() {
  const [messages, setMessages] = useState<KowSyMessage[]>([]);
  const sendMessage = (text: string) => {
    const userMsg: KowSyMessage = {
      id: Date.now().toString(),
      sender: "user",
      text,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
  };
  return { messages, sendMessage };
}
