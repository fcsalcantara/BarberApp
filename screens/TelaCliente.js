import React, {
  useEffect,
  useState,
} from 'react';

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Image,
  Alert,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import * as Location from 'expo-location';

import {
  doc,
  getDoc,
} from 'firebase/firestore';

import {
  bancoDeDados,
  autenticacao,
} from '../firebase';


// ========================================
// TELA ÁREA DO CLIENTE
// ========================================

export default function TelaCliente({ navigation }) {

  // ========================================
  // DADOS DO CLIENTE
  // ========================================

  const [foto, setFoto] = useState(null);

  const [
    hojeEAniversario,
    setHojeEAniversario,
  ] = useState(false);


  // ========================================
  // VERIFICAR ANIVERSÁRIO
  // ========================================

  function verificarAniversario(data) {

    if (!data) {
      return false;
    }

    const partes = data.split('/');

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


  // ========================================
  // CARREGAR PERFIL
  // ========================================

  useEffect(() => {

    async function carregarPerfil() {

      try {

        let perfil = null;

        const usuarioLogado =
          autenticacao.currentUser;


        // ========================================
        // BUSCAR PERFIL NO FIREBASE
        // ========================================

        if (usuarioLogado) {

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

            perfil =
              documentoUsuario.data();
          }
        }


        // ========================================
        // BUSCAR PERFIL NO ASYNCSTORAGE
        // ========================================

        if (!perfil) {

          const dadosSalvos =
            await AsyncStorage.getItem(
              'perfilUsuario'
            );

          if (dadosSalvos) {

            perfil =
              JSON.parse(dadosSalvos);
          }
        }


        // ========================================
        // CARREGAR DADOS DO PERFIL
        // ========================================

        if (perfil) {

          setFoto(
            perfil.foto || null
          );

          const aniversario =
            verificarAniversario(
              perfil.dataNascimento
            );

          setHojeEAniversario(
            aniversario
          );
        }

      } catch (erro) {

        console.log(
          'Erro ao carregar perfil:',
          erro
        );
      }
    }

    carregarPerfil();

  }, []);


  // ========================================
  // ABRIR WHATSAPP
  // ========================================

  async function abrirWhatsApp() {

    const numero =
      '5521998031031';

    const mensagem =
      'Olá! Gostaria de agendar um horário na barbearia.';

    const url =
      `https://wa.me/${numero}?text=${encodeURIComponent(
        mensagem
      )}`;

    try {

      await Linking.openURL(url);

    } catch (erro) {

      Alert.alert(
        'Erro',
        'Não foi possível abrir o WhatsApp.'
      );
    }
  }


  // ========================================
  // ABRIR LOCALIZAÇÃO COM GPS
  // ========================================

  async function abrirLocalizacao() {

    try {

      // ========================================
      // PEDIR PERMISSÃO DE LOCALIZAÇÃO
      // ========================================

      const {
        status,
      } =
        await Location.requestForegroundPermissionsAsync();


      // ========================================
      // VERIFICAR PERMISSÃO
      // ========================================

      if (status !== 'granted') {

        Alert.alert(
          'Permissão necessária',
          'Precisamos da sua localização para abrir o mapa.'
        );

        return;
      }


      // ========================================
      // OBTER LOCALIZAÇÃO ATUAL
      // ========================================

      const localizacao =
        await Location.getCurrentPositionAsync({
          accuracy:
            Location.Accuracy.Balanced,
        });


      const latitudeAtual =
        localizacao.coords.latitude;

      const longitudeAtual =
        localizacao.coords.longitude;


      // ========================================
      // DESTINO DA BARBEARIA
      // ========================================

      const latitudeBarbearia =
        -22.7608;

      const longitudeBarbearia =
        -43.3964;


      // ========================================
      // ABRIR GOOGLE MAPS
      // ========================================

      const url =
        `https://www.google.com/maps/dir/?api=1` +
        `&origin=${latitudeAtual},${longitudeAtual}` +
        `&destination=${latitudeBarbearia},${longitudeBarbearia}` +
        `&travelmode=driving`;


      await Linking.openURL(url);

    } catch (erro) {

      console.log(
        'Erro ao obter localização:',
        erro
      );

      Alert.alert(
        'Erro',
        'Não foi possível obter sua localização.'
      );
    }
  }


  // ========================================
  // INTERFACE
  // ========================================

  return (
    <View style={estilos.container}>

      {/* ========================================
          ENCERRAR SESSÃO
      ======================================== */}

      <TouchableOpacity
        style={estilos.botaoEncerrar}
        onPress={() =>
          navigation.reset({
            index: 0,
            routes: [
              {
                name: 'Login',
              },
            ],
          })
        }
      >

        <Text style={estilos.iconeEncerrar}>
          🚪
        </Text>

        <Text style={estilos.textoEncerrar}>
          Encerrar sessão
        </Text>

      </TouchableOpacity>


      {/* ========================================
          PERFIL
      ======================================== */}

      <TouchableOpacity
        style={estilos.perfil}
        onPress={() =>
          navigation.navigate('Perfil')
        }
      >

        {foto ? (

          <Image
            source={{
              uri: foto,
            }}
            style={estilos.fotoPequena}
          />

        ) : (

          <Text style={estilos.iconePerfil}>
            👤
          </Text>

        )}

      </TouchableOpacity>


      {/* ========================================
          TÍTULO
      ======================================== */}

      <Text style={estilos.titulo}>
        Área do Cliente
      </Text>

      <Text style={estilos.subtitulo}>
        O que você deseja fazer?
      </Text>


      {/* ========================================
          ANIVERSÁRIO
      ======================================== */}

      {hojeEAniversario && (

        <View
          style={estilos.caixaAniversario}
        >

          <Text
            style={estilos.mensagemAniversario}
          >
            🎂 Feliz aniversário!
          </Text>

          <Text
            style={estilos.textoAniversario}
          >
            Seu corte é gratuito hoje!
          </Text>

        </View>

      )}


      {/* ========================================
          AGENDAR CORTE
      ======================================== */}

      <TouchableOpacity
        style={estilos.botao}
        onPress={() =>
          navigation.navigate(
            'Agendamento'
          )
        }
      >

        <Text style={estilos.iconeBotao}>
          ✂️
        </Text>

        <View>

          <Text style={estilos.tituloBotao}>
            Agendar Corte
          </Text>

          <Text style={estilos.subtituloBotao}>
            Escolha serviço, barbeiro e horário
          </Text>

        </View>

      </TouchableOpacity>


      {/* ========================================
          MINHAS MARCAÇÕES
      ======================================== */}

      <TouchableOpacity
        style={estilos.botao}
        onPress={() =>
          navigation.navigate(
            'Marcacoes'
          )
        }
      >

        <Text style={estilos.iconeBotao}>
          📅
        </Text>

        <View>

          <Text style={estilos.tituloBotao}>
            Minhas Marcações
          </Text>

          <Text style={estilos.subtituloBotao}>
            Consulte seus agendamentos
          </Text>

        </View>

      </TouchableOpacity>


      {/* ========================================
          WHATSAPP
      ======================================== */}

      <TouchableOpacity
        style={estilos.botao}
        onPress={abrirWhatsApp}
      >

        <Text style={estilos.iconeBotao}>
          💬
        </Text>

        <View>

          <Text style={estilos.tituloBotao}>
            Falar pelo WhatsApp
          </Text>

          <Text style={estilos.subtituloBotao}>
            Entre em contato com a barbearia
          </Text>

        </View>

      </TouchableOpacity>


      {/* ========================================
          LOCALIZAÇÃO / GPS
      ======================================== */}

      <TouchableOpacity
        style={estilos.botao}
        onPress={abrirLocalizacao}
      >

        <Text style={estilos.iconeBotao}>
          📍
        </Text>

        <View>

          <Text style={estilos.tituloBotao}>
            Localização da Barbearia
          </Text>

          <Text style={estilos.subtituloBotao}>
            Veja onde estamos
          </Text>

        </View>

      </TouchableOpacity>

    </View>
  );
}


