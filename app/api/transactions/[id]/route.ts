// Arquivo: app/api/transactions/[id]/route.ts

import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

// --- NOVA FUNÇÃO PARA ATUALIZAR (PATCH) UMA TRANSAÇÃO ---
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // 1. Verifica se o usuário está logado
    if (!session?.user?.id) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const { description, amount, date, type, category } = body;

    // 2. Verifica se a transação pertence ao usuário
    const transactionToUpdate = await db.transaction.findUnique({
      where: { id: id },
    });

    if (transactionToUpdate?.userId !== session.user.id) {
      return new NextResponse('Acesso negado', { status: 403 });
    }

    // 3. Atualiza a transação no banco de dados com os novos dados
    const updatedTransaction = await db.transaction.update({
      where: {
        id: id,
      },
      data: {
        description,
        amount: amount ? parseFloat(amount) : undefined,
        date: date ? new Date(date) : undefined,
        type,
        category,
      },
    });

    return NextResponse.json(updatedTransaction);
  } catch (error) {
    console.error('[TRANSACTION_PATCH]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}


// Função DELETE (sem alterações)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return new NextResponse('Não autorizado', { status: 401 });
    }

    const { id } = params;

    const transactionToDelete = await db.transaction.findUnique({
      where: { id: id },
    });

    if (transactionToDelete?.userId !== session.user.id) {
      return new NextResponse('Acesso negado', { status: 403 });
    }

    await db.transaction.delete({
      where: { id: id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[TRANSACTION_DELETE]', error);
    return new NextResponse('Erro Interno do Servidor', { status: 500 });
  }
}