import { Chamado, NovoChamado, Status } from '../types/chamado';

/*
 * Camada de dados do app.
 * Agora os chamados vêm da HelpDesk API (Node.js + PostgreSQL).
 * As telas continuam chamando as mesmas funções de antes — só o
 * "por dentro" delas mudou: em vez do AsyncStorage, usam fetch() na API.
 *
 * O endereço da API fica no arquivo .env.local:
 *   EXPO_PUBLIC_API_URL=http://SEU-IP:3333
 */

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://192.168.0.15:3333';
const TEMPO_LIMITE_MS = 10000;

// Erro com o código HTTP que a API devolveu (ex.: 404, 400)
export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
  }
}

// Função central: todas as chamadas à API passam por aqui
async function requisicao<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('Endereço da API não configurado. Crie o arquivo .env.local com EXPO_PUBLIC_API_URL.');
  }

  // Se a API não responder em 10 segundos, desiste (evita o app ficar travado carregando)
  const controle = new AbortController();
  const timer = setTimeout(() => controle.abort(), TEMPO_LIMITE_MS);

  let resposta: Response;
  try {
    resposta = await fetch(`${API_URL}${caminho}`, {
      ...opcoes,
      headers: { 'Content-Type': 'application/json', ...opcoes.headers },
      signal: controle.signal,
    });
  } catch {
    throw new Error('Não foi possível conectar à API. Confira se ela está ligada e se o celular está no mesmo Wi-Fi.');
  } finally {
    clearTimeout(timer);
  }

  if (!resposta.ok) {
    // A API devolve { erro, detalhes? } — usamos essas mensagens para o usuário
    const corpo = await resposta.json().catch(() => null);
    const detalhes: string | undefined = corpo?.detalhes?.map((d: { mensagem: string }) => d.mensagem).join('\n');
    throw new ApiError(detalhes || corpo?.erro || 'Erro inesperado na API', resposta.status);
  }

  // 204 = sucesso sem conteúdo (ex.: depois de excluir)
  if (resposta.status === 204) return undefined as T;
  return (await resposta.json()) as T;
}

export async function listarChamados(): Promise<Chamado[]> {
  return requisicao<Chamado[]>('/chamados');
}

export async function buscarChamado(id: string): Promise<Chamado | null> {
  try {
    return await requisicao<Chamado>(`/chamados/${id}`);
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 404) return null;
    throw erro;
  }
}

export async function criarChamado(dados: NovoChamado): Promise<Chamado> {
  return requisicao<Chamado>('/chamados', {
    method: 'POST',
    body: JSON.stringify(dados),
  });
}

export async function atualizarStatus(id: string, status: Status): Promise<Chamado | null> {
  try {
    return await requisicao<Chamado>(`/chamados/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 404) return null;
    throw erro;
  }
}

export async function excluirChamado(id: string): Promise<void> {
  await requisicao<void>(`/chamados/${id}`, { method: 'DELETE' });
}
