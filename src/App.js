import React, {Component} from 'react';
import GoogleMapsRide from './components/PegmanWalking';
import './App.css';

class App extends Component {

    constructor() {
        super();
        this.state = {};
    }

    render() {
        return (
            <div className="app">
                <GoogleMapsRide/>
            </div>
        );
    }
}


export default App;
