import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Chamado, PRIORIDADE_LABEL, STATUS_LABEL } from '../types/chamado';
import { cores } from '../theme';

interface Props {
  chamado: Chamado;
  onPress: () => void;
}

export function ChamadoCard({ chamado, onPress }: Props) {
  const corPrioridade = cores.prioridade[chamado.prioridade];
  const corStatus = cores.status[chamado.status];
  const data = new Date(chamado.criadoEm).toLocaleDateString('pt-BR');

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, { borderLeftColor: corPrioridade }, pressed && styles.pressionado]}
      accessibilityRole="button"
      accessibilityLabel={`Chamado ${chamado.titulo}, prioridade ${PRIORIDADE_LABEL[chamado.prioridade]}, ${STATUS_LABEL[chamado.status]}`}
    >
      <View style={styles.topo}>
        <Text style={styles.titulo} numberOfLines={1}>
          {chamado.titulo}
        </Text>
        <View style={[styles.status, { backgroundColor: corStatus.fundo }]}>
          <Text style={[styles.statusTexto, { color: corStatus.texto }]}>{STATUS_LABEL[chamado.status]}</Text>
        </View>
      </View>

      <Text style={styles.info} numberOfLines={1}>
        {chamado.local} · {chamado.solicitante}
      </Text>

      <View style={styles.rodape}>
        <Text style={[styles.prioridade, { color: corPrioridade }]}>
          Prioridade {PRIORIDADE_LABEL[chamado.prioridade].toLowerCase()}
        </Text>
        <Text style={styles.data}>{data}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: cores.superficie,
    borderRadius: 8,
    borderLeftWidth: 5,
    padding: 14,
    gap: 6,
  },
  pressionado: { opacity: 0.7 },
  topo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  titulo: { flex: 1, fontSize: 16, fontWeight: '600', color: cores.texto },
  status: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 4 },
  statusTexto: { fontSize: 12, fontWeight: '600' },
  info: { fontSize: 14, color: cores.textoSuave },
  rodape: { flexDirection: 'row', justifyContent: 'space-between' },
  prioridade: { fontSize: 13, fontWeight: '600' },
  data: { fontSize: 13, color: cores.textoSuave },
});
