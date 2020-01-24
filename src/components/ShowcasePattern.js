import React, {Component} from 'react';
import {pad, random, angleToCardinal} from './functions'

class CompName extends Component {

    displayPerson = () => {
        if (!this.props.objectsOutput.moovingObj) {
            return null;
        }
        const arr = [];
        for (let i = this.props.objectsOutput.moovingObj.Person.ShiftData.start_frame; i < this.props.objectsOutput.moovingObj.Person.ShiftData.frames + this.props.objectsOutput.moovingObj.Person.ShiftData.start_frame; i++) {
            arr.push(i)
        }
        return arr.map((frame_number, index) => {
            return (
                <img
                    key={index}
                    src={this.props.imgFolder + '/90_' + pad(frame_number, 4) + '.png'}
                    alt={'Person'}
                />
            );
        })
    }

    displayTitle = () => {
        if (!this.props.objectsOutput.moovingObj) {
            return 'Motion pattern:';
        }
        return 'Motion pattern: ' + this.props.objectsOutput.moovingObj.Person.ShiftData.name;
    }

    render() {
        return (
            <div className={'showcasepattern showcase' + this.props.id}>
                <div className="title">{this.displayTitle()}</div>
                <div className="showcase_wrapper">{this.displayPerson()}</div>
            </div>
        );
    }

}

export default CompName;