export type Prioridade = 'baixa' | 'media' | 'alta';
export type Status = 'aberto' | 'em_andamento' | 'resolvido';

export interface Chamado {
  id: string;
  titulo: string;
  descricao: string;
  solicitante: string;
  local: string;
  prioridade: Prioridade;
  status: Status;
  criadoEm: string; // data em formato ISO
  atualizadoEm: string;
}

// Campos que o usuário preenche ao abrir um chamado
export type NovoChamado = Pick<Chamado, 'titulo' | 'descricao' | 'solicitante' | 'local' | 'prioridade'>;

export const STATUS_LABEL: Record<Status, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  resolvido: 'Resolvido',
};

export const PRIORIDADE_LABEL: Record<Prioridade, string> = {
  baixa: 'Baixa',
  media: 'Média',
  alta: 'Alta',
};
