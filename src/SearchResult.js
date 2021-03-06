import React, { Component } from "react";
import axios from "axios";
import "./SearchResult.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faInfoCircle, faExclamationCircle, faKiwiBird} from "@fortawesome/free-solid-svg-icons";
import { faTwitter, faTwitterSquare } from '@fortawesome/free-brands-svg-icons' 
import { FacebookIcon, FacebookShareButton } from "react-share";
import { TumblrIcon, TumblrShareButton } from "react-share";
import fear_symbol from "./fear_symbol.png";
import backendUrl from './backendUrl';

import AOS from "aos";

class SearchResult extends Component {
  constructor(props) {
    super(props);
    this.state = {
      tenQuotes: this.props.location.state.data || [],
      quotes: [],
      current: 0,
      loaded: false,
      sentence: this.props.location.state.sentence || '',
      sentenceWords: this.props.location.state.sentence.split(" ") || [],
      likedQuotesList: [],
      liked: false,
      id: '',
      token: '',
      numLikes:'',
      currentQuote: '',
      topics: [],
      POS: [],

      quote: '',
      show: true,
      author: '',
      authenticated: false,
      quoteId: '',
      reportClicked: false,
      analysisClicked: false,
      inputAnalysisClicked: false
    };
  }

  componentDidMount () {
    AOS.init({
      duration: 2000,
    })

    this.getTopics(this.props.location.state.sentence);

    this.getPOS(this.props.location.state.sentence);

    // load the 10 quotes
    let axiosArray = [];
    const quotesList = this.props.location.state.data;
    for (var i=0; i < quotesList.length; i++) {
      let newPromise = axios.get(`${backendUrl}/api/quote/${quotesList[i][0]}`);
      axiosArray.push(newPromise);
    }
    axios.all(axiosArray)
      .then((responses) => {
        //success
        let responseArray = [];
        responses.forEach((res) => {
          responseArray.push(res.data)
        });
        this.setState({
          quotes: responseArray,
          loaded: true,
        });

        // load user information
        const token = sessionStorage.getItem('token');
        this.setState({ token: token });
        if (token===null || token==='') {
          // not signed in
          this.setState({ authenticated: false });
        } else {
          // signed in
          this.setState({ authenticated: true });
          const id = JSON.parse(sessionStorage.getItem('user'))._id.$oid;
          this.setState({ id: id });
        
          const config = {
            headers: {
              Authorization: 'Bearer ' + token
            }
          };
        
          axios.get(`${backendUrl}/api/auth/get/${id}`, config)
          .then((res) => {
            // success
            this.setState({ likedQuotesList: res.data.savedQuotes });

            // check if liked
            if (res.data.savedQuotes.includes(responseArray[this.state.current]._id.$oid)) {
              this.setState({ liked: true });
            }
            else {
              this.setState({ liked: false });
            }

            this.setState({ numLikes: this.state.tenQuotes[this.state.current][1]})
          })
          .catch((err) => {
            // error
            console.log(err);
          });
        }

      })
      .catch((error) => {
        // error
        console.log(error);
      });
  }

