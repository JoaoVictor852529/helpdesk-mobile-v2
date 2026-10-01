import { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { router, useFocusEffect } from 'expo-router';
import { ChamadoCard } from '@/components/ChamadoCard';
import { listarChamados } from '@/services/chamados';
import { Chamado, Status, STATUS_LABEL } from '@/types/chamado';
import { cores } from '@/theme';

type Filtro = Status | 'todos';
const FILTROS: Filtro[] = ['todos', 'aberto', 'em_andamento', 'resolvido'];

export default function ListaChamados() {
  const [chamados, setChamados] = useState<Chamado[]>([]);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [carregando, setCarregando] = useState(true);
  const [atualizando, setAtualizando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setErro(null);
      setChamados(await listarChamados());
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Erro ao carregar os chamados.');
    } finally {
      setCarregando(false);
      setAtualizando(false);
    }
  }, []);

  // Recarrega a lista toda vez que a tela volta a ficar visível
  useFocusEffect(
    useCallback(() => {
      carregar();
    }, [carregar])
  );

  // Puxar a lista para baixo também recarrega
  function aoPuxar() {
    setAtualizando(true);
    carregar();
  }

  const visiveis = filtro === 'todos' ? chamados : chamados.filter((c) => c.status === filtro);
  const pendentes = chamados.filter((c) => c.status !== 'resolvido').length;

  if (carregando) {
    return <ActivityIndicator style={{ marginTop: 40 }} color={cores.primaria} />;
  }

  if (erro) {
    return (
      <View style={styles.erroContainer}>
        <Text style={styles.erroTitulo}>Sem conexão com a API</Text>
        <Text style={styles.erroTexto}>{erro}</Text>
        <Pressable
          style={styles.botaoSecundario}
          onPress={() => {
            setCarregando(true);
            carregar();
          }}
          accessibilityRole="button"
        >
          <Text style={styles.botaoSecundarioTexto}>Tentar de novo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.resumo}>
        {pendentes === 0 ? 'Nenhum chamado pendente' : `${pendentes} chamado(s) pendente(s)`}
      </Text>

      <View style={styles.filtros}>
        {FILTROS.map((f) => {
          const ativo = filtro === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFiltro(f)}
              style={[styles.filtro, ativo && styles.filtroAtivo]}
              accessibilityRole="button"
              accessibilityState={{ selected: ativo }}
            >
              <Text style={[styles.filtroTexto, ativo && styles.filtroTextoAtivo]}>
                {f === 'todos' ? 'Todos' : STATUS_LABEL[f]}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <FlatList
        data={visiveis}
        keyExtractor={(c) => c.id}
        renderItem={({ item }) => (
          <ChamadoCard chamado={item} onPress={() => router.push(`/chamado/${item.id}`)} />
        )}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        contentContainerStyle={styles.lista}
        refreshControl={<RefreshControl refreshing={atualizando} onRefresh={aoPuxar} colors={[cores.primaria]} />}
        ListEmptyComponent={
          <Text style={styles.vazio}>
            Nenhum chamado aqui. Toque em "Abrir chamado" para registrar o primeiro.
          </Text>
        }
      />

      <Pressable style={styles.botao} onPress={() => router.push('/novo')} accessibilityRole="button">
        <Text style={styles.botaoTexto}>Abrir chamado</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  resumo: { fontSize: 15, color: cores.textoSuave, marginBottom: 12 },
  filtros: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  filtro: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: cores.borda,
    backgroundColor: cores.superficie,
  },
  filtroAtivo: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  filtroTexto: { fontSize: 14, color: cores.texto },
  filtroTextoAtivo: { color: '#FFFFFF', fontWeight: '600' },
  lista: { paddingBottom: 90, flexGrow: 1 },
  vazio: { textAlign: 'center', color: cores.textoSuave, marginTop: 40, paddingHorizontal: 24, lineHeight: 21 },
  botao: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: cores.primaria,
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  botaoTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
  erroContainer: { flex: 1, justifyContent: 'center', padding: 24, gap: 10 },
  erroTitulo: { fontSize: 18, fontWeight: '700', color: cores.texto, textAlign: 'center' },
  erroTexto: { fontSize: 15, color: cores.textoSuave, textAlign: 'center', lineHeight: 21 },
  botaoSecundario: {
    marginTop: 12,
    alignSelf: 'center',
    borderWidth: 1.5,
    borderColor: cores.primaria,
    borderRadius: 8,
    paddingVertical: 11,
    paddingHorizontal: 22,
  },
  botaoSecundarioTexto: { color: cores.primaria, fontSize: 15, fontWeight: '600' },
});
