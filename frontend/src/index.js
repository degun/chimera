import React from 'react';
import ReactDOM from 'react-dom';
import { createStore, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';
import thunk from 'redux-thunk';
import { persistStore, persistReducer } from 'redux-persist'
import { PersistGate } from 'redux-persist/integration/react'
import storage from 'redux-persist/lib/storage'
import { BrowserRouter } from 'react-router-dom';
import rootReducer from './store/reducers/rootReducer';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';

const persistConfig = {
        key: 'root',
        storage,
      }

const persistedReducer = persistReducer(persistConfig, rootReducer);  
const store = createStore(persistedReducer, applyMiddleware(thunk));
const persistor = persistStore(store);
window.persistor = persistor;

ReactDOM.render(
                <Provider store={store}>
                        <PersistGate loading={null} persistor={persistor}>
                                <BrowserRouter>
                                        <App />
                                </BrowserRouter>
                        </PersistGate>
                </Provider>, 
        document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
