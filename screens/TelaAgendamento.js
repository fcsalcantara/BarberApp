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
  getDoc,
} from 'firebase/firestore';

import {
  bancoDeDados,
  autenticacao,
} from '../firebase';


// ======================================================
// SERVIÇOS
// ======================================================

const servicos = [
  {
    id: '1',
    nome: 'Corte de cabelo',
    preco: 'R$ 35,00',
  },
  {
    id: '2',
    nome: 'Barba',
    preco: 'R$ 25,00',
  },
  {
    id: '3',
    nome: 'Corte + Barba',
    preco: 'R$ 55,00',
  },
];


// ======================================================
// TELA DE AGENDAMENTO
// ======================================================

export default function TelaAgendamento({ navigation }) {

  // ====================================================
  // ESTADOS
  // ====================================================

  const [servicoSelecionado, setServicoSelecionado] =
    useState(null);

  const [barbeiroSelecionado, setBarbeiroSelecionado] =
    useState(null);

  const [horarioSelecionado, setHorarioSelecionado] =
    useState(null);

  const [dataSelecionada, setDataSelecionada] =
    useState(null);

  const [barbeiros, setBarbeiros] =
    useState([]);

  const [horarios, setHorarios] =
    useState([]);

  const [datasDisponiveis, setDatasDisponiveis] =
    useState([]);

  const [salvando, setSalvando] =
    useState(false);

  const [hojeEAniversario, setHojeEAniversario] =
    useState(false);


  // ====================================================
  // VERIFICAR ANIVERSÁRIO
  // ====================================================

  function verificarAniversario(dataNascimento) {

    if (!dataNascimento) {
      return false;
    }

    const partes = dataNascimento.split('/');

    if (partes.length !== 3) {
      return false;
    }

    const diaNascimento = partes[0];
    const mesNascimento = partes[1];

    if (
      diaNascimento.length !== 2 ||
      mesNascimento.length !== 2 ||
      partes[2].length !== 4
    ) {
      return false;
    }

    const hoje = new Date();

    const diaHoje = String(
      hoje.getDate()
    ).padStart(2, '0');

    const mesHoje = String(
      hoje.getMonth() + 1
    ).padStart(2, '0');

    return (
      diaNascimento === diaHoje &&
      mesNascimento === mesHoje
    );
  }


  // ====================================================
  // CARREGAR ANIVERSÁRIO
  // ====================================================

  useEffect(() => {

    async function carregarAniversario() {

      try {

        const usuarioLogado =
          autenticacao.currentUser;

        if (!usuarioLogado) {
          setHojeEAniversario(false);
          return;
        }

        const referenciaUsuario = doc(
          bancoDeDados,
          'usuarios',
          usuarioLogado.uid
        );

        const documentoUsuario =
          await getDoc(
            referenciaUsuario
          );

        if (documentoUsuario.exists()) {

          const perfil =
            documentoUsuario.data();

          const aniversario =
            verificarAniversario(
              perfil.dataNascimento
            );

          setHojeEAniversario(
            aniversario
          );

        } else {

          setHojeEAniversario(false);
        }

      } catch (erro) {

        console.log(
          'Erro ao verificar aniversário:',
          erro
        );

        setHojeEAniversario(false);
      }
    }

    carregarAniversario();

  }, []);


  // ====================================================
  // BUSCAR BARBEIROS
  // ====================================================

  useEffect(() => {

    const consulta = query(
      collection(
        bancoDeDados,
        'barbeiros'
      ),
      where(
        'ativo',
        '==',
        true
      )
    );

    const cancelarEscuta =
      onSnapshot(
        consulta,

        (resultado) => {

          const listaBarbeiros =
            resultado.docs.map(
              (documento) => ({
                id: documento.id,
                ...documento.data(),
              })
            );

          setBarbeiros(
            listaBarbeiros
          );
        },

        (erro) => {

          console.log(
            'Erro ao buscar barbeiros:',
            erro
          );

          Alert.alert(
            'Erro',
            'Não foi possível carregar os barbeiros.'
          );
        }
      );

    return cancelarEscuta;

  }, []);


  // ====================================================
  // BUSCAR HORÁRIOS DO BARBEIRO
  // ====================================================

  useEffect(() => {

    if (!barbeiroSelecionado) {

      setHorarios([]);
      setDatasDisponiveis([]);
      setDataSelecionada(null);
      setHorarioSelecionado(null);

      return;
    }

    const consulta = query(
      collection(
        bancoDeDados,
        'horarios'
      ),

      where(
        'barbeiroId',
        '==',
        barbeiroSelecionado
      ),

      where(
        'status',
        '==',
        'disponivel'
      )
    );

    const cancelarEscuta =
      onSnapshot(
        consulta,

        (resultado) => {

          const listaHorarios =
            resultado.docs.map(
              (documento) => ({
                id: documento.id,
                ...documento.data(),
              })
            );

          setHorarios(
            listaHorarios
          );


          // --------------------------------------------
          // CRIAR LISTA DE DATAS
          // --------------------------------------------

          const datasUnicas = [
            ...new Set(
              listaHorarios
                .map(
                  (item) => item.data
                )
                .filter(
                  (data) => data
                )
            ),
          ];

          datasUnicas.sort(
            compararDatas
          );

          setDatasDisponiveis(
            datasUnicas
          );


          // --------------------------------------------
          // VERIFICAR DATA SELECIONADA
          // --------------------------------------------

          if (
            dataSelecionada &&
            !datasUnicas.includes(
              dataSelecionada
            )
          ) {

            setDataSelecionada(null);
            setHorarioSelecionado(null);
          }


          // --------------------------------------------
          // VERIFICAR HORÁRIO SELECIONADO
          // --------------------------------------------

          if (horarioSelecionado) {

            const horarioAindaDisponivel =
              listaHorarios.some(
                (item) =>
                  item.id ===
                    horarioSelecionado &&
                  item.data ===
                    dataSelecionada
              );

            if (
              !horarioAindaDisponivel
            ) {

              setHorarioSelecionado(null);
            }
          }
        },

        (erro) => {

          console.log(
            'Erro ao buscar horários:',
            erro
          );

          setHorarios([]);
          setDatasDisponiveis([]);
        }
      );

    return cancelarEscuta;

  }, [barbeiroSelecionado]);


  // ====================================================
  // COMPARAR DATAS
  // ====================================================

  function compararDatas(dataA, dataB) {

    const partesA =
      dataA.split('/');

    const partesB =
      dataB.split('/');

    const dataCompletaA = new Date(
      Number(partesA[2]),
      Number(partesA[1]) - 1,
      Number(partesA[0])
    );

    const dataCompletaB = new Date(
      Number(partesB[2]),
      Number(partesB[1]) - 1,
      Number(partesB[0])
    );

    return (
      dataCompletaA -
      dataCompletaB
    );
  }


  // ====================================================
  // SELECIONAR BARBEIRO
  // ====================================================

  function selecionarBarbeiro(id) {

    setBarbeiroSelecionado(id);
    setDataSelecionada(null);
    setHorarioSelecionado(null);
  }


  // ====================================================
  // SELECIONAR DATA
  // ====================================================

  function selecionarData(data) {

    setDataSelecionada(data);
    setHorarioSelecionado(null);
  }


  // ====================================================
  // SELECIONAR HORÁRIO
  // ====================================================

  function selecionarHorario(id) {

    setHorarioSelecionado(id);
  }


  // ====================================================
  // CONFIRMAR AGENDAMENTO
  // ====================================================

  async function confirmarAgendamento() {

    if (
      !servicoSelecionado ||
      !barbeiroSelecionado ||
      !dataSelecionada ||
      !horarioSelecionado
    ) {

      Alert.alert(
        'Atenção',
        'Selecione o serviço, barbeiro, data e horário.'
      );

      return;
    }

    const usuarioLogado =
      autenticacao.currentUser;

    if (!usuarioLogado) {

      Alert.alert(
        'Erro',
        'Usuário não está logado.'
      );

      return;
    }

    try {

      setSalvando(true);


      // ----------------------------------------------
      // ENCONTRAR SERVIÇO
      // ----------------------------------------------

      const servico =
        servicos.find(
          (item) =>
            item.id ===
            servicoSelecionado
        );


      // ----------------------------------------------
      // ENCONTRAR BARBEIRO
      // ----------------------------------------------

      const barbeiro =
        barbeiros.find(
          (item) =>
            item.id ===
            barbeiroSelecionado
        );


      // ----------------------------------------------
      // ENCONTRAR HORÁRIO
      // ----------------------------------------------

      const horario =
        horarios.find(
          (item) =>
            item.id ===
              horarioSelecionado &&
            item.data ===
              dataSelecionada
        );


      // ----------------------------------------------
      // VALIDAR DADOS
      // ----------------------------------------------

      if (!servico) {

        Alert.alert(
          'Erro',
          'Serviço não encontrado.'
        );

        return;
      }

      if (!barbeiro) {

        Alert.alert(
          'Erro',
          'Barbeiro não encontrado.'
        );

        return;
      }

      if (!horario) {

        Alert.alert(
          'Erro',
          'Esse horário não está mais disponível.'
        );

        return;
      }


      // ----------------------------------------------
      // REFERÊNCIAS DO FIRESTORE
      // ----------------------------------------------

      const referenciaHorario =
        doc(
          bancoDeDados,
          'horarios',
          horario.id
        );

      const referenciaAgendamento =
        doc(
          collection(
            bancoDeDados,
            'agendamentos'
          )
        );


      // ----------------------------------------------
      // PREÇO
      // ----------------------------------------------

      const precoFinal =
        hojeEAniversario
          ? 'GRATUITO'
          : servico.preco;


      // ----------------------------------------------
      // DADOS DO AGENDAMENTO
      // ----------------------------------------------

      const agendamento = {

        clienteId:
          usuarioLogado.uid,

        clienteEmail:
          usuarioLogado.email || '',

        aniversario:
          hojeEAniversario,

        barbeiroId:
          barbeiro.id,

        barbeiroNome:
          barbeiro.nome,

        barbeiroEmail:
          barbeiro.email || '',

        servico:
          servico.nome,

        preco:
          precoFinal,

        data:
          dataSelecionada,

        hora:
          horario.hora,

        status:
          'confirmado',
      };


      // ----------------------------------------------
      // GRAVAÇÃO EM LOTE
      // ----------------------------------------------

      const lote =
        writeBatch(
          bancoDeDados
        );

      // Cria o agendamento
      lote.set(
        referenciaAgendamento,
        agendamento
      );

      // Ocupa o horário
      lote.update(
        referenciaHorario,
        {
          status: 'ocupado',
        }
      );

      // Salva as duas alterações
      await lote.commit();


      // ----------------------------------------------
      // SUCESSO
      // ----------------------------------------------

      navigation.navigate(
        'Sucesso'
      );

    } catch (erro) {

      console.log(
        'Erro ao salvar agendamento:',
        erro
      );

      Alert.alert(
        'Erro',
        'Não foi possível realizar o agendamento.'
      );

    } finally {

      setSalvando(false);
    }
  }


  // ====================================================
  // INTERFACE
  // ====================================================

  return (
    <View style={estilos.container}>

      {/* VOLTAR */}

      <TouchableOpacity
        onPress={() =>
          navigation.goBack()
        }
      >
        <Text style={estilos.voltar}>
          ← Voltar
        </Text>
      </TouchableOpacity>


      {/* TÍTULO */}

      <Text style={estilos.titulo}>
        Agendamento
      </Text>


      {/* ==================================================
          ANIVERSÁRIO
      ================================================== */}

      {hojeEAniversario && (

        <View style={estilos.aniversario}>

          <Text style={estilos.aniversarioTitulo}>
            🎂 Feliz aniversário!
          </Text>

          <Text style={estilos.aniversarioTexto}>
            Seu corte é gratuito hoje.
          </Text>

        </View>
      )}


      {/* ==================================================
          SERVIÇOS
      ================================================== */}

      <Text style={estilos.subtitulo}>
        Escolha seu serviço
      </Text>

      <FlatList
        data={servicos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (

          <TouchableOpacity
            style={[
              estilos.card,
              servicoSelecionado === item.id &&
                estilos.cardSelecionado,
            ]}
            onPress={() =>
              setServicoSelecionado(
                item.id
              )
            }
          >

            <Text style={estilos.nome}>
              {item.nome}
            </Text>

            <Text style={estilos.preco}>
              {hojeEAniversario
                ? 'GRATUITO'
                : item.preco}
            </Text>

          </TouchableOpacity>
        )}
      />


      {/* ==================================================
          BARBEIROS
      ================================================== */}

      <Text style={estilos.subtitulo}>
        Escolha o barbeiro
      </Text>

      <FlatList
        data={barbeiros}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={
          estilos.listaBarbeiros
        }
        ListEmptyComponent={
          <Text style={estilos.semBarbeiros}>
            Nenhum barbeiro cadastrado.
          </Text>
        }
        renderItem={({ item }) => (

          <TouchableOpacity
            style={[
              estilos.cardBarbeiro,
              barbeiroSelecionado === item.id &&
                estilos.cardSelecionado,
            ]}
            onPress={() =>
              selecionarBarbeiro(
                item.id
              )
            }
          >

            <Text
              style={estilos.nomeBarbeiro}
              numberOfLines={2}
              ellipsizeMode="tail"
            >
              {item.nome}
            </Text>

          </TouchableOpacity>
        )}
      />


      {/* ==================================================
          DATAS
      ================================================== */}

      <Text style={estilos.subtitulo}>
        Escolha a data
      </Text>

      {!barbeiroSelecionado && (

        <Text style={estilos.instrucao}>
          Primeiro escolha um barbeiro.
        </Text>
      )}

      {barbeiroSelecionado &&
        datasDisponiveis.length === 0 && (

        <Text style={estilos.instrucao}>
          Nenhuma data disponível para este barbeiro.
        </Text>
      )}

      {barbeiroSelecionado &&
        datasDisponiveis.length > 0 && (

        <View style={estilos.datas}>

          {datasDisponiveis.map(
            (data) => (

              <TouchableOpacity
                key={data}
                style={[
                  estilos.data,
                  dataSelecionada === data &&
                    estilos.dataSelecionada,
                ]}
                onPress={() =>
                  selecionarData(data)
                }
              >

                <Text style={estilos.dataTexto}>
                  {data.substring(0, 5)}
                </Text>

                <Text style={estilos.anoTexto}>
                  {data.substring(6)}
                </Text>

              </TouchableOpacity>
            )
          )}

        </View>
      )}


      {/* ==================================================
          HORÁRIOS
      ================================================== */}

      <Text style={estilos.subtitulo}>
        Escolha o horário
      </Text>

      {barbeiroSelecionado &&
        !dataSelecionada && (

        <Text style={estilos.instrucao}>
          Escolha uma data para ver os horários.
        </Text>
      )}

      {barbeiroSelecionado &&
        dataSelecionada && (

        <FlatList
          data={
            horarios.filter(
              (item) =>
                item.data ===
                dataSelecionada
            )
          }
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={
            estilos.linhaHorarios
          }
          ListEmptyComponent={
            <Text style={estilos.semHorarios}>
              Nenhum horário disponível para esta data.
            </Text>
          }
          renderItem={({ item }) => (

            <TouchableOpacity
              style={[
                estilos.horario,
                horarioSelecionado === item.id &&
                  estilos.horarioSelecionado,
              ]}
              onPress={() =>
                selecionarHorario(
                  item.id
                )
              }
            >

              <Text style={estilos.horarioTexto}>
                {item.hora}
              </Text>

            </TouchableOpacity>
          )}
        />
      )}


      {/* ==================================================
          CONFIRMAR
      ================================================== */}

      <TouchableOpacity
        style={[
          estilos.botaoConfirmar,
          salvando &&
            estilos.botaoDesativado,
        ]}
        onPress={confirmarAgendamento}
        disabled={salvando}
      >

        <Text style={estilos.textoBotaoConfirmar}>
          {salvando
            ? 'SALVANDO...'
            : 'CONFIRMAR AGENDAMENTO'}
        </Text>

      </TouchableOpacity>

    </View>
  );
}