// ========================================
// ESTILOS
// ========================================

const estilos = StyleSheet.create({

  // ========================================
  // CONTAINER
  // ========================================

  container: {
    flex: 1,
    backgroundColor: '#111111',
    padding: 24,
    justifyContent: 'center',
  },


  // ========================================
  // ENCERRAR SESSÃO
  // ========================================

  botaoEncerrar: {
    position: 'absolute',
    top: 45,
    left: 24,

    flexDirection: 'row',
    alignItems: 'center',

    backgroundColor: '#1C1C1C',

    borderWidth: 2,
    borderColor: '#D4AF37',

    borderRadius: 30,

    paddingVertical: 12,
    paddingHorizontal: 18,

    zIndex: 20,
    elevation: 10,
  },

  iconeEncerrar: {
    fontSize: 21,
    marginRight: 9,
  },

  textoEncerrar: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },


  // ========================================
  // TÍTULO
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
    marginBottom: 20,
  },


  // ========================================
  // ANIVERSÁRIO
  // ========================================

  caixaAniversario: {
    backgroundColor: '#1C1C1C',

    borderWidth: 2,
    borderColor: '#D4AF37',

    borderRadius: 12,

    padding: 15,

    marginBottom: 5,

    alignItems: 'center',
  },

  mensagemAniversario: {
    color: '#D4AF37',
    fontSize: 18,
    fontWeight: 'bold',
  },

  textoAniversario: {
    color: '#FFFFFF',
    fontSize: 15,
    marginTop: 5,
  },


  // ========================================
  // BOTÕES
  // ========================================

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

  iconeBotao: {
    fontSize: 28,
    marginRight: 15,
  },

  tituloBotao: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },

  subtituloBotao: {
    color: '#777777',
    fontSize: 12,
    marginTop: 5,
  },


  // ========================================
  // PERFIL
  // ========================================

  perfil: {
    position: 'absolute',

    top: 45,
    right: 24,

    width: 50,
    height: 50,

    borderRadius: 25,

    backgroundColor: '#1C1C1C',

    borderWidth: 1,
    borderColor: '#D4AF37',

    alignItems: 'center',
    justifyContent: 'center',

    zIndex: 10,
    elevation: 10,
  },

  iconePerfil: {
    fontSize: 24,
  },

  fotoPequena: {
    width: 46,
    height: 46,

    borderRadius: 23,

    borderWidth: 1,
    borderColor: '#D4AF37',
  },

});