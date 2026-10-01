import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { router } from 'expo-router';
import { criarChamado } from '@/services/chamados';
import { Prioridade, PRIORIDADE_LABEL } from '@/types/chamado';
import { cores } from '@/theme';

const PRIORIDADES: Prioridade[] = ['baixa', 'media', 'alta'];

export default function NovoChamado() {
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [solicitante, setSolicitante] = useState('');
  const [local, setLocal] = useState('');
  const [prioridade, setPrioridade] = useState<Prioridade>('media');
  const [salvando, setSalvando] = useState(false);

  async function salvar() {
    // Validação simples: todos os campos são obrigatórios
    if (!titulo.trim() || !descricao.trim() || !solicitante.trim() || !local.trim()) {
      Alert.alert('Campos obrigatórios', 'Preencha título, descrição, solicitante e local para abrir o chamado.');
      return;
    }

    setSalvando(true);
    try {
      await criarChamado({
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        solicitante: solicitante.trim(),
        local: local.trim(),
        prioridade,
      });
      router.back();
    } catch (e) {
      // Mostra a mensagem que veio da API (ex.: validação) ou de falta de conexão
      Alert.alert('Erro ao salvar', e instanceof Error ? e.message : 'Não foi possível abrir o chamado.');
      setSalvando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Campo rotulo="Título" valor={titulo} onChange={setTitulo} placeholder="Ex.: Impressora não imprime" />
        <Campo
          rotulo="Descrição"
          valor={descricao}
          onChange={setDescricao}
          placeholder="Descreva o problema e o que já foi tentado"
          multiline
        />
        <Campo rotulo="Solicitante" valor={solicitante} onChange={setSolicitante} placeholder="Nome de quem pediu" />
        <Campo rotulo="Local" valor={local} onChange={setLocal} placeholder="Ex.: Financeiro, sala 204" />

        <Text style={styles.rotulo}>Prioridade</Text>
        <View style={styles.prioridades}>
          {PRIORIDADES.map((p) => {
            const ativa = prioridade === p;
            const cor = cores.prioridade[p];
            return (
              <Pressable
                key={p}
                onPress={() => setPrioridade(p)}
                style={[styles.prioridade, { borderColor: cor }, ativa && { backgroundColor: cor }]}
                accessibilityRole="radio"
                accessibilityState={{ checked: ativa }}
              >
                <Text style={[styles.prioridadeTexto, { color: ativa ? '#FFFFFF' : cor }]}>{PRIORIDADE_LABEL[p]}</Text>
              </Pressable>
            );
          })}
        </View>

        <Pressable
          style={[styles.botao, salvando && { opacity: 0.6 }]}
          onPress={salvar}
          disabled={salvando}
          accessibilityRole="button"
        >
          <Text style={styles.botaoTexto}>{salvando ? 'Salvando...' : 'Abrir chamado'}</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

interface CampoProps {
  rotulo: string;
  valor: string;
  onChange: (texto: string) => void;
  placeholder?: string;
  multiline?: boolean;
}

function Campo({ rotulo, valor, onChange, placeholder, multiline }: CampoProps) {
  return (
    <View style={{ marginBottom: 16 }}>
      <Text style={styles.rotulo}>{rotulo}</Text>
      <TextInput
        value={valor}
        onChangeText={onChange}
        placeholder={placeholder}
        placeholderTextColor={cores.textoSuave}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMultilinha]}
        accessibilityLabel={rotulo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  rotulo: { fontSize: 14, fontWeight: '600', color: cores.texto, marginBottom: 6 },
  input: {
    backgroundColor: cores.superficie,
    borderWidth: 1,
    borderColor: cores.borda,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 15,
    color: cores.texto,
  },
  inputMultilinha: { minHeight: 100, textAlignVertical: 'top' },
  prioridades: { flexDirection: 'row', gap: 8, marginBottom: 28 },
  prioridade: { flex: 1, borderWidth: 1.5, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  prioridadeTexto: { fontSize: 15, fontWeight: '600' },
  botao: { backgroundColor: cores.primaria, paddingVertical: 15, borderRadius: 8, alignItems: 'center' },
  botaoTexto: { color: '#FFFFFF', fontSize: 16, fontWeight: '600' },
});
