// Arquivo: app/api/transactions/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// Função para BUSCAR (GET) as transações do usuário
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const transactions = await db.transaction.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        date: 'desc', // Ordena da mais recente para a mais antiga
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error('[TRANSACTIONS_GET]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}

// Função para CRIAR (POST) uma nova transação
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const body = await req.json();
    const { description, amount, type, category, date } = body;

    // Validação dos dados recebidos
    if (!description || !amount || !type || !category || !date) {
      return new NextResponse('Dados incompletos', { status: 400 });
    }

    const newTransaction = await db.transaction.create({
      data: {
        description,
        amount: parseFloat(amount), // Garante que o valor é um número
        type,
        category,
        date: new Date(date), // Garante que a data é um objeto Date
        userId: session.user.id,
      },
    });

    return NextResponse.json(newTransaction, { status: 201 });
  } catch (error) {
    console.error('[TRANSACTIONS_POST]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}