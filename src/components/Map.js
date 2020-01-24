import React, {Component} from 'react';
import {gmPoint, pad, angle_0_360} from './functions'

const gm = window.google.maps;

class Map extends Component {

    constructor() {
        super();
        this.state = {
            Start: null,
            settings: {
                personSize: 1
            }
        };
        this.map = null;
        this.picFolder = 'https://demos.horiaursu.com/pegmanwalking/img/P45';
        this.Person = null;
        this.Start = null;
        this.camera = {};
        this.redDot = null;
    }

    componentDidMount() {
        this.renderMap();
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.setStartOrEndLocal(nextProps.Start)
        this.displayMovables(nextProps.objectsOutput)
        this.displayCameras(nextProps.objectsOutput)
    }

    renderMap() {
        const mapProp = {
            mapTypeId: gm.MapTypeId[this.props.mapOptions.mapTypeId],
            center: gmPoint(0, 0),
            zoom: 3,
            tilt: 45,
            heading: 0,
            disableDoubleClickZoom: true,
            scaleControl: false,
            streetViewControl: false,
            overviewMapControl: false,
            mapTypeControl: false,
            zoomControl: false,
            panControl: false,
            fullscreenControl: false,
            keyboardShortcuts: false
        };
        this.map = new gm.Map(document.getElementById(this.props.divID), mapProp);
        const noPoi = [{
            featureType: "poi",
            stylers: [{visibility: "off"}, {featureType: "transit.station.bus", stylers: [{visibility: "off"}]}]
        }];
        this.map.setOptions({styles: noPoi});

        this.renderMarkers()
    }

    renderMarkers = () => {
        this.Person = new gm.Marker({
            map: this.map,
            draggable: true,
            position: null,
            title: 'Person',
            zIndex: 1,
            icon: this.personIcon(0, 1, 'return icon'),
            HeadingDeg: 0,
            StepFrame: 1
        });
        this.redDot = new gm.Marker({
            map: this.map,
            draggable: true,
            position: null,
            zIndex: 8,
            icon: new gm.MarkerImage(
                'img/Signs32/dotRed.png',
                new gm.Size(3, 3),
                new gm.Point(0, 0),
                new gm.Point(1, 1),
                new gm.Size(3, 3)
            )
        });
        this.camera['camBlue'] = new gm.Marker({
            map: this.map,
            draggable: true,
            position: null,
            zIndex: 6,
            icon: new gm.MarkerImage(
                'img/camBlue32/0.png',
                new gm.Size(32 * this.props.mapOptions.flagsSizeCoeff, 32 * this.props.mapOptions.flagsSizeCoeff),
                new gm.Point(0 * this.props.mapOptions.flagsSizeCoeff, 0 * this.props.mapOptions.flagsSizeCoeff),
                new gm.Point(16 * this.props.mapOptions.flagsSizeCoeff, 16 * this.props.mapOptions.flagsSizeCoeff),
                new gm.Size(32 * this.props.mapOptions.flagsSizeCoeff, 32 * this.props.mapOptions.flagsSizeCoeff)
            )
        });
        this.camera['camRed'] = new gm.Marker({
            map: this.map,
            draggable: true,
            position: null,
            zIndex: 6,
            icon: new gm.MarkerImage(
                'img/camRed32/0.png',
                new gm.Size(32 * this.props.mapOptions.flagsSizeCoeff, 32 * this.props.mapOptions.flagsSizeCoeff),
                new gm.Point(0 * this.props.mapOptions.flagsSizeCoeff, 0 * this.props.mapOptions.flagsSizeCoeff),
                new gm.Point(16 * this.props.mapOptions.flagsSizeCoeff, 16 * this.props.mapOptions.flagsSizeCoeff),
                new gm.Size(32 * this.props.mapOptions.flagsSizeCoeff, 32 * this.props.mapOptions.flagsSizeCoeff)
            )
        });
        this.mapEvents()
    }

    personIcon = (angle, StepFrame, toReturn = null) => {
        let size = this.props.mapOptions.personSizeCoeff * this.state.settings.personSize / (22 - this.map.zoom)
        const url = this.picFolder + '/' + angle.toString() + '_' + pad(StepFrame, 4) + '.png'
        const icon = new gm.MarkerImage(
            url,
            new gm.Size(35 * size, 35 * size),
            new gm.Point(0 * size, 0 * size),
            new gm.Point(18 * size, 22 * size),
            new gm.Size(35 * size, 35 * size)
        );
        if (!toReturn) {
            this.Person.setIcon(icon);
        } else {
            return icon;
        }
    }

    mapEvents = () => {
        gm.event.addListener(this.map, 'center_changed', () => {
        }, {passive: true});
        gm.event.addListener(this.map, 'zoom_changed', () => {
        }, {passive: true});
        gm.event.addListener(this.map, 'tilesloaded', () => {
            this.personIcon(this.Person.HeadingDeg, 1)
        }, {passive: true});

        gm.event.addListener(this.Person, 'dragend', () => {
            console.log('Person position_changed');
            console.log('lat', this.Person.getPosition().lat());
            console.log('lng', this.Person.getPosition().lng());
            this.props.objectSetOutput(this.props.divID, this.props.category, this.Person.getPosition());
        }, {passive: true});

        gm.event.addListener(this.camera['camBlue'], 'position_changed', () => {
            // console.log('camBlue position_changed');
            // console.log('lat', this.camera['camBlue'].getPosition().lat());
            // console.log('lng', this.camera['camBlue'].getPosition().lng());
        }, {passive: true});
        gm.event.addListener(this.camera['camRed'], 'position_changed', () => {
            // console.log('camRed position_changed');
            // console.log('lat', this.camera['camRed'].getPosition().lat());
            // console.log('lng', this.camera['camRed'].getPosition().lng());
        }, {passive: true});
    }

