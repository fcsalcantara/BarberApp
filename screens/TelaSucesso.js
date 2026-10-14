import React, { useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';

// Configuração das notificações
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function TelaSucesso({ navigation }) {

  // Executa quando a tela é aberta
  useEffect(() => {
    realizarVibracao();
    enviarNotificacao();
  }, []);

  // Vibração de sucesso
  async function realizarVibracao() {
    await Haptics.notificationAsync(
      Haptics.NotificationFeedbackType.Success
    );
  }

  // Envia a notificação do agendamento
  async function enviarNotificacao() {
    try {
      const permissao =
        await Notifications.requestPermissionsAsync();

      if (permissao.status !== 'granted') {
        return;
      }

      // Cria o canal de notificações
      await Notifications.setNotificationChannelAsync(
        'agendamentos',
        {
          name: 'Agendamentos',
          importance:
            Notifications.AndroidImportance.HIGH,
        }
      );

      // Envia a notificação
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '💈 BarberApp',
          body:
            'Seu agendamento foi realizado com sucesso!',
        },
        trigger: null,
      });

    } catch (erro) {
      console.log(
        'Erro ao enviar notificação:',
        erro
      );
    }
  }

  // Volta diretamente para a Área do Cliente
  function voltarParaTelaInicial() {
    navigation.reset({
      index: 0,
      routes: [
        {
          name: 'ClientHome',
        },
      ],
    });
  }

  return (
    <View style={estilos.container}>

      {/* Ícone de sucesso */}
      <Text style={estilos.icone}>
        ✓
      </Text>

      {/* Mensagem principal */}
      <Text style={estilos.titulo}>
        Agendamento realizado!
      </Text>

      <Text style={estilos.subtitulo}>
        Seu horário foi reservado com sucesso.
      </Text>

      {/* Botão para voltar à tela inicial */}
      <TouchableOpacity
        style={estilos.botao}
        onPress={voltarParaTelaInicial}
      >
        <Text style={estilos.textoBotao}>
          🏠 Voltar para tela inicial
        </Text>
      </TouchableOpacity>

    </View>
  );
}

// Estilos da tela
const estilos = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111111',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },

  icone: {
    color: '#D4AF37',
    fontSize: 60,
    fontWeight: 'bold',
  },

  titulo: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
  },

  subtitulo: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 30,
  },

  botao: {
    backgroundColor: '#D4AF37',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 30,
    marginTop: 10,
  },

  textoBotao: {
    color: '#111111',
    fontSize: 16,
    fontWeight: 'bold',
  },
});