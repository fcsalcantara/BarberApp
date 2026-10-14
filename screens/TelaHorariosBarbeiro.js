import React, { useState } from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import DateTimePicker from '@react-native-community/datetimepicker';

import {
  addDoc,
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import {
  bancoDeDados,
  autenticacao,
} from '../firebase';


// ========================================
// TELA DE HORÁRIOS DO BARBEIRO
// ========================================

export default function TelaHorariosBarbeiro({
  navigation,
}) {

  // ========================================
  // ESTADOS
  // ========================================

  const [dataSelecionada, setDataSelecionada] =
    useState(null);

  const [horariosSelecionados, setHorariosSelecionados] =
    useState([]);

  const [mostrarCalendario, setMostrarCalendario] =
    useState(false);

  const [mostrarRelogio, setMostrarRelogio] =
    useState(false);

  const [salvando, setSalvando] =
    useState(false);


  // ========================================
  // FORMATAR DATA
  // ========================================

  function formatarData(data) {

    const dia = String(
      data.getDate()
    ).padStart(2, '0');

    const mes = String(
      data.getMonth() + 1
    ).padStart(2, '0');

    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }


  // ========================================
  // FORMATAR HORA
  // ========================================

  function formatarHora(data) {

    const hora = String(
      data.getHours()
    ).padStart(2, '0');

    const minuto = String(
      data.getMinutes()
    ).padStart(2, '0');

    return `${hora}:${minuto}`;
  }


  // ========================================
  // ESCOLHER DATA
  // ========================================

  function escolherData(
    evento,
    dataEscolhida
  ) {

    setMostrarCalendario(false);

    if (
      evento.type === 'dismissed'
    ) {
      return;
    }

    if (!dataEscolhida) {
      return;
    }

    const dataFormatada =
      formatarData(
        dataEscolhida
      );

    setDataSelecionada(
      dataFormatada
    );

    // Começa uma nova lista
    // de horários para a nova data
    setHorariosSelecionados([]);
  }


  // ========================================
  // ESCOLHER HORÁRIO
  // ========================================

  function escolherHorario(
    evento,
    horarioEscolhido
  ) {

    setMostrarRelogio(false);

    if (
      evento.type === 'dismissed'
    ) {
      return;
    }

    if (!horarioEscolhido) {
      return;
    }

    const horario =
      formatarHora(
        horarioEscolhido
      );


    // Verifica se o horário
    // já foi adicionado
    if (
      horariosSelecionados.includes(
        horario
      )
    ) {

      Alert.alert(
        'Horário já adicionado',
        'Esse horário já está na lista.'
      );

      return;
    }


    // Adiciona o horário
    const novaLista = [
      ...horariosSelecionados,
      horario,
    ];


    // Organiza os horários
    novaLista.sort();


    setHorariosSelecionados(
      novaLista
    );
  }


  // ========================================
  // REMOVER HORÁRIO
  // ========================================

  function removerHorario(
    horario
  ) {

    const novaLista =
      horariosSelecionados.filter(
        (item) =>
          item !== horario
      );

    setHorariosSelecionados(
      novaLista
    );
  }


  // ========================================
  // BUSCAR BARBEIRO LOGADO
  // ========================================

  async function buscarBarbeiroLogado() {

    const barbeiroLogado =
      autenticacao.currentUser;


    // Verifica login
    if (!barbeiroLogado) {

      throw new Error(
        'Nenhum barbeiro está logado.'
      );
    }


    // Verifica e-mail
    if (!barbeiroLogado.email) {

      throw new Error(
        'O barbeiro logado não possui e-mail.'
      );
    }


    // ========================================
    // BUSCA O BARBEIRO PELO E-MAIL
    // ========================================

    const consulta =
      query(
        collection(
          bancoDeDados,
          'barbeiros'
        ),

        where(
          'email',
          '==',
          barbeiroLogado.email
        )
      );


    const resultado =
      await getDocs(
        consulta
      );


    // Nenhum barbeiro encontrado
    if (
      resultado.empty
    ) {

      throw new Error(
        'O barbeiro logado não foi encontrado na coleção barbeiros.'
      );
    }


    // Pega o primeiro documento encontrado
    const documento =
      resultado.docs[0];


    // Retorna os dados necessários
    return {
      id: documento.id,
      dados: documento.data(),
    };
  }


  // ========================================
  // SALVAR HORÁRIOS
  // ========================================

  async function salvarHorarios() {

    // ========================================
    // VALIDAR DATA
    // ========================================

    if (!dataSelecionada) {

      Alert.alert(
        'Atenção',
        'Escolha uma data antes de salvar.'
      );

      return;
    }


    // ========================================
    // VALIDAR HORÁRIOS
    // ========================================

    if (
      horariosSelecionados.length === 0
    ) {

      Alert.alert(
        'Atenção',
        'Adicione pelo menos um horário.'
      );

      return;
    }


    try {

      setSalvando(true);


      // ========================================
      // BUSCAR BARBEIRO AUTOMATICAMENTE
      // ========================================

      const barbeiro =
        await buscarBarbeiroLogado();


      // ========================================
      // SALVAR CADA HORÁRIO
      // ========================================

      for (
        const horario
        of horariosSelecionados
      ) {

        await addDoc(
          collection(
            bancoDeDados,
            'horarios'
          ),
          {

            // ID do documento do barbeiro
            // encontrado automaticamente
            barbeiroId:
              barbeiro.id,


            // E-mail do barbeiro
            barbeiroEmail:
              barbeiro.dados.email || '',


            // Nome do barbeiro
            barbeiroNome:
              barbeiro.dados.nome || '',


            // Data liberada
            data:
              dataSelecionada,


            // Horário liberado
            hora:
              horario,


            // Status inicial
            status:
              'disponivel',
          }
        );
      }


      // ========================================
      // SUCESSO
      // ========================================

      Alert.alert(
        'Sucesso',
        `Horários liberados para ${dataSelecionada}.`
      );


      // Limpa os campos
      setDataSelecionada(null);

      setHorariosSelecionados([]);

    } catch (erro) {

      console.log(
        'Erro ao salvar horários:',
        erro
      );


      // Mostra a mensagem real
      // para facilitar a identificação
      Alert.alert(
        'Erro',
        erro.message ||
        'Não foi possível salvar os horários.'
      );

    } finally {

      setSalvando(false);
    }
  }


  // ========================================
  // INTERFACE
  // ========================================

  return (
    <View style={estilos.container}>

      {/* ========================================
          VOLTAR
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
        Liberar Horários
      </Text>

      <Text style={estilos.subtitulo}>
        Escolha uma data e os horários disponíveis
      </Text>


      {/* ========================================
          DATA
      ======================================== */}

      <Text style={estilos.tituloSecao}>
        📅 Data
      </Text>


      <TouchableOpacity
        style={estilos.botaoEscolher}
        onPress={() =>
          setMostrarCalendario(true)
        }
      >

        <Text
          style={
            estilos.textoBotaoEscolher
          }
        >

          {dataSelecionada
            ? `📅 ${dataSelecionada}`
            : '📅 Escolher data'}

        </Text>

      </TouchableOpacity>


      {/* ========================================
          CALENDÁRIO
      ======================================== */}

      {mostrarCalendario && (

        <DateTimePicker
          value={new Date()}
          mode="date"
          display="calendar"
          minimumDate={new Date()}
          onChange={
            escolherData
          }
        />

      )}


      {/* ========================================
          HORÁRIOS
      ======================================== */}

      {dataSelecionada && (

        <>

          <Text style={estilos.tituloSecao}>
            🕐 Horários
          </Text>


          <TouchableOpacity
            style={
              estilos.botaoEscolher
            }
            onPress={() =>
              setMostrarRelogio(true)
            }
          >

            <Text
              style={
                estilos.textoBotaoEscolher
              }
            >
              ➕ Adicionar horário
            </Text>

          </TouchableOpacity>


          {/* ========================================
              RELÓGIO
          ======================================== */}

          {mostrarRelogio && (

            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour={true}
              display="clock"
              onChange={
                escolherHorario
              }
            />

          )}


          {/* ========================================
              HORÁRIOS ESCOLHIDOS
          ======================================== */}

          {horariosSelecionados.length > 0 && (

            <View
              style={
                estilos.areaHorarios
              }
            >

              <Text
                style={
                  estilos.textoLista
                }
              >
                Horários que serão liberados:
              </Text>


              {horariosSelecionados.map(
                (horario) => (

                  <View
                    key={horario}
                    style={
                      estilos.itemHorario
                    }
                  >

                    <Text
                      style={
                        estilos.textoHorario
                      }
                    >
                      🕐 {horario}
                    </Text>


                    <TouchableOpacity
                      onPress={() =>
                        removerHorario(
                          horario
                        )
                      }
                    >

                      <Text
                        style={
                          estilos.remover
                        }
                      >
                        ✕
                      </Text>

                    </TouchableOpacity>

                  </View>

                )
              )}

            </View>

          )}

        </>

      )}


      {/* ========================================
          BOTÃO SALVAR
      ======================================== */}

      <TouchableOpacity
        style={[
          estilos.botaoSalvar,
          salvando &&
            estilos.botaoDesativado,
        ]}
        onPress={
          salvarHorarios
        }
        disabled={salvando}
      >

        <Text
          style={
            estilos.textoBotaoSalvar
          }
        >

          {salvando
            ? 'SALVANDO...'
            : '💾 Liberar horários'}

        </Text>

      </TouchableOpacity>

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


  // ========================================
  // VOLTAR
  // ========================================

  voltar: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 45,
    marginBottom: 30,
  },


  // ========================================
  // TÍTULOS
  // ========================================

  titulo: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitulo: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },

  tituloSecao: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    marginTop: 10,
    marginBottom: 15,
  },


  // ========================================
  // BOTÃO ESCOLHER DATA / HORA
  // ========================================

  botaoEscolher: {
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 10,
    padding: 17,
    alignItems: 'center',
    marginBottom: 15,
  },

  textoBotaoEscolher: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },


  // ========================================
  // ÁREA DOS HORÁRIOS
  // ========================================

  areaHorarios: {
    marginTop: 5,
  },

  textoLista: {
    color: '#999999',
    fontSize: 14,
    marginBottom: 10,
  },

  itemHorario: {
    backgroundColor: '#1C1C1C',
    borderWidth: 1,
    borderColor: '#D4AF37',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  textoHorario: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },

  remover: {
    color: '#FF5555',
    fontSize: 20,
    fontWeight: 'bold',
  },


  // ========================================
  // BOTÃO SALVAR
  // ========================================

  botaoSalvar: {
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    padding: 17,
    marginTop: 20,
    alignItems: 'center',
  },

  botaoDesativado: {
    opacity: 0.5,
  },

  textoBotaoSalvar: {
    color: '#111111',
    fontSize: 16,
    fontWeight: 'bold',
  },

});