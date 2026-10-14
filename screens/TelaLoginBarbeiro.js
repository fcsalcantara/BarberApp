import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import {
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';

import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

import {
  autenticacao,
  bancoDeDados,
} from '../firebase';


// ========================================
// TELA DE LOGIN DO BARBEIRO
// ========================================

export default function TelaLoginBarbeiro({ navigation }) {

  // Guarda o e-mail digitado
  const [email, setEmail] = useState('');

  // Guarda a senha digitada
  const [senha, setSenha] = useState('');

  // Indica se o login está sendo realizado
  const [carregando, setCarregando] = useState(false);


  // ========================================
  // REALIZA O LOGIN
  // ========================================

  const realizarLogin = async () => {

    // Verifica se os campos foram preenchidos
    if (!email || !senha) {

      Alert.alert(
        'Atenção',
        'Digite seu e-mail e sua senha.'
      );

      return;
    }


    try {

      setCarregando(true);


      // ========================================
      // LOGIN PELO FIREBASE AUTHENTICATION
      // ========================================

      const resultado =
        await signInWithEmailAndPassword(
          autenticacao,
          email.trim(),
          senha
        );


      // Pega o usuário que acabou de entrar
      const usuario = resultado.user;


      // ========================================
      // BUSCA O BARBEIRO NA COLEÇÃO "barbeiros"
      // ========================================

      const consulta = query(
        collection(
          bancoDeDados,
          'barbeiros'
        ),
        where(
          'email',
          '==',
          usuario.email
        ),
        where(
          'ativo',
          '==',
          true
        )
      );


      const resultadoBarbeiro =
        await getDocs(consulta);


      // ========================================
      // VERIFICA SE O BARBEIRO FOI ENCONTRADO
      // ========================================

      if (resultadoBarbeiro.empty) {

        await signOut(autenticacao);

        Alert.alert(
          'Acesso negado',
          'Perfil de barbeiro não encontrado ou está inativo.'
        );

        return;
      }


      // Pega o primeiro documento encontrado
      const documentoBarbeiro =
        resultadoBarbeiro.docs[0];


      // Dados do barbeiro
      const dadosBarbeiro =
        documentoBarbeiro.data();


      console.log(
        'Barbeiro encontrado:',
        dadosBarbeiro
      );


      // ========================================
      // LOGIN AUTORIZADO
      // ========================================

      navigation.navigate(
        'GestaoBarbeiro'
      );

    } catch (erro) {

      console.log(
        'Erro no login do barbeiro:',
        erro
      );


      Alert.alert(
        'Erro no login',
        'E-mail ou senha incorretos.'
      );

    } finally {

      setCarregando(false);

    }
  };


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
          LOGO
      ======================================== */}

      <Text style={estilos.logo}>
        BARBERAPP
      </Text>


      {/* ========================================
          TÍTULO
      ======================================== */}

      <Text style={estilos.titulo}>
        Acesso da Barbearia
      </Text>

      <Text style={estilos.subtitulo}>
        Área exclusiva para gestão
      </Text>


      {/* ========================================
          ÁREA DE LOGIN
      ======================================== */}

      <View style={estilos.card}>

        {/* E-mail */}

        <Text style={estilos.label}>
          E-mail
        </Text>

        <TextInput
          style={estilos.input}
          placeholder="Digite seu e-mail"
          placeholderTextColor="#888"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />


        {/* Senha */}

        <Text style={estilos.label}>
          Senha
        </Text>

        <TextInput
          style={estilos.input}
          placeholder="Digite sua senha"
          placeholderTextColor="#888"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
        />


        {/* ========================================
            BOTÃO DE ENTRAR
        ======================================== */}

        <TouchableOpacity
          style={estilos.botao}
          onPress={realizarLogin}
          disabled={carregando}
        >

          <Text style={estilos.textoBotao}>
            {carregando
              ? 'ENTRANDO...'
              : 'ENTRAR NA GESTÃO'}
          </Text>

        </TouchableOpacity>


        {/* Informação sobre o Firebase */}

        <Text style={estilos.protegido}>
          Acesso protegido pelo Firebase
        </Text>

      </View>

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


  // Botão voltar
  voltar: {
    color: '#D4AF37',
    fontSize: 16,
    marginBottom: 30,
  },


  // Logo
  logo: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },


  // Título
  titulo: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
  },


  // Subtítulo
  subtitulo: {
    color: '#999999',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },


  // Cartão de login
  card: {
    backgroundColor: '#1C1C1C',
    borderRadius: 16,
    padding: 20,
  },


  // Nome dos campos
  label: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },


  // Campos de entrada
  input: {
    backgroundColor: '#292929',
    color: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
  },


  // Botão de entrar
  botao: {
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },


  // Texto do botão
  textoBotao: {
    color: '#111111',
    fontWeight: 'bold',
  },


  // Texto de proteção
  protegido: {
    color: '#777777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
  },

});