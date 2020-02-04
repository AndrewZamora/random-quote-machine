import React, { Component } from 'react'
import './App.css';
import twitterIcon from "./twitter-icon.svg"
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
  // Wanted to use data.query.pages[pageId].links but the object's page id returned from API doesn't always match
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
  const li = element.querySelector('ul').querySelector('li');
  const ul = li.querySelector('ul');
  if (ul) {
    ul.remove();
  }
  return li.textContent;
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
  }
  async componentDidMount() {
    const pageIds = await getPageIds(wikipediaApi, 'List of Nobel laureates');
    const unfilteredNames = await getNamesFromPage(pageIds);
    const names = unfilteredNames.filter(name => name.indexOf('Nobel') < 0);
    const pageData = await this.requestPageDataMultipleTimes(names, 5);
    const element = createElement(pageData.parse.text['*']);
    const quote = parseElement(element);
    const currentAuthor = pageData.parse.title;
    this.setState({
      currentAuthor: currentAuthor,
      currentQuote: quote,
      names: names
    })
  }
  selectQuote = async () => {
    const { names } = this.state
    const pageData = await this.requestPageDataMultipleTimes(names, 10);
    const element = createElement(pageData.parse.text['*']);
    const quote = parseElement(element);
    const currentAuthor = pageData.parse.title;
    this.setState({
      currentAuthor: currentAuthor,
      currentQuote: quote
    });
  }
  tweetQuote = (quote,author) => {
    return `https://twitter.com/intent/tweet?text=${quote}<br>${author}`;
  }
  requestPageDataMultipleTimes = async (names, attempts) => {
    // PAGE DATA FOR NAME REQUESTED IS NOT ALWAYS THERE
    let pageData;
    let randomName;
    for (let i = 0; i < attempts; i++) {
      randomName = names[randomNum(names.length - 1)];
      pageData = await getPageData(randomName);
      if (pageData.parse) {
        break
      }
    }
    return pageData;
  }
  render() {
    const { currentQuote, currentAuthor } = this.state;
    return (
      <div className="App container">
        <main>
          {currentQuote.length > 0 ?
            (<div id="quote-box">
              <p id="text">{currentQuote}</p>
              <p id="author">{`- ${currentAuthor}`}</p>
              <div className="button-container">
                <button id="new-quote" className="btn btn-secondary" onClick={() => this.selectQuote()}>New Quote</button>
                <a href={this.tweetQuote(currentQuote,currentAuthor)} id="tweet-quote"><img src={twitterIcon} alt="twitter-icon" /></a>
              </div>
            </div>)
            :
            (<div className="spinner-container">
              <div className="spinner spinner-grow text-primary" role="status">
                <span className="sr-only">Loading...</span>
              </div>
            </div>)}
        </main>
      </div>
    )
  }
}
export default App;