import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';


// ========================================
// TELAS DO APLICATIVO
// ========================================

import TelaLogin from './screens/TelaLogin';
import TelaCliente from './screens/TelaCliente';
import TelaLoginBarbeiro from './screens/TelaLoginBarbeiro';
import TelaAgendamento from './screens/TelaAgendamento';
import TelaSucesso from './screens/TelaSucesso';
import TelaMarcacoes from './screens/TelaMarcacoes';
import TelaPerfil from './screens/TelaPerfil';
import TelaGestaoBarbeiro from './screens/TelaGestaoBarbeiro';
import TelaHorariosBarbeiro from './screens/TelaHorariosBarbeiro';
import TelaAgendaBarbeiro from './screens/TelaAgendaBarbeiro';


// ========================================
// CRIAÇÃO DO NAVEGADOR
// ========================================

const Stack = createNativeStackNavigator();


// ========================================
// APLICATIVO PRINCIPAL
// ========================================

export default function App() {

  return (
    <NavigationContainer>

      {/* ========================================
          CONFIGURAÇÃO DA NAVEGAÇÃO
      ======================================== */}

      <Stack.Navigator
        initialRouteName="Login"

        screenOptions={{
          // Remove o cabeçalho padrão
          headerShown: false,
        }}
      >


        {/* ========================================
            LOGIN DO CLIENTE
        ======================================== */}

        <Stack.Screen
          name="Login"
          component={TelaLogin}
        />


        {/* ========================================
            ÁREA DO CLIENTE
        ======================================== */}

        <Stack.Screen
          name="ClientHome"
          component={TelaCliente}
        />


        {/* ========================================
            LOGIN DO BARBEIRO
        ======================================== */}

        <Stack.Screen
          name="BarberLogin"
          component={TelaLoginBarbeiro}
        />


        {/* ========================================
            AGENDAMENTO
        ======================================== */}

        <Stack.Screen
          name="Agendamento"
          component={TelaAgendamento}
        />


        {/* ========================================
            SUCESSO DO AGENDAMENTO
        ======================================== */}

        <Stack.Screen
          name="Sucesso"
          component={TelaSucesso}
        />


        {/* ========================================
            MINHAS MARCAÇÕES
        ======================================== */}

        <Stack.Screen
          name="Marcacoes"
          component={TelaMarcacoes}
        />


        {/* ========================================
            PERFIL DO CLIENTE
        ======================================== */}

        <Stack.Screen
          name="Perfil"
          component={TelaPerfil}
        />


        {/* ========================================
            GESTÃO DA BARBEARIA
        ======================================== */}

        <Stack.Screen
          name="GestaoBarbeiro"
          component={TelaGestaoBarbeiro}
        />


        {/* ========================================
            HORÁRIOS DO BARBEIRO
        ======================================== */}

        <Stack.Screen
          name="HorariosBarbeiro"
          component={TelaHorariosBarbeiro}
        />


        {/* ========================================
            AGENDA DO BARBEIRO
        ======================================== */}

        <Stack.Screen
          name="AgendaBarbeiro"
          component={TelaAgendaBarbeiro}
        />

      </Stack.Navigator>

    </NavigationContainer>
  );
}