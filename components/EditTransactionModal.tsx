// Arquivo: components/EditTransactionModal.tsx

"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react"; // Ícone para fechar

// Tipos para os dados que o componente receberá
interface Transaction {
  id: string;
  description: string;
  amount: number;
  date: string;
}

interface EditModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTransaction: Transaction) => Promise<void>;
}

export const EditTransactionModal = ({ transaction, isOpen, onClose, onSave }: EditModalProps) => {
  // Estados para controlar os campos do formulário
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');

  // Efeito para preencher o formulário quando uma transação é selecionada
  useEffect(() => {
    if (transaction) {
      setDescription(transaction.description);
      setAmount(String(transaction.amount));
    }
  }, [transaction]);

  // Função para lidar com o envio do formulário de edição
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transaction) return;

    // Chama a função onSave que foi passada pelo componente pai
    await onSave({
      ...transaction,
      description,
      amount: parseFloat(amount),
    });
  };

  if (!isOpen) {
    return null; // Se a modal não estiver aberta, não renderiza nada
  }

  return (
    // Fundo escuro semi-transparente
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50">
      {/* Conteúdo da Modal */}
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-amber-300">Editar Transação</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-1">Descrição</label>
              <input
                id="description"
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-1">Valor</label>
              <input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full p-2 rounded bg-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-400"
              />
            </div>
          </div>
          <div className="mt-8 flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-600 text-gray-900 font-bold py-2 px-4 rounded"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};