import React, { useState } from 'react';

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';

import { signInWithEmailAndPassword } from 'firebase/auth';

import { autenticacao } from '../firebase';


export default function TelaLogin({ navigation }) {

  // Dados digitados pelo usuário
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  // Controla o processo de login
  const [carregando, setCarregando] = useState(false);


  // ========================================
  // REALIZA O LOGIN PELO FIREBASE
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

      // Tenta realizar o login no Firebase
      await signInWithEmailAndPassword(
        autenticacao,
        email.trim(),
        senha
      );

      // Login realizado com sucesso
      navigation.navigate('ClientHome');

    } catch (erro) {

      console.log('Erro no login:', erro);

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

      <Text style={estilos.logo}>
        BARBERAPP
      </Text>

      <Text style={estilos.titulo}>
        Bem-vindo
      </Text>

      <Text style={estilos.subtitulo}>
        Entre para agendar seu corte
      </Text>


      <View style={estilos.card}>

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


        <TouchableOpacity
          style={estilos.botao}
          onPress={realizarLogin}
          disabled={carregando}
        >

          <Text style={estilos.textoBotao}>
            {carregando
              ? 'ENTRANDO...'
              : 'ENTRAR COM SEGURANÇA'}
          </Text>

        </TouchableOpacity>


        <Text style={estilos.protegido}>
          Login protegido pelo Firebase
        </Text>

      </View>


      {/* Acesso exclusivo do barbeiro */}

      <TouchableOpacity
        style={estilos.acessoBarbeiro}
        onPress={() => navigation.navigate('BarberLogin')}
      >

        <Text style={estilos.cadeado}>
          🔒
        </Text>

        <View>

          <Text style={estilos.tituloBarbeiro}>
            Acesso da barbearia
          </Text>

          <Text style={estilos.subtituloBarbeiro}>
            Área exclusiva para gestão
          </Text>

        </View>

      </TouchableOpacity>

    </View>
  );
}


const estilos = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#111111',
    padding: 24,
    justifyContent: 'center',
  },

  logo: {
    color: '#D4AF37',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },

  titulo: {
    color: '#FFFFFF',
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
  },

  subtitulo: {
    color: '#999999',
    fontSize: 15,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 30,
  },

  card: {
    backgroundColor: '#1C1C1C',
    borderRadius: 16,
    padding: 20,
  },

  label: {
    color: '#FFFFFF',
    fontSize: 14,
    marginBottom: 8,
  },

  input: {
    backgroundColor: '#292929',
    color: '#FFFFFF',
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
  },

  botao: {
    backgroundColor: '#D4AF37',
    borderRadius: 10,
    padding: 16,
    alignItems: 'center',
  },

  textoBotao: {
    color: '#111111',
    fontWeight: 'bold',
  },

  protegido: {
    color: '#777777',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 14,
  },

  acessoBarbeiro: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 30,
    padding: 16,
    borderWidth: 1,
    borderColor: '#333333',
    borderRadius: 12,
  },

  cadeado: {
    fontSize: 22,
    marginRight: 12,
  },

  tituloBarbeiro: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  subtituloBarbeiro: {
    color: '#777777',
    marginTop: 4,
    fontSize: 12,
  },

});