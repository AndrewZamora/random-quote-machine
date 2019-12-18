import React, { Component } from 'react'
import './App.css';
const getQuotes = async () => {
  const response = await fetch('https://quotesondesign.com/wp-json/wp/v2/posts/?orderby=rand');
  const data = await response.json();
  return data;
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { quotes: [] };
  }

  async componentDidMount() {
    const allQuotes = await getQuotes();
    this.setState({
      quotes: allQuotes
    })
  }
  render() {
    return (
      <div className="App">
        <h1>Random Quote Machine</h1>
        <div id="quote-box">
          <div id="text">
          </div>
          <div id="author"></div>
          <div id="new-quote">
            {this.state.quotes.length > 0 ? this.state.quotes[0].id : 'loading'}
          </div>
          <a href="" id="tweet-quote"></a>
        </div>
      </div>
    )
  }
}
export default App;