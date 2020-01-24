import React, {Component} from 'react';
import {
    gmPoint,
    pad,
    coordDistance,
    pointAtDistAndAngle,
    segmentAngle,
    percWayPoint,
    angle_0_360,
    findClosestView
} from './functions'

const gm = window.google.maps;

class StreetView extends Component {

    constructor() {
        super();
        this.state = {
            Person: null,
            Start: null,
            settings: {
                personSize: 1
            }
        };
        this.map = null;

        this.Person = null;

        this.redDot = null;
        this.greenDot = null;

        this.coefWindowWidth = 1;
    }

    componentDidMount() {
        this.renderMap();
        this.coefWindowWidth = document.getElementById(this.props.divID).offsetWidth * 0.00066;
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.displayMovables(nextProps.objectsOutput)
    }

    renderMap() {
        const mapProp = {
            busy: false,
            visible: true,
            // mode : 'html5',
            overviewMapControl: false,
            streetViewControl: false,
            addressControl: false,
            position: this.props.Start,
            panControl: false,
            zoomControl: false,
            scaleControl: false,
            rotateControl: false,
            linksControl: false,
            clickToGo: false,
            scrollwheel: false,
            disableDefaultUI: true,
            standAlone: false,
            motionTracking: false,
            Pov0360: 0
        };
        this.map = new gm.StreetViewPanorama(document.getElementById(this.props.divID), mapProp);
        this.renderMarkers()
    }

    renderMarkers = () => {
        this.Person = new gm.Marker({
            map: this.map,
            draggable: true,
            position: null,
            zIndex: 8,
            icon: this.personIcon(gmPoint(0, 0), 0, 1, 'return icon')
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
        this.greenDot = new gm.Marker({
            map: this.map,
            draggable: true,
            position: null,
            zIndex: 8,
            icon: new gm.MarkerImage(
                'img/Signs32/dotGreen.png',
                new gm.Size(3, 3),
                new gm.Point(0, 0),
                new gm.Point(1, 1),
                new gm.Size(3, 3)
            )
        });
        this.mapEvents()
    }

    personIcon = (position, angle, StepFrame, toReturn = null) => {
        const criticaldistance = 3 / 1000000000000;
        const distCameraToPerson = coordDistance(this.map.getPosition(), position)
        let size = this.props.mapOptions.personSizeCoeff * this.state.settings.personSize * this.coefWindowWidth;
        if (distCameraToPerson <= criticaldistance) {
            size = size * Math.pow(criticaldistance, 1 / 2.3) / Math.pow(distCameraToPerson, 1 / 2.3)
        }
        const picFolder = (111 * size < 221) ? 'https://demos.horiaursu.com/pegmanwalking/img/P0' : 'https://demos.horiaursu.com/pegmanwalking/img/PN';
        const url = picFolder + '/' + angle.toString() + '_' + pad(StepFrame, 4) + '.png'
        const icon = new gm.MarkerImage(
            url,
            new gm.Size(111 * size, 111 * size),
            new gm.Point(0 * size, 0 * size),
            new gm.Point(56 * size, 93 * size),
            new gm.Size(111 * size, 111 * size)
        );
        if (!toReturn) {
            this.Person.setIcon(icon);
        } else {
            return icon;
        }
    }

    mapEvents = () => {
        gm.event.addListener(this.map, 'pano_changed', () => {
            this.lookAtMe();
            this.props.objectSetOutput(
                this.props.divID,
                this.props.category,
                {position: this.map.getPosition(), HeadingDeg: this.map.pov.heading}
            );
        }, {passive: true});
        gm.event.addListener(this.map, 'pov_changed', () => {
            this.props.objectSetOutput(
                this.props.divID,
                this.props.category,
                {position: this.map.getPosition(), HeadingDeg: this.map.pov.heading}
            );
        }, {passive: true});
        gm.event.addListener(this.map, 'position_changed', () => {
            this.lookAtMe();
            this.props.objectSetOutput(
                this.props.divID,
                this.props.category,
                {position: this.map.getPosition(), HeadingDeg: this.map.pov.heading}
            );
        }, {passive: true});
        gm.event.addListener(this.map, 'links_changed', () => {
            this.lookAtMe();
            setTimeout(() => {
                this.map.busy = false;
                try {
                    this.Person.setVisible(true)
                } catch (err) {
                }
                this.lookAtMe();
                document.getElementById('black_screen_' + this.props.divID).style.display = 'none';
            }, 1500)
        }, {passive: true});
    }

    displayMovables = (data) => {
        if (data.moovingObj) {
            if (!this.map.busy && (this.Person.getPosition() !== data.moovingObj.Person.Position || data.moovingObj.Person.SpeedShift === 0)) {
                this.Person.setPosition(data.moovingObj.Person.Position)
                // this.redDot.setPosition(data.moovingObj.Person.Position)
                this.setState({Person: data.moovingObj.Person});
                if (this.props.mapOptions.panToMeBack) {
                    this.panToMeBack()
                }
                else if (this.props.mapOptions.panToMeFront) {
                    this.panToMeFront()
                }
                const angle = angle_0_360(data.moovingObj.Person.HeadingDeg - this.map.pov.heading.toFixed(0));
                this.personIcon(data.moovingObj.Person.Position, angle, data.moovingObj.Person.StepFrame)
            }
        }
    }

    panToMeFront = () => {
        if (!this.map.busy && this.state.Person) {
            this.lookAtMe();
            const dist_necessary = 3 / 10000
            const running_point = pointAtDistAndAngle(this.Person.getPosition(), dist_necessary, this.state.Person.HeadingDeg, 'deg')
            const camera_running_point_distance = coordDistance(this.map.getPosition(), running_point)
            const criticaldistance = 12 / 1000000000000;
            if (camera_running_point_distance > criticaldistance && !this.map.busy) {
                this.map.busy = true;
                document.getElementById('black_screen_' + this.props.divID).style.display = 'block';
                this.Person.setVisible(false)
                findClosestView(running_point)
                    .then(res => {
                        this.map.setPano(res.location.pano);
                    })
                    .catch(err => console.log(err))
            }
        }
    }

    panToMeBack = () => {
        if (!this.map.busy) {
            this.lookAtMe();
            const criticaldistance = 6 / 1000000000000;
            const camera_dude_distance = coordDistance(this.Person.getPosition(), this.map.getPosition())
            const newCameraPositionProposed = percWayPoint(this.map.getPosition(), this.Person.getPosition(), 100)
            if (camera_dude_distance > criticaldistance && !this.map.busy) {
                this.map.busy = true;
                document.getElementById('black_screen_' + this.props.divID).style.display = 'block';
                this.Person.setVisible(false)
                findClosestView(newCameraPositionProposed)
                    .then(res => {
                        this.map.setPano(res.location.pano);
                    })
                    .catch(err => console.log(err))
            }
        }

    }

    lookAtMe = () => {
        const personAngle = angle_0_360(segmentAngle(this.map.getPosition(), this.Person.getPosition()));
        if (Math.abs(angle_0_360(this.map.pov.heading) - personAngle) > 0.1) {
            this.map.setPov({
                heading: personAngle,
                pitch: 3,
                zoom: 1
            });
        }
    }

    render() {
        return (
            <div className={'map streetview ' + this.props.divID}>
                <div className="map_wrapper">
                    <div className="googleMap" id={this.props.divID}>{}</div>
                    <div className="black_screen" id={'black_screen_' + this.props.divID}>{}</div>
                    <div className="no_touch" id={'black_screen_' + this.props.divID}>{}</div>
                </div>
            </div>
        );
    }

}

export default StreetView;