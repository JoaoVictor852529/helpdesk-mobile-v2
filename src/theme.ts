// Cores do app. As de prioridade e status têm significado, não são enfeite.
export const cores = {
  fundo: '#EEF1F4',
  superficie: '#FFFFFF',
  texto: '#1C2733',
  textoSuave: '#5B6B7B',
  borda: '#D5DCE3',
  primaria: '#1F4E79',
  perigo: '#C0392B',

  prioridade: {
    alta: '#C0392B',
    media: '#D68910',
    baixa: '#2E8B57',
  },

  status: {
    aberto: { fundo: '#E3ECF6', texto: '#1F4E79' },
    em_andamento: { fundo: '#FBF0DC', texto: '#8A5A00' },
    resolvido: { fundo: '#E2F2E8', texto: '#1E6B41' },
  },
} as const;
