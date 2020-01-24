import React, {Component} from 'react';
import {angle_0_360} from "./functions";

class CompName extends Component {

    constructor() {
        super();
        this.state = {
            substate: false
        };
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.displayPerson(nextProps.objectsOutput)
    }

    displayPerson = (data) => {
        if (data.moovingObj && data.moovingObj.Person) {
            let HeadingDeg = angle_0_360(data.moovingObj.Person.HeadingDeg + this.props.angleOff)
            document.getElementById('showcase_img' + this.props.id).src = this.props.imgFolder + '/' + HeadingDeg.toString() + '_' + this.pad(data.moovingObj.Person.StepFrame, 4) + '.png'
            document.getElementById('showcase_angle' + this.props.id).innerHTML = HeadingDeg.toString() + '°'
            document.getElementById('showcase_step' + this.props.id).innerHTML = 'st: ' + data.moovingObj.Person.StepFrame
        }
    }

    pad = (num, size) => {
        var s = num + "";
        while (s.length < size) s = "0" + s;
        return s;
        // return num;
    }

    render() {
        return (
            <div className={'showcase showcase' + this.props.id}>
                <div className="showcase_wrapper">
                    <img className="showcase_component showcase_img" id={'showcase_img' + this.props.id} src={null}
                         alt=""/>
                    <div className="showcase_component showcase_angle" id={'showcase_angle' + this.props.id}></div>
                    <div className="showcase_component showcase_step" id={'showcase_step' + this.props.id}></div>
                </div>
            </div>
        );
    }

}

export default CompName;