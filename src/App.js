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
const getPageData = async name => {
  const response = await fetch(`https://en.wikiquote.org/w/api.php?action=parse&format=json&origin=*&page=${name}&prop=text&section=1&disablelimitreport=1&disabletoc=1`);
  const data = await response.json();
  return data;
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
    const names = unfilteredNames.filter(name => name.indexOf('Nobel') < 0);
    const pageData = await this.requestPageDataMultipleTimes(names,5); 
    const element = createElement(pageData.parse.text['*']);
    const quote = parseElement(element);
    const currentAuthor = pageData.parse.title;
    const currentId = pageData.parse.pageid;
    console.log(currentAuthor)
    this.setState({
      currentAuthor: currentAuthor,
      currentQuote: quote,
      names: names
    })
  }
  selectQuote = async() => {
    const { names } = this.state
    const pageData = await this.requestPageDataMultipleTimes(names,10); 
    const newQuote = this.state.names[randomNum(this.state.quotes.length - 1)];
    const element = createElement(pageData.parse.text['*']);
    const quote = parseElement(element);
    const currentAuthor = pageData.parse.title;
    const currentId = pageData.parse.pageid;
    this.setState({
      currentAuthor: currentAuthor,
      currentQuote: quote
    });
  }
  tweetQuote = (quote) => {
    console.log(quote.current !== null ? quote.current.textContent : "loading")
    console.log(quote)
    // return (
    //   <a href={`https://twitter.com/intent/tweet?text=`} id="tweet-quote" >Tweet</a>
    // )
  }
  requestPageDataMultipleTimes = async(names,attempts) => {
    // PAGE DATA FOR NAME REQUESTED IS NOT ALWAYS THERE
    let pageData;
    let randomName;
    for (let i = 0; i < attempts; i++) {
      randomName = names[randomNum(names.length - 1)];
      pageData = await getPageData(randomName);
      if(pageData.parse){
        break
      }
    }
    return pageData;
  }
  getNextQuote = () => {
    console.log(this.state)
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