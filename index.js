/**
 * @format
 */
import 'react-native-worklets-core';
import { AppRegistry } from 'react-native';
import App from './src/app/app';
import { name as appName } from './app.json';

AppRegistry.registerComponent(appName, () => App);
