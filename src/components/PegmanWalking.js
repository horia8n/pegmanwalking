import React, {Component} from 'react';
import StreetView from './StreetView';
import Person from './Person';
import MapCenter from './Map';
import ShowCase from './ShowCase';
import ShowcasePattern from './ShowcasePattern';
import SidePanel from './SidePanel';
import {gmPoint} from './functions'

class GoogleMapsRide extends Component {

    constructor() {
        super();

        this.object = {state: {}, input: {}, output: {}};

        this.state = {
            Start: null,
            objects: {
                input: {},
                output: {},
                Person: this.object,
                MapCenter: this.object,
                camBlue: this.object,
                camRed: this.object
            },
            personInput: {
                EngineOn: false,
                position: gmPoint(0, 0),
                angle: 0
            },
            centerMapInput: {
                position: null,
                zoom: 1,
                heading: 0
            }
        };
        this.Start = null;
    }

    componentDidMount() {
        this.setStartOrEnd(gmPoint(43.65738360540341, -79.40308525616888))
        window.addEventListener('resize', () => this.reportWindowSize());
    }

    setStartOrEnd = (Start) => {
        this.setState({
            Start,
            objects: {
                ...this.state.objects,
                input: {
                    ...this.state.objects.input,
                    Person: {
                        EngineOn: true,
                        Position: Start,
                        HeadingDeg: 0
                    }
                }
            }
        })
    }

    objectSetOutput = (id, category, output) => {
        const objects = this.state.objects;
        objects.output[category] = (objects.output[category]) ? objects.output[category] : {};
        objects.output[category][id] = output;
        this.setState({objects});
    };

    //---------------------------------------------------------------------------------------- Render

    reportWindowSize = () => {
        console.log('------------ reportWindowSize()');
        const html = document.querySelector('html').getBoundingClientRect();
        const body = document.querySelector('body').getBoundingClientRect();
        const container = document.querySelector('.container').getBoundingClientRect();
        const app = document.querySelector('.app').getBoundingClientRect();
        const bikeridepage = document.querySelector('.bikeridepage').getBoundingClientRect();
        const mapswrapper = document.querySelector('.mapswrapper').getBoundingClientRect();
        const SidePanel = document.querySelector('.SidePanel').getBoundingClientRect();
        const camBlue = document.querySelector('.map.streetview.camBlue').getBoundingClientRect();
        const camRed = document.querySelector('.map.streetview.camRed').getBoundingClientRect();
        const MapCenter = document.querySelector('.map.topview.MapCenter').getBoundingClientRect();

        console.log('html', html);
        console.log('body', body);
        console.log('container', container);
        console.log('app', app);
        console.log('bikeridepage', bikeridepage);
        console.log('mapswrapper', mapswrapper);
        console.log('camBlue', camBlue);
        console.log('camRed', camRed);
        console.log('MapCenter', MapCenter);


        const mapswrapperWidth = window.width - 400;
        const mapswrapperHeight = window.height;


    }


    render() {
        return (
            <div className="bikeridepage">
                <div className="mapswrapper">
                    <Person
                        divID={'Person'}
                        category={'moovingObj'}
                        EngineOn={this.state.personStarted}
                        objectsInput={this.state.objects.input}
                        input={this.state.objects['Person'].input}
                        objectSetOutput={this.objectSetOutput}
                    />
                    <StreetView
                        divID={'camBlue'}
                        category={'cameras'}
                        objectSetOutput={this.objectSetOutput}
                        objectsOutput={this.state.objects.output}
                        Start={gmPoint(43.657348543281415, -79.40331613303272)}
                        mapOptions={{
                            personSizeCoeff: 1,
                            iconSizeCoefficient: 0.5,
                            panToMeBack: true,
                            panToMeFront: false
                        }}
                    />
                    <StreetView
                        divID={'camRed'}
                        category={'cameras'}
                        objectSetOutput={this.objectSetOutput}
                        objectsOutput={this.state.objects.output}
                        Start={gmPoint(43.65747135151592, -79.4031250256404)}
                        mapOptions={{
                            personSizeCoeff: 1,
                            iconSizeCoefficient: 0.5,
                            panToMeBack: false,
                            panToMeFront: true
                        }}
                    />
                    <MapCenter
                        divID={'MapCenter'}
                        category={'map'}
                        Start={this.state.Start}
                        input={this.state.centerMapInput}
                        input2={this.state.objects['MapCenter'].input}
                        objectSetOutput={this.objectSetOutput}
                        mapOptions={{
                            mapTypeId: 'HYBRID',
                            personSizeCoeff: 1,
                            signsSizeCoeff: 1,
                            flagsSizeCoeff: 1,
                            pathsThicknesCoefficient: 8,
                            zoomMin: 21,
                            panToMe: true,
                            panToStep: false,
                            panToWholePath: false,
                            followMe: false
                        }}
                        objectsOutput={this.state.objects.output}
                    />
                </div>
                <SidePanel/>
            </div>
        );
    }

}

export default GoogleMapsRide;


// TODO choosed another start point
// TODO Fix nonsence functions