import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';

import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
} from 'firebase/firestore';

import {
  bancoDeDados,
  autenticacao,
} from '../firebase';

export default function TelaAgendaBarbeiro() {
  const [agendamentos, setAgendamentos] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const barbeiroLogado = autenticacao.currentUser;

    if (!barbeiroLogado || !barbeiroLogado.email) {
      setCarregando(false);
      return;
    }

    const consulta = query(
      collection(bancoDeDados, 'agendamentos'),
      where('barbeiroEmail', '==', barbeiroLogado.email)
    );

    const cancelar = onSnapshot(
      consulta,
      (snapshot) => {
        const lista = snapshot.docs.map((documento) => ({
          id: documento.id,
          ...documento.data(),
        }));

        lista.sort((a, b) => {
          const dataA = `${a.data} ${a.hora}`;
          const dataB = `${b.data} ${b.hora}`;

          return dataA.localeCompare(dataB);
        });

        setAgendamentos(lista);
        setCarregando(false);
      },
      (erro) => {
        console.log('Erro ao buscar agenda:', erro);
        setCarregando(false);
      }
    );

    return cancelar;
  }, []);

  function cancelarMarcacao(item) {
    Alert.alert(
      'Cancelar marcação',
      `Deseja cancelar o horário de ${item.data} às ${item.hora} para ${item.clienteEmail}?`,
      [
        {
          text: 'Não',
          style: 'cancel',
        },
        {
          text: 'Sim, cancelar',
          style: 'destructive',
          onPress: () => realizarCancelamento(item),
        },
      ]
    );
  }

  async function realizarCancelamento(item) {
    try {
      // Atualiza o agendamento
      await updateDoc(
        doc(bancoDeDados, 'agendamentos', item.id),
        {
          status: 'cancelado',
        }
      );

      // Procura o horário correspondente
      const consultaHorarios = query(
        collection(bancoDeDados, 'horarios'),
        where('barbeiroId', '==', item.barbeiroId)
      );

      const resultadoHorarios = await getDocs(consultaHorarios);

      for (const documento of resultadoHorarios.docs) {
        const horario = documento.data();

        if (
          horario.data === item.data &&
          horario.hora === item.hora
        ) {
          await updateDoc(
            doc(bancoDeDados, 'horarios', documento.id),
            {
              status: 'disponivel',
            }
          );

          break;
        }
      }

      Alert.alert(
        'Marcação cancelada',
        'O agendamento foi cancelado e o horário voltou a ficar disponível.'
      );

    } catch (erro) {
      console.log('Erro ao cancelar marcação:', erro);

      Alert.alert(
        'Erro',
        'Não foi possível cancelar a marcação.'
      );
    }
  }

  function renderizarAgendamento({ item }) {
    const cancelado = item.status === 'cancelado';

    return (
      <View style={styles.card}>

        <Text style={styles.data}>
          📅 {item.data}
        </Text>

        <Text style={styles.hora}>
          🕐 {item.hora}
        </Text>

        <Text style={styles.texto}>
          👤 Cliente: {item.clienteEmail}
        </Text>

        <Text style={styles.texto}>
          ✂️ Serviço: {item.servico}
        </Text>

        <Text style={styles.texto}>
          💰 Valor: {item.preco}
        </Text>

        <Text
          style={[
            styles.status,
            cancelado && styles.statusCancelado,
          ]}
        >
          {cancelado
            ? '❌ Cancelado'
            : '✅ Confirmado'}
        </Text>

        {!cancelado && (
          <TouchableOpacity
            style={styles.botaoCancelar}
            onPress={() => cancelarMarcacao(item)}
          >
            <Text style={styles.textoBotaoCancelar}>
              ❌ Cancelar marcação
            </Text>
          </TouchableOpacity>
        )}

      </View>
    );
  }

  if (carregando) {
    return (
      <View style={styles.carregando}>
        <ActivityIndicator
          size="large"
          color="#D4AF37"
        />

        <Text style={styles.carregandoTexto}>
          Carregando agenda...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.titulo}>
        Minha Agenda
      </Text>

      <Text style={styles.subtitulo}>
        Agendamentos dos seus clientes
      </Text>

      {agendamentos.length === 0 ? (
        <View style={styles.vazio}>
          <Text style={styles.vazioTexto}>
            Nenhum agendamento encontrado.
          </Text>
        </View>
      ) : (
        <FlatList
          data={agendamentos}
          keyExtractor={(item) => item.id}
          renderItem={renderizarAgendamento}
          contentContainerStyle={styles.lista}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    padding: 20,
    paddingTop: 60,
  },

  titulo: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitulo: {
    color: '#FFFFFF',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 25,
  },

  lista: {
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#1E1E1E',
    borderRadius: 12,
    padding: 18,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#D4AF37',
  },

  data: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },

  hora: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },

  texto: {
    color: '#FFFFFF',
    fontSize: 15,
    marginBottom: 7,
  },

  status: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 5,
  },

  statusCancelado: {
    color: '#FF5555',
  },

  botaoCancelar: {
    backgroundColor: '#8B0000',
    paddingVertical: 13,
    borderRadius: 8,
    marginTop: 15,
    alignItems: 'center',
  },

  textoBotaoCancelar: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  carregando: {
    flex: 1,
    backgroundColor: '#111111',
    justifyContent: 'center',
    alignItems: 'center',
  },

  carregandoTexto: {
    color: '#FFFFFF',
    marginTop: 12,
    fontSize: 16,
  },

  vazio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  vazioTexto: {
    color: '#FFFFFF',
    fontSize: 17,
  },
});