    setStartOrEndLocal = (Start) => {
        if (Start !== this.state.Start) {
            this.setState({Start}, () => {
                this.map.setCenter(this.state.Start)
                this.map.setZoom(this.props.mapOptions.zoomMin)
            })
        }
    }

    displayMovables = (data) => {
        if (data.moovingObj) {
            if (this.Person.getPosition() !== data.moovingObj.Person.Position) {
                this.Person.setPosition(data.moovingObj.Person.Position)
                // this.redDot.setPosition(data.moovingObj.Person.Position)
                // console.log('this.redDot.getPosition().lat()',this.redDot.getPosition().lat());
                // console.log('this.redDot.getPosition().lng()',this.redDot.getPosition().lng());
                if (this.props.mapOptions.panToMe && this.map.tilesloading === false) {
                    this.panToMe()
                }
                let angle = angle_0_360(data.moovingObj.Person.HeadingDeg - this.map.heading);
                this.personIcon(angle, data.moovingObj.Person.StepFrame);
                this.Person.HeadingDeg = angle
                this.Person.StepFrame = data.moovingObj.Person.StepFrame
            }
        }
    }

    displayCameras = (data) => {
        if (data.cameras) {
            Object.keys(data.cameras).forEach((id) => {
                if (data.cameras[id].position !== this.camera[id].getPosition()) {
                    this.camera[id].setPosition(data.cameras[id].position)
                }
                let angle = angle_0_360(data.cameras[id].HeadingDeg.toFixed(0) - this.map.heading)
                if (angle !== this.camera[id].angle) {
                    this.camera[id].angle = angle
                    this.camera[id].icon.url = 'img/' + id + '32/' + this.camera[id].angle + '.png'
                    this.camera[id].setIcon(this.camera[id].icon)
                }
            });
        }
    }

    panToMe = () => {
        try {
            if (!this.map.tilesloading) {
                if (
                    this.Person.getPosition().lat() > (this.map.getBounds().getNorthEast().lat() + this.map.getCenter().lat()) / 2
                    || this.Person.getPosition().lat() < (this.map.getBounds().getSouthWest().lat() + this.map.getCenter().lat()) / 2
                    || this.Person.getPosition().lng() > (this.map.getBounds().getNorthEast().lng() + this.map.getCenter().lng()) / 2
                    || this.Person.getPosition().lng() < (this.map.getBounds().getSouthWest().lng() + this.map.getCenter().lng()) / 2
                ) {
                    const centermapLat = (this.Person.getPosition().lat() - this.map.getCenter().lat()) / 2 + this.Person.getPosition().lat();
                    const centermapLng = (this.Person.getPosition().lng() - this.map.getCenter().lng()) / 2 + this.Person.getPosition().lng();
                    this.map.setCenter(gmPoint(centermapLat, centermapLng));
                }
            }

        }
        catch (err) {
            console.log('err', err);
        }
    }

    displaySetting = (name, settingIndex, min, max, step) => {
        return (
            <div className={'setting ' + settingIndex}>
                <label htmlFor={settingIndex}>{name}</label>
                <input
                    name={settingIndex}
                    type="range" className="slider"
                    min={min} max={max} step={step}
                    value={this.state.settings[settingIndex]}
                    onChange={(e) => this.setSetting(settingIndex, Number(e.target.value))}
                    onInput={(e) => this.setSetting(settingIndex, Number(e.target.value))}
                />
            </div>
        );
    };

    setSetting = (settingIndex, value) => {
        const settings = this.state.settings;
        settings[settingIndex] = value;
        this.setState({settings}, () => {
            if (settingIndex === 'personSize') {
                this.personIcon(this.Person.HeadingDeg, this.props.objectsOutput)
            }
        });
    };

    render() {
        return (
            <div className={'map topview ' + this.props.divID}>
                <div className="map_wrapper">
                    <div className="googleMap" id={this.props.divID}>{}</div>
                    <div className="keysInstructions">
                        <div className="inner">
                            <div className="middle">
                                <div className="line">
                                    <span className="but">↑</span>
                                    <span className="text">Accelerate</span>
                                </div>
                                <div className="line">
                                    <span className="but">←</span>
                                    <span className="text">Left</span>
                                </div>
                                <div className="line">
                                    <span className="but">→</span>
                                    <span className="text">Right</span>
                                </div>
                                <div className="line">
                                    <span className="but">↓</span>
                                    <span className="text">Break</span>
                                </div>
                                <div className="line">
                                    <span className="but">A</span>
                                    <span className="text">Run</span>
                                </div>
                                <div className="line">
                                    <span className="but">Z</span>
                                    <span className="text">Walk</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="settings">
                        <div className="settings_block">
                            {this.displaySetting('Person Size', 'personSize', 1, 2, 0.05)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

}

export default Map;