import React, { Component } from 'react'
import './App.css';

const getQuotes = async () => {
  // Quotes come from this API https://quotesondesign.com/api/
  const response = await fetch('https://quotesondesign.com/wp-json/wp/v2/posts/?orderby=rand');
  const data = await response.json();
  return data;
}
const randomNum = limit => {
  return Math.floor((Math.random() * limit));
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quotes: [],
      currentQuote: []
    };
  }
  async componentDidMount() {
    const requestedQuotes = await getQuotes();
    this.setState({
      quotes: requestedQuotes,
      currentQuote: requestedQuotes[0]
    })
  }
  selectQuote = () => {
    const newQuote = this.state.quotes[randomNum(this.state.quotes.length - 1)];
    this.setState({
      currentQuote: newQuote
    });
  }
  createQuote = () => {
    // This is a REACT way to render HTML String https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
    return (<>
      <div id="text" dangerouslySetInnerHTML={{ __html: this.state.currentQuote.content.rendered }} />
      <div id="author" dangerouslySetInnerHTML={{ __html: this.state.currentQuote.title.rendered }} />
      <button id="new-quote" onClick={() => this.selectQuote()}>New Quote</button>
    </>);
  }
  render() {
    return (
      <div className="App">
        <h1>Random Quote Machine</h1>
        <div id="quote-box">
          {this.state.quotes.length > 0 && this.createQuote()}
          <a href="" id="tweet-quote"></a>
        </div>
      </div>
    )
  }
}
export default App;