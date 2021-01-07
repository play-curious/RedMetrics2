import React from 'react';
import Register from "./views/Register";
import Home from "./views/Home";
import './App.css';

class App extends React.Component {
  state: {
    role: "nobody" | "admin" | "dev" | "user"
  } = {
    role: "nobody"
  }

  render() {
    if(this.state.role === "nobody"){
      const apiKey = sessionStorage.getItem("apiKey")

      if(!apiKey) {
        return <Register/>;
      }else{
        // setState
      }
    }else{
      return <Home/>;
    }
  }
}

export default App;
