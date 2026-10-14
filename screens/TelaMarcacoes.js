import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import {
  collection,
  query,
  where,
  onSnapshot,
  writeBatch,
  doc,
} from 'firebase/firestore';

import {
  bancoDeDados,
  autenticacao,
} from '../firebase';


// ========================================
// TELA MINHAS MARCAÇÕES
// ========================================

export default function TelaMarcacoes({ navigation }) {

  // Guarda os agendamentos do cliente
  const [marcacoes, setMarcacoes] = useState([]);

  // Controla o cancelamento
  const [cancelando, setCancelando] = useState(false);


  // ========================================
  // BUSCAR AGENDAMENTOS DO FIREBASE
  // ========================================

  useEffect(() => {

    const usuarioLogado = autenticacao.currentUser;


    // Se não existir usuário logado
    if (!usuarioLogado) {

      setMarcacoes([]);

      return;
    }


    // Busca somente os agendamentos
    // do cliente logado
    const consulta = query(
      collection(
        bancoDeDados,
        'agendamentos'
      ),

      where(
        'clienteId',
        '==',
        usuarioLogado.uid
      )
    );


    // Escuta mudanças no Firebase
    const cancelarEscuta = onSnapshot(

      consulta,

      (resultado) => {

        const listaAgendamentos =
          resultado.docs.map(
            (documento) => ({

              id: documento.id,

              ...documento.data(),

            })
          );


        setMarcacoes(
          listaAgendamentos
        );
      },

      (erro) => {

        console.log(
          'Erro ao buscar agendamentos:',
          erro
        );

      }
    );


    // Encerra a escuta
    return () => cancelarEscuta();

  }, []);


  // ========================================
  // CANCELAR AGENDAMENTO
  // ========================================

  function confirmarCancelamento(agendamento) {

    Alert.alert(

      'Cancelar agendamento',

      'Deseja realmente cancelar este agendamento?',

      [

        {
          text: 'Não',

          style: 'cancel',
        },

        {
          text: 'Sim, cancelar',

          style: 'destructive',

          onPress: () =>
            cancelarAgendamento(
              agendamento
            ),
        },

      ]

    );
  }


  // ========================================
  // CANCELAR AGENDAMENTO NO FIREBASE
  // ========================================

  async function cancelarAgendamento(
    agendamento
  ) {

    // Evita dois cancelamentos
    // ao mesmo tempo
    if (cancelando) {
      return;
    }


    try {

      setCancelando(true);


      // ========================================
      // VERIFICAR USUÁRIO LOGADO
      // ========================================

      const usuarioLogado =
        autenticacao.currentUser;


      if (!usuarioLogado) {

        Alert.alert(
          'Erro',
          'Usuário não está logado.'
        );

        return;
      }


      // ========================================
      // REFERÊNCIA DO AGENDAMENTO
      // ========================================

      const referenciaAgendamento =
        doc(
          bancoDeDados,
          'agendamentos',
          agendamento.id
        );


      // ========================================
      // LOCALIZAR O HORÁRIO ORIGINAL
      // ========================================
      //
      // Procuramos o horário pelo:
      //
      // barbeiroId
      // data
      // hora
      //
      // Isso permite encontrar novamente
      // o horário que estava ocupado.
      // ========================================

      const consultaHorario = query(

        collection(
          bancoDeDados,
          'horarios'
        ),

        where(
          'barbeiroId',
          '==',
          agendamento.barbeiroId
        ),

        where(
          'data',
          '==',
          agendamento.data
        ),

        where(
          'hora',
          '==',
          agendamento.hora
        )

      );


      // Busca o horário
      const resultadoHorario =
        await new Promise(
          (resolve, reject) => {

            const cancelarEscuta =
              onSnapshot(

                consultaHorario,

                (resultado) => {

                  cancelarEscuta();

                  resolve(resultado);

                },

                (erro) => {

                  cancelarEscuta();

                  reject(erro);

                }

              );

          }
        );


      // ========================================
      // VERIFICAR SE O HORÁRIO EXISTE
      // ========================================

      if (resultadoHorario.empty) {

        Alert.alert(
          'Erro',
          'O horário original não foi encontrado.'
        );

        return;
      }


      // Pega o primeiro horário encontrado
      const documentoHorario =
        resultadoHorario.docs[0];


      const referenciaHorario =
        doc(
          bancoDeDados,
          'horarios',
          documentoHorario.id
        );


      // ========================================
      // GRAVAÇÃO EM LOTE
      // ========================================

      const lote =
        writeBatch(
          bancoDeDados
        );


      // ========================================
      // 1. CANCELA O AGENDAMENTO
      // ========================================

      lote.update(

        referenciaAgendamento,

        {
          status: 'cancelado',
        }

      );


      // ========================================
      // 2. LIBERA O HORÁRIO
      // ========================================

      lote.update(

        referenciaHorario,

        {
          status: 'disponivel',
        }

      );


      // ========================================
      // SALVA AS DUAS ALTERAÇÕES
      // ========================================

      await lote.commit();


      // ========================================
      // MENSAGEM
      // ========================================

      Alert.alert(

        'Agendamento cancelado',

        'O horário foi liberado e já está disponível para outro cliente.'

      );


    } catch (erro) {

      console.log(
        'Erro ao cancelar agendamento:',
        erro
      );


      Alert.alert(
        'Erro',
        'Não foi possível cancelar o agendamento.'
      );


    } finally {

      setCancelando(false);

    }

  }


  // ========================================
  // TELA
  // ========================================

  return (

    <View style={estilos.container}>


      {/* ========================================
          BOTÃO VOLTAR
      ======================================== */}

      <TouchableOpacity
        onPress={() =>
          navigation.goBack()
        }
      >

        <Text style={estilos.voltar}>
          ← Voltar
        </Text>

      </TouchableOpacity>


      {/* ========================================
          TÍTULO
      ======================================== */}

      <Text style={estilos.titulo}>
        Minhas Marcações
      </Text>


      <Text style={estilos.subtitulo}>
        Seus próximos agendamentos
      </Text>


      {/* ========================================
          LISTA
      ======================================== */}

      <FlatList

        data={marcacoes}

        keyExtractor={(item) =>
          item.id
        }

        ListEmptyComponent={

          <Text style={estilos.semMarcacoes}>
            Você ainda não possui agendamentos.
          </Text>

        }

        renderItem={({ item }) => (

          <View style={estilos.card}>


            {/* ========================================
                SERVIÇO
            ======================================== */}

            <Text style={estilos.servico}>
              {item.servico}
            </Text>


            {/* ========================================
                BARBEIRO
            ======================================== */}

            <Text style={estilos.informacao}>
              Barbeiro: {item.barbeiroNome}
            </Text>


            {/* ========================================
                DATA
            ======================================== */}

            <Text style={estilos.informacao}>
              Data: {item.data}
            </Text>


            {/* ========================================
                HORÁRIO
            ======================================== */}

            <Text style={estilos.informacao}>
              Horário: {item.hora}
            </Text>


            {/* ========================================
                PREÇO
            ======================================== */}

            <Text style={estilos.informacao}>
              Valor: {item.preco}
            </Text>


            {/* ========================================
                STATUS
            ======================================== */}

            <Text style={estilos.status}>
              Status: {item.status}
            </Text>


            {/* ========================================
                BOTÃO CANCELAR
            ======================================== */}

            {item.status === 'confirmado' && (

              <TouchableOpacity

                style={estilos.botaoCancelar}

                onPress={() =>
                  confirmarCancelamento(
                    item
                  )
                }

                disabled={cancelando}

              >

                <Text style={estilos.textoBotaoCancelar}>

                  {cancelando
                    ? 'CANCELANDO...'
                    : '❌ Cancelar agendamento'}

                </Text>

              </TouchableOpacity>

            )}


            {/* ========================================
                MENSAGEM SE JÁ FOI CANCELADO
            ======================================== */}

            {item.status === 'cancelado' && (

              <Text style={estilos.textoCancelado}>

                Agendamento cancelado

              </Text>

            )}

          </View>

        )}

      />

    </View>

  );
}


