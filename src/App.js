import React, { Component } from 'react'
import './App.css';
// https://www.mediawiki.org/wiki/API:Main_page
// https://www.mediawiki.org/wiki/API:Tutorial

const wikipediaApi = 'https://en.wikipedia.org/w/api.php';
const wikiquoteApi = 'https://en.wikiquote.org/w/api.php';

const getPageIds = async (api, title) => {
  const response = await fetch(`${api}?action=query&list=search&srsearch=${title}&format=json&origin=*`);
  const data = await response.json();
  const [match] = data.query.search.filter(item => item.title === title);
  return match ? match.pageid : false;
};
const getNamesFromPage = async (pageId) => {
  const response = await fetch(`https://en.wikipedia.org/w/api.php?action=query&format=json&origin=*&prop=links&pageids=${pageId}&redirects=1&pllimit=max`);
  const data = await response.json();
  // // Wanted to use data.query.pages[pageId].links but the object's page id returned from API doesn't always match
  const actualPageId = Object.keys(data.query.pages);
  const names = data.query.pages[actualPageId].links.map(link => link.title);
  return names;
};
const getQuote = async name => {
  const response = await fetch(`https://en.wikiquote.org/w/api.php?action=parse&format=json&origin=*&page=${name}&prop=text&section=1&disablelimitreport=1&disabletoc=1`);
  const data = await response.json();
  return data.parse.text['*'];
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
    const pageIds = await getPageIds(wikipediaApi, 'List of Nobel laureates');
    const unfilteredNames = await getNamesFromPage(pageIds);
    const names = unfilteredNames.filter(name => name.indexOf('Nobel') < 0 );
    const randomName = names[randomNum(names.length - 1)];
    const quote = await getQuote(randomName)
    console.log(quote)
    // this.setState({
    //   currentAuthor: randomName,
    //   currentQuote: quote,
    //   names: [{ id: randomId, names: names }]
    // })
  }
  selectQuote = () => {
    const newQuote = this.state.quotes[randomNum(this.state.quotes.length - 1)];
    this.setState({
      currentQuote: newQuote
    });
  }
  tweetQuote = (quote) => {
    console.log(quote.current !== null ? quote.current.textContent : "loading")
    console.log(quote)
    // return (
    //   <a href={`https://twitter.com/intent/tweet?text=`} id="tweet-quote" >Tweet</a>
    // )
  }
  render() {
    const { currentQuote, currentAuthor } = this.state;
    return (
      <div className="App">
        <h1>Random Quote Machine</h1>
        <div id="quote-box">
          <p>{currentQuote}</p>
          <p>{`- ${currentAuthor}`}</p>
          <button id="new-quote" onClick={() => this.selectQuote()}>New Quote</button>
        </div>
      </div>
    )
  }
}
export default App;