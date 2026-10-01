import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { atualizarStatus, buscarChamado, excluirChamado } from '@/services/chamados';
import { Chamado, PRIORIDADE_LABEL, Status, STATUS_LABEL } from '@/types/chamado';
import { cores } from '@/theme';

const ORDEM_STATUS: Status[] = ['aberto', 'em_andamento', 'resolvido'];

export default function DetalheChamado() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [chamado, setChamado] = useState<Chamado | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    buscarChamado(id)
      .then(setChamado)
      .catch((e) => Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível carregar o chamado.'))
      .finally(() => setCarregando(false));
  }, [id]);

  async function mudarStatus(status: Status) {
    try {
      const atualizado = await atualizarStatus(id, status);
      if (atualizado) setChamado(atualizado);
    } catch (e) {
      Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível mudar o status.');
    }
  }

  function confirmarExclusao() {
    Alert.alert('Excluir chamado', 'Essa ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await excluirChamado(id);
            router.back();
          } catch (e) {
            Alert.alert('Erro', e instanceof Error ? e.message : 'Não foi possível excluir o chamado.');
          }
        },
      },
    ]);
  }

  if (carregando) {
    return <ActivityIndicator style={{ marginTop: 40 }} color={cores.primaria} />;
  }

  if (!chamado) {
    return <Text style={styles.vazio}>Este chamado não existe mais. Volte para a lista.</Text>;
  }

  const formatar = (iso: string) =>
    new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.titulo}>{chamado.titulo}</Text>
      <Text style={[styles.prioridade, { color: cores.prioridade[chamado.prioridade] }]}>
        Prioridade {PRIORIDADE_LABEL[chamado.prioridade].toLowerCase()}
      </Text>

      <View style={styles.bloco}>
        <Linha rotulo="Solicitante" valor={chamado.solicitante} />
        <Linha rotulo="Local" valor={chamado.local} />
        <Linha rotulo="Aberto em" valor={formatar(chamado.criadoEm)} />
        <Linha rotulo="Atualizado em" valor={formatar(chamado.atualizadoEm)} />
      </View>

      <Text style={styles.secao}>Descrição</Text>
      <Text style={styles.descricao}>{chamado.descricao}</Text>

      <Text style={styles.secao}>Status</Text>
      <View style={styles.statusLista}>
        {ORDEM_STATUS.map((s) => {
          const ativo = chamado.status === s;
          const cor = cores.status[s];
          return (
            <Pressable
              key={s}
              onPress={() => mudarStatus(s)}
              style={[styles.statusBotao, ativo && { backgroundColor: cor.fundo, borderColor: cor.texto }]}
              accessibilityRole="radio"
              accessibilityState={{ checked: ativo }}
            >
              <Text style={[styles.statusTexto, ativo && { color: cor.texto, fontWeight: '700' }]}>
                {STATUS_LABEL[s]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <Pressable onPress={confirmarExclusao} style={styles.excluir} accessibilityRole="button">
        <Text style={styles.excluirTexto}>Excluir chamado</Text>
      </Pressable>
    </ScrollView>
  );
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <View style={styles.linha}>
      <Text style={styles.linhaRotulo}>{rotulo}</Text>
      <Text style={styles.linhaValor}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  titulo: { fontSize: 22, fontWeight: '700', color: cores.texto },
  prioridade: { fontSize: 14, fontWeight: '600', marginTop: 4, marginBottom: 16 },
  bloco: { backgroundColor: cores.superficie, borderRadius: 8, padding: 14, gap: 10 },
  linha: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  linhaRotulo: { fontSize: 14, color: cores.textoSuave },
  linhaValor: { fontSize: 14, color: cores.texto, fontWeight: '500', flexShrink: 1, textAlign: 'right' },
  secao: { fontSize: 15, fontWeight: '700', color: cores.texto, marginTop: 22, marginBottom: 8 },
  descricao: { fontSize: 15, color: cores.texto, lineHeight: 22 },
  statusLista: { gap: 8 },
  statusBotao: {
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  statusTexto: { fontSize: 15, color: cores.texto },
  excluir: { marginTop: 32, alignItems: 'center', paddingVertical: 12 },
  excluirTexto: { color: cores.perigo, fontSize: 15, fontWeight: '600' },
  vazio: { textAlign: 'center', color: cores.textoSuave, marginTop: 40, paddingHorizontal: 24 },
});
