// ========================================
// CONFIGURAÇÃO DO FIREBASE
// ========================================

import { initializeApp } from 'firebase/app';

import {
  initializeAuth,
  getAuth,
  getReactNativePersistence,
} from 'firebase/auth';

import { getFirestore } from 'firebase/firestore';

import AsyncStorage from '@react-native-async-storage/async-storage';


// ========================================
// CONFIGURAÇÃO FORNECIDA PELO FIREBASE
// ========================================

const configuracaoFirebase = {
  apiKey: 'AIzaSyBlNldvKjD3lNv8gM9BjXjd5iBCsJDHwmA',
  authDomain: 'barberapp-b2fc0.firebaseapp.com',
  projectId: 'barberapp-b2fc0',
  storageBucket: 'barberapp-b2fc0.firebasestorage.app',
  messagingSenderId: '633943814658',
  appId: '1:633943814658:web:c4060880734f21df9e2d1b',
};


// ========================================
// INICIALIZA O FIREBASE
// ========================================

const aplicativoFirebase = initializeApp(
  configuracaoFirebase
);


// ========================================
// INICIALIZA O FIREBASE AUTHENTICATION
// ========================================

let autenticacao;

try {

  autenticacao = initializeAuth(
    aplicativoFirebase,
    {
      persistence: getReactNativePersistence(
        AsyncStorage
      ),
    }
  );

} catch (erro) {

  // Se o Firebase já estiver inicializado,
  // reutiliza a autenticação existente.

  autenticacao = getAuth(
    aplicativoFirebase
  );

}


// ========================================
// INICIALIZA O FIRESTORE
// ========================================

const bancoDeDados = getFirestore(
  aplicativoFirebase
);


// ========================================
// EXPORTA PARA OUTRAS TELAS
// ========================================

export {
  aplicativoFirebase,
  autenticacao,
  bancoDeDados,
};