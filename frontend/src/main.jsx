import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import "./index.css";
import "./App.css";
import 'bootstrap/dist/css/bootstrap.min.css'
import axios from "./api/axios"
axios.defaults.withCredentials = true;
axios.defaults.baseURL = 'http://localhost:8081';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