// ======================================================
// ESTILOS
// ======================================================

const estilos = StyleSheet.create({

  // ====================================================
  // CONTAINER
  // ====================================================

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


  // ====================================================
  // ANIVERSÁRIO
  // ====================================================

  aniversario: {
    backgroundColor: '#1C1C1C',
    borderWidth: 2,
    borderColor: '#D4AF37',
    borderRadius: 12,
    padding: 15,
    marginTop: 15,
    marginBottom: 5,
    alignItems: 'center',
  },

  aniversarioTitulo: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
  },

  aniversarioTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    marginTop: 5,
  },


  // ====================================================
  // TEXTOS
  // ====================================================

  subtitulo: {
    color: '#FFFFFF',
    fontSize: 17,
    marginTop: 8,
    marginBottom: 15,
  },

  instrucao: {
    color: '#999999',
    fontSize: 15,
    marginBottom: 15,
  },


  // ====================================================
  // SERVIÇOS
  // ====================================================

  card: {
    backgroundColor: '#1C1C1C',
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
  },

  cardSelecionado: {
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: '#292929',
  },

  nome: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
  },

  preco: {
    color: '#D4AF37',
    fontSize: 15,
    marginTop: 8,
    fontWeight: 'bold',
  },


  // ====================================================
  // BARBEIROS
  // ====================================================

  listaBarbeiros: {
    paddingRight: 10,
    paddingBottom: 5,
  },

  cardBarbeiro: {
    backgroundColor: '#1C1C1C',

    // Aumentamos bastante a largura
    width: 170,

    // Altura suficiente para nomes maiores
    minHeight: 72,

    paddingHorizontal: 15,
    paddingVertical: 14,

    borderRadius: 12,

    marginRight: 12,
    marginBottom: 5,

    alignItems: 'center',
    justifyContent: 'center',
  },

  nomeBarbeiro: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: 'bold',
    textAlign: 'center',

    // Impede o texto de ultrapassar o card
    flexShrink: 1,
  },

  semBarbeiros: {
    color: '#999999',
    fontSize: 15,
    marginBottom: 15,
  },


  // ====================================================
  // DATAS
  // ====================================================

  datas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },

  data: {
    backgroundColor: '#1C1C1C',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginRight: 10,
    marginBottom: 10,
    alignItems: 'center',
    minWidth: 75,
  },

  dataSelecionada: {
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: '#292929',
  },

  dataTexto: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: 'bold',
  },

  anoTexto: {
    color: '#777777',
    fontSize: 11,
    marginTop: 3,
  },


  // ====================================================
  // HORÁRIOS
  // ====================================================

  linhaHorarios: {
    justifyContent: 'space-between',
  },

  horario: {
    backgroundColor: '#1C1C1C',
    padding: 16,
    borderRadius: 10,
    marginBottom: 10,

    // Cada horário ocupa aproximadamente metade da tela
    width: '48%',

    alignItems: 'center',
    justifyContent: 'center',
  },

  horarioSelecionado: {
    borderWidth: 2,
    borderColor: '#D4AF37',
    backgroundColor: '#292929',
  },

  horarioTexto: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },

  semHorarios: {
    color: '#999999',
    fontSize: 16,
    marginTop: 10,
    marginBottom: 15,
  },


  // ====================================================
  // BOTÃO CONFIRMAR
  // ====================================================

  botaoConfirmar: {
    backgroundColor: '#D4AF37',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 10,
    alignItems: 'center',
  },

  botaoDesativado: {
    opacity: 0.5,
  },

  textoBotaoConfirmar: {
    color: '#111111',
    fontSize: 16,
    fontWeight: 'bold',
  },

});