import React, { Component } from 'react'
import './App.css';

const getPageIds = async title => {
  const response = await fetch(`https://en.wikiquote.org/w/api.php?action=query&format=json&origin=*&titles=${title}&generator=links&gplnamespace=0&gpllimit=20`);
  // couldn't use  response.json() because the response was not in JSON format https://stackoverflow.com/a/40403285/8006073
  const data = await response.text();
  return data;
};
const getNamesFromPage = async pageId => {
  const response = await fetch(`https://en.wikiquote.org/w/api.php?action=query&format=json&origin=*&prop=links&pageids=${pageId}&redirects=1&pllimit=max`);
  const data = await response.text();
  return data;
};
const getQuote = async name => {
  const response = await fetch(`https://en.wikiquote.org/w/api.php?action=parse&format=json&origin=*&page=${name}&prop=text&section=1&disablelimitreport=1&disabletoc=1`);
  const data = await response.text();
  return JSON.parse(data).parse.text['*'];
};
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
    this.textRef = React.createRef();
    this.authorRef = React.createRef();
  }
  async componentDidMount() {
    const requestedQuotes = await getQuotes();
    const test1 = await getPageIds('list of people by name');
    const test2 = await getNamesFromPage('112861')
    const test3 = await getQuote('Carson Grant')
    console.log(test1)
    console.log(test2)
    console.log(test3)
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
  createQuote = (callback) => {
    // This is a REACT way to render HTML String https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
    return (<>
      <div id="text" ref={this.textRef} dangerouslySetInnerHTML={{ __html: this.state.currentQuote.content.rendered }} />
      <div id="author" ref={this.authorRef} dangerouslySetInnerHTML={{ __html: this.state.currentQuote.title.rendered }} />
    </>);
  }
  tweetQuote = (quote) => {
    console.log(quote.current !== null ? quote.current.textContent : "loading")
    console.log(quote)
    // return (
    //   <a href={`https://twitter.com/intent/tweet?text=`} id="tweet-quote" >Tweet</a>
    // )
  }
  getPlainText = (html) => {
    return html.replace()
  }
  render() {
    return (
      <div className="App">
        <h1>Random Quote Machine</h1>
        <div id="quote-box">
          {this.state.quotes.length > 0 && this.createQuote()}
          <button id="new-quote" onClick={() => this.selectQuote()}>New Quote</button>
        </div>
      </div>
    )
  }
}
export default App;