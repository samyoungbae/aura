// Arquivo: app/page.tsx (com Painel de Resumo)

"use client";

import { useState, useEffect, useMemo } from "react"; // Adicionamos o useMemo
import { useSession } from "next-auth/react";
import { AuthButtons } from "@/components/AuthButtons";
import { Loader2, Trash2, Edit } from "lucide-react";
import { EditTransactionModal } from "@/components/EditTransactionModal";

// ... (Interface Transaction sem mudanças) ...
interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
  type: 'INCOME' | 'EXPENSE';
  category: string;
}

export default function HomePage() {
  const { status } = useSession();

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // ... (outros estados sem mudanças) ...
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  // --- LÓGICA DE CÁLCULO PARA O DASHBOARD ---
  const { totalIncome, totalExpense, balance } = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((acc, t) => acc + t.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((acc, t) => acc + t.amount, 0);

    const balance = totalIncome + totalExpense; // Lembre-se que despesas são negativas
    
    return { totalIncome, totalExpense, balance };
  }, [transactions]); // Recalcula apenas quando a lista de transações muda

  // --- Funções de API (sem mudanças) ---
  const fetchTransactions = async () => { /* ... */ };
  const handleSubmit = async (e: React.FormEvent) => { /* ... */ };
  const handleDelete = async (transactionId: string) => { /* ... */ };
  const handleEditClick = (transaction: Transaction) => { /* ... */ };
  const handleSaveEdit = async (updatedTransaction: Transaction) => { /* ... */ };

  // Colei as funções completas abaixo para garantir
  async function fullFetchTransactions() {
    try {
      const response = await fetch('/api/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error("Erro ao buscar transações:", error);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (status === "authenticated") {
      fullFetchTransactions();
    } else if (status === "unauthenticated") {
      setIsLoading(false);
    }
  }, [status]);
  
  async function fullHandleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!description.trim() || !amount) return;
    setLoadingActionId('submit');
    try {
      const response = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description,
          amount,
          type: parseFloat(amount) >= 0 ? 'INCOME' : 'EXPENSE',
          category: 'Geral',
          date: new Date().toISOString(),
        }),
      });
      if (response.ok) {
        setDescription('');
        setAmount('');
        await fullFetchTransactions();
      }
    } catch (error) {
      console.error("Erro ao criar transação:", error);
    } finally {
      setLoadingActionId(null);
    }
  }

  async function fullHandleDelete(transactionId: string) {
    if (!confirm('Tem certeza?')) return;
    setLoadingActionId(transactionId);
    try {
      const response = await fetch(`/api/transactions/${transactionId}`, { method: 'DELETE' });
      if (response.ok) await fullFetchTransactions();
    } catch (error) {
      console.error("Erro ao deletar transação:", error);
    } finally {
      setLoadingActionId(null);
    }
  }

  function fullHandleEditClick(transaction: Transaction) {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  }

  async function fullHandleSaveEdit(updatedTransaction: Transaction) {
    setLoadingActionId(updatedTransaction.id);
    try {
      const response = await fetch(`/api/transactions/${updatedTransaction.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: updatedTransaction.description,
          amount: updatedTransaction.amount,
          type: updatedTransaction.amount >= 0 ? 'INCOME' : 'EXPENSE',
        }),
      });
      if (response.ok) {
        setIsModalOpen(false);
        setSelectedTransaction(null);
        await fullFetchTransactions();
      }
    } catch (error) {
      console.error("Erro ao salvar a transação:", error);
    } finally {
      setLoadingActionId(null);
    }
  }


  if (status === "loading" || isLoading) {
    // ...código sem mudanças...
  }

  return (
    <main className="bg-gray-900 text-gray-100 min-h-screen">
      <EditTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTransaction}
        onSave={fullHandleSaveEdit}
      />

      <div className="max-w-4xl mx-auto p-8">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-amber-400">Aura</h1>
          <AuthButtons />
        </header>

        {status === "authenticated" ? (
          <div>
            {/* --- NOVO PAINEL DE RESUMO --- */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
              {/* Card de Receitas */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400">Receitas do Mês</h3>
                <p className="text-2xl font-semibold text-green-400">R$ {totalIncome.toFixed(2).replace('.', ',')}</p>
              </div>
              {/* Card de Despesas */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400">Despesas do Mês</h3>
                <p className="text-2xl font-semibold text-red-400">R$ {Math.abs(totalExpense).toFixed(2).replace('.', ',')}</p>
              </div>
              {/* Card de Saldo */}
              <div className="bg-gray-800 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-400">Saldo Atual</h3>
                <p className={`text-2xl font-semibold ${balance >= 0 ? 'text-white' : 'text-red-400'}`}>R$ {balance.toFixed(2).replace('.', ',')}</p>
              </div>
            </div>

            <form onSubmit={fullHandleSubmit} className="mb-12 p-6 bg-gray-800 rounded-lg">
              {/* ...formulário sem mudanças... */}
            </form>

            <div>
              <h3 className="text-xl font-semibold text-amber-300 mb-4">Últimas Transações</h3>
              <div className="space-y-3">
                {transactions.map((t) => (
                  <div key={t.id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center group">
                    <div>
                      <p className="font-medium">{t.description}</p>
                      <p className="text-sm text-gray-400">{new Date(t.date).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <p className={`font-semibold ${t.type === 'INCOME' ? 'text-green-400' : 'text-red-400'}`}>
                        {t.type === 'INCOME' ? '+' : '-'} R$ {Math.abs(t.amount).toFixed(2).replace('.', ',')}
                      </p>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => fullHandleEditClick(t)} className="text-gray-500 hover:text-amber-400"><Edit size={18} /></button>
                        <button onClick={() => fullHandleDelete(t.id)} className="text-gray-500 hover:text-red-500" disabled={loadingActionId === t.id}>
                          {loadingActionId === t.id ? <Loader2 className="animate-spin" /> : <Trash2 size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center bg-gray-800 p-10 rounded-lg">
            {/* ...tela de login sem mudanças... */}
          </div>
        )}
      </div>
    </main>
  );
}