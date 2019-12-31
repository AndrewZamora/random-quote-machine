import React, { Component } from 'react'
import './App.css';

const getPageIds = async title => {
  const response = await fetch(`https://en.wikiquote.org/w/api.php?action=query&format=json&origin=*&titles=${title}&generator=links&gplnamespace=0&gpllimit=20`);
  const data = await response.json();
  return Object.keys(data.query.pages);
};
const getNamesFromPage = async pageId => {
  const response = await fetch(`https://en.wikiquote.org/w/api.php?action=query&format=json&origin=*&prop=links&pageids=${pageId}&redirects=1&pllimit=max`);
  const data = await response.json();
  // Wanted to use data.query.pages[pageId].links but the object's page id returned from API doesn't always match
  const actualPageId = Object.keys(data.query.pages);
  const names = data.query.pages[actualPageId].links.map(link => link.title);
  return names;
};
const getQuote = async name => {
  const response = await fetch(`https://en.wikiquote.org/w/api.php?action=parse&format=json&origin=*&page=${name}&prop=text&section=1&disablelimitreport=1&disabletoc=1`);
  const data = await response.text();
  return JSON.parse(data).parse.text['*'];
};
const createElement = htmlString => {
  const element = document.createElement('div');
  element.innerHTML = htmlString;
  return element;
}
const parseElement = element => {
  return element.querySelector('ul').querySelector('li').childNodes[0].textContent;
};
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
    const pageIds = await getPageIds('list of people by name');
    const randomId = pageIds[randomNum(pageIds.length)];
    const names = await getNamesFromPage(randomId);
    const randomName = names[randomNum(names.length)];
    const unparsedQuote = await getQuote(randomName);
    const quote = parseElement(createElement(unparsedQuote));
    this.setState({
      currentAuthor: randomName,
      currentQuote: quote,
      names: [{ id: randomId, names: names }]
    })
  }
  selectQuote = () => {
    const newQuote = this.state.quotes[randomNum(this.state.quotes.length - 1)];
    this.setState({
      currentQuote: newQuote
    });
  }
  createQuote = (quote, author) => {
    // This is a REACT way to render HTML String https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml
    return (<>
      {quote}

      {author}
    </>);
  }
  tweetQuote = (quote) => {
    console.log(quote.current !== null ? quote.current.textContent : "loading")
    console.log(quote)
    // return (
    //   <a href={`https://twitter.com/intent/tweet?text=`} id="tweet-quote" >Tweet</a>
    // )
  }
  render() {
    return (
      <div className="App">
        <h1>Random Quote Machine</h1>
        <div id="quote-box">
          {this.state.currentQuote.length > 0 && this.createQuote(this.state.currentQuote, this.state.currentAuthor)}
          <button id="new-quote" onClick={() => this.selectQuote()}>New Quote</button>
        </div>
      </div>
    )
  }
}
export default App;