// ========================================
// ESTILOS
// ========================================

const estilos = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#111111',
    padding: 24,
  },


  voltar: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 45,
    marginBottom: 25,
  },


  titulo: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: 'bold',
  },


  subtitulo: {
    color: '#999999',
    fontSize: 16,
    marginTop: 8,
    marginBottom: 25,
  },


  card: {
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 15,
  },


  servico: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },


  informacao: {
    color: '#CCCCCC',
    fontSize: 15,
    marginTop: 6,
  },


  status: {
    color: '#D4AF37',
    fontSize: 15,
    fontWeight: 'bold',
    marginTop: 12,
  },


  // ========================================
  // BOTÃO CANCELAR
  // ========================================

  botaoCancelar: {
    backgroundColor: '#2A1A1A',
    borderWidth: 1,
    borderColor: '#8B0000',
    borderRadius: 10,
    padding: 14,
    marginTop: 18,
    alignItems: 'center',
  },


  textoBotaoCancelar: {
    color: '#FF6B6B',
    fontSize: 15,
    fontWeight: 'bold',
  },


  // ========================================
  // AGENDAMENTO CANCELADO
  // ========================================

  textoCancelado: {
    color: '#999999',
    fontSize: 14,
    marginTop: 15,
    fontStyle: 'italic',
  },


  semMarcacoes: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 30,
  },

});