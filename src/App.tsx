import React from 'react';
import Register from "./views/Register";
import Home from "./views/Home";
import './App.css';

class App extends React.Component {
  state: {
    apiKey: string | null
  } = {
    apiKey: null
  }

  render() {
    if(!this.state.apiKey){
      const apiKey = sessionStorage.getItem("apiKey")

      if(!apiKey) {
        return <Register/>;
      }else{
        this.setState({ apiKey })
      }
    }else{
      return <Home/>;
    }
  }
}

export default App;
