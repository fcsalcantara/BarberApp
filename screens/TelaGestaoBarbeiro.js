import React from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';


// ========================================
// TELA DE GESTÃO DA BARBEARIA
// ========================================

export default function TelaGestaoBarbeiro({ navigation }) {

  return (
    <View style={estilos.container}>

      {/* ========================================
          TÍTULO DA TELA
      ======================================== */}

      <Text style={estilos.titulo}>
        Área da Barbearia
      </Text>

      <Text style={estilos.subtitulo}>
        Gestão dos barbeiros
      </Text>


      {/* ========================================
          HORÁRIOS DISPONÍVEIS
      ======================================== */}

      <TouchableOpacity
        style={estilos.botao}
        onPress={() =>
          navigation.navigate('HorariosBarbeiro')
        }
      >

        <Text style={estilos.icone}>
          🕐
        </Text>

        <View>

          <Text style={estilos.tituloBotao}>
            Horários Disponíveis
          </Text>

          <Text style={estilos.textoBotao}>
            Cadastre os horários de atendimento
          </Text>

        </View>

      </TouchableOpacity>


      {/* ========================================
          MINHA AGENDA
      ======================================== */}

      <TouchableOpacity
        style={estilos.botao}
        onPress={() =>
          navigation.navigate('AgendaBarbeiro')
        }
      >

        <Text style={estilos.icone}>
          📅
        </Text>

        <View>

          <Text style={estilos.tituloBotao}>
            Minha Agenda
          </Text>

          <Text style={estilos.textoBotao}>
            Veja os agendamentos dos clientes
          </Text>

        </View>

      </TouchableOpacity>


      {/* ========================================
          MEU PERFIL
      ======================================== */}

      <TouchableOpacity
        style={estilos.botao}
      >

        <Text style={estilos.icone}>
          👤
        </Text>

        <View>

          <Text style={estilos.tituloBotao}>
            Meu Perfil
          </Text>

          <Text style={estilos.textoBotao}>
            Consulte seus dados
          </Text>

        </View>

      </TouchableOpacity>


      {/* ========================================
          ENCERRAR SESSÃO
      ======================================== */}

      <TouchableOpacity
        style={estilos.botaoSair}

        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [{ name: 'Login' }],
          })
        }
      >

        <Text style={estilos.textoSair}>
          🚪 Encerrar sessão
        </Text>

      </TouchableOpacity>

    </View>
  );
}


// ========================================
// ESTILOS DA TELA
// ========================================

const estilos = StyleSheet.create({

  // Tela principal
  container: {
    flex: 1,
    backgroundColor: '#111111',
    padding: 24,
    justifyContent: 'center',
  },


  // Título principal
  titulo: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },


  // Texto abaixo do título
  subtitulo: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },


  // Botões principais
  botao: {
    backgroundColor: '#1C1C1C',
    borderRadius: 12,
    padding: 18,
    marginTop: 15,

    flexDirection: 'row',
    alignItems: 'center',

    borderWidth: 1,
    borderColor: '#333333',
  },


  // Ícone dos botões
  icone: {
    fontSize: 28,
    marginRight: 15,
  },


  // Título dentro dos botões
  tituloBotao: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },


  // Descrição dentro dos botões
  textoBotao: {
    color: '#777777',
    fontSize: 12,
    marginTop: 5,
  },


  // Botão de encerrar sessão
  botaoSair: {
    marginTop: 25,
    padding: 15,
    alignItems: 'center',
  },


  // Texto de encerrar sessão
  textoSair: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },

});