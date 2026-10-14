import React, {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
} from 'react-native';

import {
  CameraView,
  useCameraPermissions,
} from 'expo-camera';

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';

import {
  bancoDeDados,
  autenticacao,
} from '../firebase';


// ========================================
// TELA DE PERFIL
// ========================================

export default function TelaPerfil({ navigation }) {

  // ========================================
  // DADOS DO USUÁRIO
  // ========================================

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [dataNascimento, setDataNascimento] = useState('');
  const [foto, setFoto] = useState(null);


  // ========================================
  // CONTROLE DA CÂMERA
  // ========================================

  const [
    permissaoCamera,
    solicitarPermissaoCamera,
  ] = useCameraPermissions();

  const [mostrarCamera, setMostrarCamera] =
    useState(false);

  const cameraRef = useRef(null);


  // ========================================
  // FORMATAR DATA DE NASCIMENTO
  // ========================================

  function formatarDataNascimento(texto) {

    // Remove caracteres que não são números
    let numeros = texto.replace(/\D/g, '');

    // Permite no máximo 8 números
    numeros = numeros.substring(0, 8);


    // Adiciona a primeira barra
    if (numeros.length > 2) {

      numeros =
        numeros.substring(0, 2) +
        '/' +
        numeros.substring(2);
    }


    // Adiciona a segunda barra
    if (numeros.length > 5) {

      numeros =
        numeros.substring(0, 5) +
        '/' +
        numeros.substring(5);
    }


    setDataNascimento(numeros);
  }


  // ========================================
  // CARREGAR PERFIL
  // ========================================

  useEffect(() => {

    async function carregarPerfil() {

      try {

        // Usuário atualmente logado
        const usuarioLogado =
          autenticacao.currentUser;


        // ========================================
        // BUSCAR NO FIRESTORE
        // ========================================

        if (usuarioLogado) {

          const referenciaUsuario = doc(
            bancoDeDados,
            'usuarios',
            usuarioLogado.uid
          );


          const documentoUsuario =
            await getDoc(referenciaUsuario);


          if (documentoUsuario.exists()) {

            const perfil =
              documentoUsuario.data();


            setNome(
              perfil.nome || ''
            );

            setEmail(
              perfil.email || ''
            );

            setCelular(
              perfil.celular || ''
            );

            setDataNascimento(
              perfil.dataNascimento || ''
            );

            setFoto(
              perfil.foto || null
            );


            // Perfil encontrado no Firebase
            return;
          }
        }


        // ========================================
        // BUSCAR NO ASYNCSTORAGE
        // ========================================

        const dadosSalvos =
          await AsyncStorage.getItem(
            'perfilUsuario'
          );


        if (dadosSalvos) {

          const perfil =
            JSON.parse(dadosSalvos);


          setNome(
            perfil.nome || ''
          );

          setEmail(
            perfil.email || ''
          );

          setCelular(
            perfil.celular || ''
          );

          setDataNascimento(
            perfil.dataNascimento || ''
          );

          setFoto(
            perfil.foto || null
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
  // TIRAR FOTO
  // ========================================

  async function tirarFoto() {

    if (!cameraRef.current) {
      return;
    }


    try {

      const fotoTirada =
        await cameraRef.current.takePictureAsync();


      setFoto(
        fotoTirada.uri
      );


      // Fecha a câmera
      setMostrarCamera(false);

    } catch (erro) {

      console.log(
        'Erro ao tirar foto:',
        erro
      );


      Alert.alert(
        'Erro',
        'Não foi possível tirar a foto.'
      );
    }
  }


  // ========================================
  // SALVAR PERFIL
  // ========================================

  async function salvarPerfil() {

    try {

      const perfil = {
        nome,
        email,
        celular,
        dataNascimento,
        foto,
      };


      // ========================================
      // SALVAR NO ASYNCSTORAGE
      // ========================================

      await AsyncStorage.setItem(
        'perfilUsuario',
        JSON.stringify(perfil)
      );


      // ========================================
      // USUÁRIO LOGADO
      // ========================================

      const usuarioLogado =
        autenticacao.currentUser;


      // ========================================
      // SALVAR NO FIRESTORE
      // ========================================

      if (usuarioLogado) {

        await setDoc(
          doc(
            bancoDeDados,
            'usuarios',
            usuarioLogado.uid
          ),
          perfil
        );
      }


      // ========================================
      // CONFIRMAÇÃO
      // ========================================

      Alert.alert(
        'Perfil salvo',
        'Seus dados foram salvos com sucesso!'
      );

    } catch (erro) {

      console.log(
        'Erro ao salvar perfil:',
        erro
      );


      Alert.alert(
        'Erro',
        'Não foi possível salvar o perfil.'
      );
    }
  }


  // ========================================
  // ABRIR CÂMERA
  // ========================================

  async function abrirCamera() {

    try {

      const resultado =
        await solicitarPermissaoCamera();


      if (resultado.granted) {

        setMostrarCamera(true);

      } else {

        Alert.alert(
          'Permissão necessária',
          'É necessário permitir o acesso à câmera.'
        );
      }

    } catch (erro) {

      console.log(
        'Erro ao solicitar câmera:',
        erro
      );
    }
  }


  // ========================================
  // TELA DA CÂMERA
  // ========================================

  if (mostrarCamera) {

    return (
      <View style={estilos.telaCamera}>

        <CameraView
          ref={cameraRef}
          style={estilos.camera}
          facing="front"
        />


        {/* TIRAR FOTO */}

        <TouchableOpacity
          style={estilos.botaoTirarFoto}
          onPress={tirarFoto}
        >

          <Text style={estilos.textoBotaoTirarFoto}>
            📸 Tirar foto
          </Text>

        </TouchableOpacity>


        {/* FECHAR CÂMERA */}

        <TouchableOpacity
          style={estilos.botaoFecharCamera}
          onPress={() =>
            setMostrarCamera(false)
          }
        >

          <Text style={estilos.textoBotaoFechar}>
            ← Voltar para o perfil
          </Text>

        </TouchableOpacity>

      </View>
    );
  }


  // ========================================
  // TELA PRINCIPAL DO PERFIL
  // ========================================

  return (
    <ScrollView
      style={estilos.container}
      contentContainerStyle={estilos.conteudo}
    >

      {/* VOLTAR */}

      <TouchableOpacity
        onPress={() => navigation.goBack()}
      >

        <Text style={estilos.voltar}>
          ← Voltar
        </Text>

      </TouchableOpacity>


      {/* TÍTULO */}

      <Text style={estilos.titulo}>
        Meu Perfil
      </Text>


      {/* ========================================
          FOTO DE PERFIL
      ======================================== */}

      {foto && (

        <Image
          source={{ uri: foto }}
          style={estilos.fotoPerfil}
        />

      )}


      {/* ========================================
          NOME
      ======================================== */}

      <Text style={estilos.rotulo}>
        Nome
      </Text>

      <TextInput
        style={estilos.entrada}
        placeholder="Digite seu nome"
        placeholderTextColor="#777777"
        value={nome}
        onChangeText={setNome}
      />


      {/* ========================================
          E-MAIL
      ======================================== */}

      <Text style={estilos.rotulo}>
        E-mail
      </Text>

      <TextInput
        style={estilos.entrada}
        placeholder="Digite seu e-mail"
        placeholderTextColor="#777777"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />


      {/* ========================================
          CELULAR
      ======================================== */}

      <Text style={estilos.rotulo}>
        Celular
      </Text>

      <TextInput
        style={estilos.entrada}
        placeholder="Digite seu celular"
        placeholderTextColor="#777777"
        value={celular}
        onChangeText={setCelular}
        keyboardType="phone-pad"
      />


      {/* ========================================
          DATA DE NASCIMENTO
      ======================================== */}

      <Text style={estilos.rotulo}>
        Data de nascimento
      </Text>

      <TextInput
        style={estilos.entrada}
        placeholder="DD/MM/AAAA"
        placeholderTextColor="#777777"
        value={dataNascimento}
        onChangeText={formatarDataNascimento}
        keyboardType="number-pad"
        maxLength={10}
      />


      {/* ========================================
          BOTÃO DA CÂMERA
      ======================================== */}

      <TouchableOpacity
        style={estilos.botaoCamera}
        onPress={abrirCamera}
      >

        <Text style={estilos.textoBotaoCamera}>
          📷 Tirar foto de perfil
        </Text>

      </TouchableOpacity>


      {/* ========================================
          BOTÃO SALVAR
      ======================================== */}

      <TouchableOpacity
        style={estilos.botaoSalvar}
        onPress={salvarPerfil}
      >

        <Text style={estilos.textoBotaoSalvar}>
          💾 Salvar perfil
        </Text>

      </TouchableOpacity>

    </ScrollView>
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

  conteudo: {
    paddingBottom: 40,
  },

  voltar: {
    color: '#D4AF37',
    fontSize: 16,
    marginTop: 45,
    marginBottom: 40,
  },

  titulo: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  fotoPerfil: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignSelf: 'center',
    marginTop: 20,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#D4AF37',
  },

  rotulo: {
    color: '#FFFFFF',
    fontSize: 14,
    marginTop: 30,
    marginBottom: 8,
  },

  entrada: {
    backgroundColor: '#1C1C1C',
    color: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: '#333333',
    fontSize: 16,
  },

  botaoCamera: {
    backgroundColor: '#1C1C1C',
    borderRadius: 10,
    padding: 15,
    marginTop: 25,
    borderWidth: 1,
    borderColor: '#D4AF37',
    alignItems: 'center',
  },

  textoBotaoCamera: {
    color: '#D4AF37',
    fontSize: 16,
    fontWeight: 'bold',
  },

  botaoSalvar: {
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    padding: 16,
    marginTop: 15,
    alignItems: 'center',
  },

  textoBotaoSalvar: {
    color: '#111111',
    fontSize: 16,
    fontWeight: 'bold',
  },


  // ========================================
  // CÂMERA
  // ========================================

  telaCamera: {
    flex: 1,
    backgroundColor: '#000000',
  },

  camera: {
    flex: 1,
  },

  botaoTirarFoto: {
    position: 'absolute',
    bottom: 110,
    left: 24,
    right: 24,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  textoBotaoTirarFoto: {
    color: '#111111',
    fontSize: 16,
    fontWeight: 'bold',
  },

  botaoFecharCamera: {
    position: 'absolute',
    bottom: 40,
    left: 24,
    right: 24,
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },

  textoBotaoFechar: {
    color: '#111111',
    fontSize: 16,
    fontWeight: 'bold',
  },

});