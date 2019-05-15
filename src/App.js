import React, { Component } from 'react';
import './App.css';
import Particles from 'react-particles-js';
import Clarifai from 'clarifai';
import Navigation from './components/navigation/Navigation';
import SignIn from './components/SignIn/SignIn';
import Register from './components/Register/Register';
import Logo from './components/logo/Logo';
import Rank from './components/Rank/Rank';
import ImageLinkForm from './components/imageLinkForm/ImageLinkForm';
import FaceRecognition from './components/FaceRecognition/FaceRecognition';

const app = new Clarifai.App({
  apiKey: 'efdd94c425bd471d9ceefd63cb863702'
 });

const particlesOptions = {
  particles: {
      number: {
          value: 250,
          density: {
            enable: true,
            value_area: 800
          }
      },
      size: {
          value: 1
      }
  },
  interactivity: {
      events: {
          onhover: {
              enable: true,
              mode: "repulse"
          }
      }
  }
};

class App extends Component {
  constructor(){
    super();
    this.state = {
      input: '',
      imageUrl: '',
      box: [],
      route: 'signin',
      isSignedIn: false
    }
  }

  calculateFaceLocation = (data) => {
    const arrayFaces = data.outputs[0].data.regions.map(region => {
      return region.region_info.bounding_box
    })
    const image = document.getElementById('inputimage');
    const width = +image.width;
    const height = +image.height;

    const arrayClarifaiFace = arrayFaces.map(el => {
      return {
        leftCol: el.left_col * width,
        topRow: el.top_row * height,
        rightCol: width - (el.right_col * width),
        bottomRow: height- (el.bottom_row * height)
      }
    })
    return arrayClarifaiFace;
  }

  displayFaceBox = (box) => {
    this.setState({box: box})
  }

  oninputChange = (event) => {
    this.setState({input: event.target.value});
  }

  onButtonSubmit = (event) => {
    this.setState({imageUrl: this.state.input})
    app.models
    .predict(
      Clarifai.FACE_DETECT_MODEL,
      this.state.input)
    .then(response => this.displayFaceBox(this.calculateFaceLocation(response)))
    .catch(err => console.log(err));
  }

  onRouteChange = (route) => {
    if(route === 'signout'){
      this.setState({isSignedIn: false})
    } else if  (route === 'home'){
      this.setState({isSignedIn: true})
    }
    this.setState({route: route})
  }

  render() {
    const {isSignedIn, imageUrl, route, box} = this.state;
    return (
      <div className="App">
        <Particles className='particles'
        params={particlesOptions} />
        <Navigation isSignedIn={isSignedIn} onRouteChange={this.onRouteChange}/>
        { route === "home"
            ?
            <div>
              <Logo />
              <Rank />
              <ImageLinkForm 
                oninputChange={this.oninputChange} 
                onButtonSubmit={this.onButtonSubmit}
              />
              <FaceRecognition box={box} imageUrl={imageUrl}/> 
            </div>
            : (
                this.state.route === 'signin'
                ? <SignIn onRouteChange={this.onRouteChange}/>
                : <Register onRouteChange={this.onRouteChange}/>

            )
        }
      </div>
    );
  }
}

export default App;
