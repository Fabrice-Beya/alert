import React from 'react';
import SwitchNavigator from './navigation/SwitchNavigator';
import rootReducer from './reducers';
import { createStore, applyMiddleware } from 'redux'
import { Provider } from 'react-redux';
import thunkMiddleware from 'redux-thunk';
import logger from 'redux-logger';
import { persistStore, persistReducer } from "redux-persist";
import { PersistGate } from 'redux-persist/lib/integration/react';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2';
import { AsyncStorage, ActivityIndicator, View, Platform } from 'react-native'
import { Notifications } from 'expo';
console.disableYellowBox = true;

const middleware = applyMiddleware(thunkMiddleware, logger)

const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  stateReconciler: autoMergeLevel2
};

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(persistedReducer, middleware);
const persistor = persistStore(store);

export default class MyApp extends React.Component {

  componentDidMount = () => {
    if (Platform.OS === 'android') {
      Notifications.createChannelAndroidAsync('incidence-notifs', {
        name: 'incidence-notifs',
        sound: true,
        priority: 'max',
        vibrate: [0, 250, 250, 250],
      });
    }
  }

  renderLoading = () => {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#333333" size={"large"} />
      </View>
    );
  };
  render() {
    return (
      <Provider store={store}>
        <PersistGate loading={this.renderLoading()} persistor={persistor}>
          <SwitchNavigator />
        </PersistGate>
      </Provider>

    );
  }
}