  getTopics = (sentence) => {
    const config = {
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }
    };
    const body = {
      sentence: sentence,
    };
    axios.put(`${backendUrl}/api/sentiment/getTopics`, body, config)
      .then((res) => {
        // success
        console.log(res);
        this.setState({
          topics: res.data,
        })
      })
      .catch((err) => {
        // error
        console.log(err)
      });
  }

  getPOS = (sentence) => {
    const config = {
      headers: {
        Authorization: 'Bearer ' + this.state.token
      }
    };
    const body = {
      sentence: sentence,
    };
    axios.put(`${backendUrl}/api/sentiment/getPOS`, body, config)
      .then((res) => {
        // success
        console.log(res);
        this.setState({
          POS: res.data,
        })
      })
      .catch((err) => {
        // error
        console.log(err)
      });
  }



  nextQuote = () => {
    // update current quote
    var num = this.state.current;
    if (num+1 >= this.state.quotes.length) {
      num = 0;
    }
    else {
      num = num + 1;
    }
    this.setState({ current: num });

    // check if the quote is liked
    if (this.state.likedQuotesList.includes(this.state.quotes[num]._id.$oid)) {
      this.setState({ liked: true });
    }
    else {
      this.setState({ liked: false });
    }

    this.setState({ numLikes: this.state.tenQuotes[num][1]})
  }

  likeQuote = (event, id) => {
    event.preventDefault();
    if (this.state.likedQuotesList.includes(id)) {
      // already liked, remove from liked
      console.log('dislike');
      const config = {
        headers: {
          Authorization: 'Bearer ' + this.state.token
        }
      };
      const body = {
        // removeQuote: this.state.quotes[this.state.current]._id.$oid,
        removeQuote: id,
        sentiment: this.state.quotes[this.state.current].sentimentName,
      };
      axios.put(`${backendUrl}/api/auth/removeQuote/${this.state.id}`, body, config)
      .then((res) => {
        // success, get new user object
        axios.get(`${backendUrl}/api/auth/get/${this.state.id}`, config)
          .then((response) => {
            // success
            sessionStorage.setItem('user', JSON.stringify(response.data));
            this.setState({
              likedQuotesList: response.data.savedQuotes,
              liked: false
            });

            // decrease like count
            for (var i=0; i < this.state.tenQuotes.length; i++) {
              if (this.state.tenQuotes[i][0] === id) {
                var temp1 = this.state.tenQuotes;
                temp1[i][1] = temp1[i][1] - 1;
                this.setState({
                  tenQuotes: temp1
                });
              }
            }
          })
          .catch((error) => {
            // error
            console.log(error);
          });
      })
      .catch((err) => {
        // error
        console.log(err);
      });
    } else {
      // add to liked
      const config = {
        headers: {
          Authorization: 'Bearer ' + this.state.token
        }
      };
      const body = {
        addQuote: id,
        sentiment: this.state.quotes[this.state.current].sentimentName,
      };
      axios.put(`${backendUrl}/api/auth/saveQuote/${this.state.id}`, body, config)
      .then((res) => {
        // success
        var temp = this.state.likedQuotesList;
        temp.push(id);
        
        this.setState({ 
          likedQuotesList: temp,
          liked: true
        });

        // increase like count
        for (var i=0; i < this.state.tenQuotes.length; i++) {
          if (this.state.tenQuotes[i][0] === id) {
            var temp1 = this.state.tenQuotes;
            temp1[i][1] = temp1[i][1] + 1;
            this.setState({
              tenQuotes: temp1
            });
          }
        }
      })
      .catch((err) => {
        // error
        console.log(err);
      });
    }
  }

  reportQuote = (event, id) => {
    event.preventDefault();
    console.log("A new report has been made:\n"+"quote ID: "+(this.state.quoteId)+"\nquote: "+(this.state.quote));
    this.setState({
      reportClicked: true,
      currentQuote: id
    });
  }

  closeReportModal = (event, id) => {
    event.preventDefault();
    this.setState({
      reportClicked: false,
      currentQuote: '',
    });
  }

  MLInfo = (event, id) => {
    event.preventDefault();
    this.setState({
      analysisClicked: true,
      currentQuote: id,
    });
  }

  closeAnalysisModal = (event) => {
    this.setState({
      analysisClicked: false,
    currentQuote: '',
    });
  }

  displayLikes = (id) => {
    for (var i=0; i < this.state.tenQuotes.length; i++) {
      if (this.state.tenQuotes[i][0] === id) {
        return this.state.tenQuotes[i][1];
      }
    }
  }


  openInputAnalysis = () => {
    this.setState({
      inputAnalysisClicked: true,
    });
  }

  closeInputAnalysis = () => {
    this.setState({
      inputAnalysisClicked: false,
    });
  }

  shareQuoteTweet() {
    let quote = quote.quote;
    const tweet_text = "https://twitter.com/intent/tweet?text=" + quote;

    return tweet_text;

  }

  displayMLData = () => {
    var words = this.state.sentenceWords;
    var keyTopics = this.state.topics;
    return words.map((word) => {
      return (
        <span className="userInputML" style={{color: keyTopics.includes(word) ? "#e23a3d" : "#eeeeee"}}>{word} </span>

      )
    });
  }


  displayQuotes = (event) => {
    return this.state.quotes.map((quote) => {
      return (
        <div class="item" data-aos="zoom-in" key={quote._id.$oid}>
          <p>{quote.quote}</p>
          <p>- {quote.author}</p>
          <div class="stage">
            <div className={this.state.likedQuotesList.includes(quote._id.$oid) ? ("heart is-active"):("heart")}
            onClick={(e) => {
              this.likeQuote(e, quote._id.$oid)
            }} 
            ></div>
          </div>

          <p className="likes_display">{this.displayLikes(quote._id.$oid)} people liked this quote</p>

          <a class="twitter-share-button" 
              href={'https://twitter.com/intent/tweet?text=' + quote.quote + " Quote by " + quote.author + "."}
              target="_blank"
          >
            <FontAwesomeIcon icon={faTwitter} size="xs" /> 
          </a>

          &nbsp;
          <FacebookShareButton
            url={"http://athena21w.surge.sh/"}
            quote={quote.quote + ". Quote by " + quote.author + "."}
            hashtag="#Athena-Philosopy"
          >
            <FacebookIcon size={40} round={true}></FacebookIcon>
          </FacebookShareButton>
          
          &nbsp;
          <TumblrShareButton
            url={"http://athena21w.surge.sh/"}
            title={"From athena-philosophy"}
            caption={quote.quote + ". Quote by " + quote.author + "."}
            tags={["#philosophy", "athena"]}
          >
            <TumblrIcon size={40} round={true}></TumblrIcon>
          </TumblrShareButton>
          



         


          <nav className="menu">
            <input type="checkbox" href="#" className="menu-open" name={quote._id.$oid} id={quote._id.$oid} />
            <label className="menu-open-button" htmlFor={quote._id.$oid}>
              <span className="hamburger hamburger-1"></span>
              <span className="hamburger hamburger-2"></span>
              <span className="hamburger hamburger-3"></span>
            </label>

            <a className="menu-item"> 
              <div className="icon">
              <FontAwesomeIcon icon={faInfoCircle} onClick={(e) => {this.MLInfo(e, quote._id.$oid)}} /> 
              </div>
            </a>
            <a className="menu-item"> 
              <div className="icon">
              <FontAwesomeIcon icon={faExclamationCircle} onClick={(e) => {this.reportQuote(e, quote._id.$oid)}}/>
              </div>
            </a>
          </nav>

          <div class="mouse"></div>
          <div class="scrollText">Scroll</div>

          { (this.state.analysisClicked && this.state.currentQuote === quote._id.$oid) ? (
            <>
            <div className="analysisModal"></div>
            <div className="methodologyText">
              <div className="methodologyTitle">
                Methodology
              </div>
              After you enter your input, our algorithm uses an advanced state-of-the-art artificial intelligence model to identify the
              primary sentiments expressed in your input. We then find a set of quotes that will potentially be useful based on the 
              sentiments in your input that we find. These quotes are scored based on their syntactical similarity to your input, how useful they have been 
              to other users, and how similar in topic they are to your quote. The highest scoring quotes are displayed to you here. 
              <br></br>
              <button className="closeAnalysisModal" onClick={this.closeAnalysisModal}>Close</button>
            </div>
            </>
          ):(
            <>
            </>
          )}

          { (this.state.reportClicked && this.state.currentQuote === quote._id.$oid) ? (
            <>
              <div className="reportModal"></div>
              <div className="reportText">
                Please write your report below. 
                <br></br>
                <textarea className="reportInput" placeholder="Write your report here..." wrap="soft"> 
                </textarea>
                <br></br>
                <button className="submitReportModal" onClick={(e) => {this.closeReportModal(e, quote._id.$oid)}}>Submit</button>
              </div>
            </>
          ):(
            <>
            </>
          )}

       </div>
      )
    })
  }

  backToExplore = (event) => {
    event.preventDefault();
    this.props.history.push('/explore');
  }

  render() {
    return (
    <div className = "quotePage">
      { this.state.loaded ? (
        <>
          <link href="https://unpkg.com/aos@2.3.1/dist/aos.css" rel="stylesheet"></link>

          <div className="background-container">
           <img className="img1" src="https://firebasestorage.googleapis.com/v0/b/athena-84a5c.appspot.com/o/nietzsche.png?alt=media&token=e0ac842e-8ccc-4f15-a8bd-f4161b8d8c06" alt=""/>
           <img className="img2" src="https://firebasestorage.googleapis.com/v0/b/athena-84a5c.appspot.com/o/Geometric_Moon-removebg.png?alt=media&token=f31c894a-194d-4f7f-afcc-3de9f8445703" alt=""/>
           <img className="lefthand" src="https://firebasestorage.googleapis.com/v0/b/athena-84a5c.appspot.com/o/left_hand.png?alt=media&token=c8a5147d-2342-4e5d-ba9d-c8def4387f21" alt=""/>
           <img className="righthand" src="https://firebasestorage.googleapis.com/v0/b/athena-84a5c.appspot.com/o/right_hand.png?alt=media&token=ddf8550e-9b42-4ed0-99b1-c2f72c8a07e2" alt=""/>
           <div className="stars"></div>
           <div className="twinkling"></div>
           <div className="clouds"></div>
          </div> 

          <button id="result_back_button" onClick={this.backToExplore}><FontAwesomeIcon icon={faArrowLeft} /> Home</button>

          <button id="input_analysis_button" onClick={this.openInputAnalysis}>Analysis</button>

          <div className = "ml-input-data">
            {this.displayQuotes()}
          </div>
      </>
      ):(
        <>
        <p>Loading</p>
        </>
      )}

      { (this.state.inputAnalysisClicked) ? (
            <>
            <div className="analysisText">
              <p>Input:</p>
              <div>
                {this.displayMLData()}
              </div>
              <p>Our ML model interpreted your sentiment as:</p>
              <div className="sentiment-symbol">
                <img src={fear_symbol} alt="fear"/>
              </div>
              <p className="sentiment">{this.state.quotes[0].sentimentName.toUpperCase()}</p>
              <p>POS are: {this.state.POS}</p>
              <button className="closeAnalysisModal" onClick={this.closeInputAnalysis}>Close</button>
            </div>
            </>
          ):(
            <>
            </>
          )}
    </div>

    );
  }
}
export default SearchResult;
