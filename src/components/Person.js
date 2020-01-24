import React, {Component} from 'react';
import {gmPoint, random, angleToCardinal} from './functions'

const AudioContext = window.AudioContext || window.webkitAudioContext;
const context = new AudioContext();

class Person extends Component {

    constructor() {
        super();
        this.state = {
            Person: null,
            settings: {
                personSizeOnMap: 1,
                personSizeOnStreetView: 1,
                gear_1_FreqMin: 1,
                gear_1_FreqMax: 1,
                gear_2_FreqMin: 1,
                gear_2_FreqMax: 1,
                gear_3_FreqMin: 1,
                gear_3_FreqMax: 1,
                gear_4_FreqMin: 1,
                gear_4_FreqMax: 1,
                gear_5_FreqMin: 1,
                gear_5_FreqMax: 1,
                gear_6_FreqMin: 1,
                gear_6_FreqMax: 1,
            },
            generalVolume: 1
        };
        this.keyz = [];
        this.Person = {
            engineBusy: false,
            Accelerating: false,
            Torque: 0,
            torqueStep: 0.005,
            torqueFriction: 0.014,
            torqueMax: 1,
            propsedTorque: 0,
            ShiftingUp: false,
            ShiftingDown: false,
            SpeedShift: 1,
            SuperSpeedShift: 1,
            superShiftsData: [
                {speeds: [0], name: 'standing'},                                                    // -> standing
                {speeds: [1, 7, 10], shifts: [1, 2, 3], name: 'Walking Mode'},                      // -> walk
                {speeds: [8, 16, 20], shifts: [4, 5, 6], name: 'Running Mode'},                     // -> run
            ],
            shiftsData: [
                {ratio: 0, start_frame: 1, frames: 1, frequency_start: 0, frequency_end: 0, name: 'standing'},
                {
                    ratio: 0.0000007,
                    start_frame: 2,
                    frames: 8,
                    frequency_start: 0.03 * this.state.settings.gear_1_FreqMin,
                    frequency_end: 0.1 * this.state.settings.gear_1_FreqMax,
                    name: 'slow'
                },
                {
                    ratio: 0.0000007,
                    start_frame: 10,
                    frames: 8,
                    frequency_start: 0.08 * this.state.settings.gear_1_FreqMin,
                    frequency_end: 0.3 * this.state.settings.gear_1_FreqMax,
                    name: 'walk'
                },
                {
                    ratio: 0.000001,
                    start_frame: 18,
                    frames: 8,
                    frequency_start: 0.2 * this.state.settings.gear_1_FreqMin,
                    frequency_end: 0.3 * this.state.settings.gear_1_FreqMax,
                    name: 'power'
                },
                {
                    ratio: 0.000002,
                    start_frame: 26,
                    frames: 8,
                    frequency_start: 0.1 * this.state.settings.gear_1_FreqMin,
                    frequency_end: 0.7 * this.state.settings.gear_1_FreqMax,
                    name: 'joging'
                },
                {
                    ratio: 0.0000014,
                    start_frame: 34,
                    frames: 8,
                    frequency_start: 0.12 * this.state.settings.gear_1_FreqMin,
                    frequency_end: 0.25 * this.state.settings.gear_1_FreqMax,
                    name: 'run'
                },
                {
                    ratio: 0.000002,
                    start_frame: 42,
                    frames: 8,
                    frequency_start: 0.16 * this.state.settings.gear_1_FreqMin,
                    frequency_end: 0.32 * this.state.settings.gear_1_FreqMax,
                    name: 'power'
                }
            ],
            Engine: 0,
            Breaking: false,
            Break: 0,
            break_adjustor: 0.0000005,
            Motion: 0,
            speed_KM_H_adjustor: 11550000,
            KMHSpeed: 0,
            Clutching: false,
            Steer: 0,
            steeringStep: 1,
            steeringMax: 15,
            steer_to_angle_adjustor: 0.004,
            SteeringLeft: false,
            SteeringRight: false,
            angle: 0,
            HeadingDeg: 0,
            ShiftSpeed: 0.00001,
            RPM: '',
            Position: null,
            Step: 0,
            StepFrame: 0
        };
    }

    componentDidMount() {
        this.initSounds()
        window.addEventListener("keydown", e => {
            this.keyz[e.keyCode] = true;
            this.onkeyupdown(e.keyCode);
        });
        window.addEventListener('keyup', e => {
            this.keyz[e.keyCode] = false;
            this.onkeyupdown(e.keyCode);
        });
    }

    UNSAFE_componentWillReceiveProps(nextProps) {
        this.getInput(nextProps.objectsInput)
    }

    onkeyupdown = (key) => {
        if (this.state.Person !== null) {
            //-------------------------------------------------------------------- Acceleration
            if (key === 38) {
                if (this.keyz[38] === true) {	      // 38 up arrow press
                    if (!this.Person.Accelerating) {
                        this.Person.Accelerating = true;
                        if (!this.Person.engineBusy) {
                            this.persDrive()
                        }
                    } else {
                        this.Person.Accelerating = true;
                    }
                }
                if (this.keyz[38] === false) {		 // 38 up arrow release
                    if (this.Person.Accelerating === true) {
                        this.Person.Accelerating = false;
                    }
                }
            }
            //-------------------------------------------------------------------- Clutch
            if (key === 32) {
                if (this.keyz[key] === true) {	      // 38 up arrow press
                    if (!this.Person.Clutching) {
                        this.Person.Clutching = true;
                    }
                }
                if (this.keyz[key] === false) {			              // 38 up arrow release
                    if (this.Person.Clutching === true) {
                        this.Person.Clutching = false;
                    }
                }
            }
            //-------------------------------------------------------------------- Break
            if (key === 40) {
                if (this.keyz[key] === true) {				// 40 down arrow press
                    this.Person.Breaking = true;
                }
                if (this.keyz[key] === false) {				// 40 down arrow release
                    if (this.Person.Breaking === true) {
                        this.Person.Breaking = false;
                    }
                }
            }
            //-----------------------------------------------------Me Steering
            //------------------------------ left
            if (key === 37) {
                if (this.keyz[37] === true) {
                    if (!this.Person.SteeringLeft) {
                        this.Person.SteeringLeft = true;
                        if (!this.Person.engineBusy) {
                            // this.persDrive()
                        }
                    }
                }
                if (this.keyz[37] === false) {
                    if (this.Person.SteeringLeft === true) {
                        this.Person.SteeringLeft = false;
                    }
                }
            }
            //------------------------------ right
            if (key === 39) {
                if (this.keyz[39] === true) {
                    if (!this.Person.SteeringRight) {
                        this.Person.SteeringRight = true;
                        if (!this.Person.engineBusy) {
                            // this.persDrive()
                        }
                    }
                }
                if (this.keyz[39] === false) {
                    if (this.Person.SteeringRight === true) {
                        this.Person.SteeringRight = false;
                    }
                }
            }
            //-----------------------------------------------------Me speeds
            if (key === 65) {
                if (this.keyz[65]) {
                    if (!this.Person.ShiftingUp) {
                        this.Person.Clutching = true;
                        this.Person.ShiftingUp = true;
                    }
                } // a
                if (this.keyz[65]) {
                    if (this.Person.ShiftingUp) {
                        if (this.Person.SuperSpeedShift < 2) {
                            this.Person.SuperSpeedShift++;
                        }
                        this.setState({SuperSpeedShift: this.Person.SuperSpeedShift})
                        this.Person.Clutching = false;
                        this.Person.ShiftingUp = false;
                    }
                } // a
            }
            if (key === 90) {
                if (this.keyz[90]) {
                    if (!this.Person.ShiftingDown) {
                        this.Person.Clutching = true;
                        this.Person.ShiftingDown = true;
                    }
                } // z
                if (this.keyz[90]) {
                    if (this.Person.ShiftingDown) {
                        if (this.Person.SuperSpeedShift > 1) {
                            this.Person.SuperSpeedShift--;
                            this.setState({SuperSpeedShift: this.Person.SuperSpeedShift})
                        }
                        this.Person.Clutching = false;
                        this.Person.ShiftingDown = false;
                    }
                } // z
            }
        }
    }

    initSounds = () => {
        this.GeneralVolume = 1
        this.footstep_left_Sound = {};
        this.footstep_right_Sound = {};
        for (let i = 1; i < 4; i++) {
            this.footstep_left_Sound[i] = context.createBufferSource();
            const request_footstep_left = new XMLHttpRequest();
            request_footstep_left.open('GET', 'audio/left' + i + '.ogg', true);
            request_footstep_left.responseType = 'arraybuffer';
            request_footstep_left.onload = () => {
                context.decodeAudioData(request_footstep_left.response, (buffer) => {
                    this.footstep_left_Sound[i].buffer = buffer;
                });
            };
            request_footstep_left.send();
            this.footstep_right_Sound[i] = context.createBufferSource();
            const request_footstep_right = new XMLHttpRequest();
            request_footstep_right.open('GET', 'audio/right' + i + '.ogg', true);
            request_footstep_right.responseType = 'arraybuffer';
            request_footstep_right.onload = () => {
                context.decodeAudioData(request_footstep_right.response, (buffer) => {
                    this.footstep_right_Sound[i].buffer = buffer;
                });
            };
            request_footstep_right.send();
        }
    }

    playSound = (buffer, volume, rate) => {
        const gainNode = context.createGain();
        gainNode.gain.value = volume * this.state.generalVolume;
        gainNode.connect(context.destination);
        const source = context.createBufferSource();
        source.buffer = buffer;
        source.playbackRate.value = rate
        source.connect(gainNode);
        source.start(0);
    }

    getInput = (input) => {
        if (input.Person.EngineOn && !this.state.Person) {
            this.Person.Position = input.Person.Position;
            this.Person.HeadingDeg = input.Person.HeadingDeg;
            this.Person.HeadingCard = angleToCardinal(input.Person.HeadingDeg);
            this.Person.KMHSpeed = 0;
            this.Person.SpeedShift = 1;
            this.Person.StepFrame = 1;
            this.Person.RPM = '';
            const output = {
                Position: this.Person.Position,
                HeadingDeg: this.Person.HeadingDeg,
                HeadingCard: this.Person.HeadingCard,
                KMHSpeed: this.Person.KMHSpeed,
                SpeedShift: this.Person.SpeedShift,
                ShiftData: this.Person.shiftsData[this.Person.SpeedShift],
                StepFrame: this.Person.StepFrame,
                RPM: this.Person.RPM
            }
            this.props.objectSetOutput(this.props.divID, this.props.category, output);
            this.setState({Person: output});
        }
    }

    persDrive = () => {
        this.Person.engineBusy = true;
        this.persSteer()
        this.Person.Motion = (this.Person.Motion > 0) ? this.Person.Motion : 0;
        //------------------------------------------------------- Torque
        if (!this.Person.Clutching) {
            if (this.Person.Accelerating) {
                this.Person.Torque = (this.Person.Torque < this.Person.torqueMax - this.Person.torqueStep) ? this.Person.Torque + this.Person.torqueStep : this.Person.torqueMax;
            } else {
                this.Person.Torque = (this.Person.Torque - this.Person.torqueFriction > 0) ? this.Person.Torque - this.Person.torqueFriction : 0;
            }
        }
        this.Person.Torque = (this.Person.Torque > 0) ? this.Person.Torque : 0;
        this.Person.RPM = this.setRpm(this.Person.Torque * 25);
        //------------------------------------------------------- GearBox
        let shiftAssessed = false;
        this.Person.superShiftsData[this.Person.SuperSpeedShift].speeds.forEach((speed, index) => {
            if (!shiftAssessed && (this.Person.KMHSpeed <= speed || this.Person.Motion === 0)) {
                shiftAssessed = true;
                if (this.Person.SpeedShift !== this.Person.superShiftsData[this.Person.SuperSpeedShift].shifts[index]) {
                    this.Person.SpeedShift = this.Person.superShiftsData[this.Person.SuperSpeedShift].shifts[index]
                    // this.setState({SpeedShift: this.Person.SpeedShift});
                    if (this.Person.Accelerating) {
                        this.Person.propsedTorque = this.Person.Motion / this.Person.shiftsData[this.Person.SpeedShift].ratio + this.Person.torqueStep;
                    } else {
                        this.Person.propsedTorque = this.Person.Motion / this.Person.shiftsData[this.Person.SpeedShift].ratio - this.Person.torqueFriction;
                    }
                    this.Person.propsedTorque = (this.Person.propsedTorque < this.Person.torqueMax) ? this.Person.propsedTorque : this.Person.torqueMax;
                    this.Person.propsedTorque = (this.Person.propsedTorque > 0) ? this.Person.propsedTorque : 0;
                    this.Person.Torque = this.Person.propsedTorque;
                }
            }
        });
        //------------------------------------------------------- Engine
        this.Person.Engine = this.Person.Torque * this.Person.shiftsData[this.Person.SpeedShift].ratio;
        //------------------------------------------------------- Break
        if (this.Person.Breaking === false) {
            this.Person.Break = 0;
        } else {
            this.Person.Break = this.Person.break_adjustor;
        }
        //------------------------------------------------------- Motion
        this.Person.Motion = this.Person.Engine - this.Person.Break;
        this.Person.Motion = (this.Person.Motion < 0) ? 0 : this.Person.Motion;
        this.Person.Motion = (this.Person.Motion < this.Person.superShiftsData[this.Person.SuperSpeedShift].speeds[this.Person.superShiftsData[this.Person.SuperSpeedShift].speeds.length - 1] / this.Person.speed_KM_H_adjustor) ?
            this.Person.Motion : this.Person.superShiftsData[this.Person.SuperSpeedShift].speeds[this.Person.superShiftsData[this.Person.SuperSpeedShift].speeds.length - 1] / this.Person.speed_KM_H_adjustor;
        //------------------------------------------------------- KMHSpeed
        this.Person.KMHSpeed = this.Person.Motion * this.Person.speed_KM_H_adjustor;
        //------------------------------------------------------------------------- Position
        this.Person.Position = gmPoint(
            this.Person.Motion * Math.cos(this.Person.angle) + this.Person.Position.lat(),
            this.Person.Motion * Math.sin(this.Person.angle) + this.Person.Position.lng()
        );
        //------------------------------------------------------------------------------------ Stepping
        let StepFrame = 1;
        if (!this.Person.Accelerating && this.Person.Motion === 0) {
            this.Person.SpeedShift = 0;
            this.playSound(this.footstep_left_Sound[random(1, 3)].buffer, random(50, 70) / 100 + this.Person.KMHSpeed / 10, random(980, 1020) / 900 + this.Person.KMHSpeed / 40)
        } else {
            const frequency_start = this.Person.shiftsData[this.Person.SpeedShift].frequency_start * this.state.settings['gear_' + this.Person.SpeedShift + '_FreqMin'];
            const frequency_end = this.Person.shiftsData[this.Person.SpeedShift].frequency_end * this.state.settings['gear_' + this.Person.SpeedShift + '_FreqMax'];
            const incrementation = frequency_start + this.Person.Torque * (frequency_end - frequency_start);
            const step_incremented = this.Person.Step + incrementation;
            this.Person.Step = (step_incremented < this.Person.shiftsData[this.Person.SpeedShift].frames) ? step_incremented : this.Person.Step + incrementation - this.Person.shiftsData[this.Person.SpeedShift].frames;
            StepFrame = Math.floor(this.Person.Step) + this.Person.shiftsData[this.Person.SpeedShift].start_frame;
        }
        if (StepFrame !== this.Person.StepFrame || this.Person.SpeedShift === 0) {
            this.Person.StepFrame = StepFrame
            //------------------------------------------------------------------------------------ Sound
            if ((this.Person.StepFrame - this.Person.shiftsData[this.Person.SpeedShift].start_frame) % (this.Person.shiftsData[this.Person.SpeedShift].frames / 2) === 3) {
                if ((this.Person.StepFrame - this.Person.shiftsData[this.Person.SpeedShift].start_frame) < (this.Person.shiftsData[this.Person.SpeedShift].frames / 2)) {
                    this.playSound(this.footstep_left_Sound[random(1, 3)].buffer, random(50, 70) / 100 + this.Person.KMHSpeed / 10, random(990, 1010) / 900 + this.Person.KMHSpeed / 40)
                }
                else {
                    this.playSound(this.footstep_right_Sound[random(1, 3)].buffer, random(50, 70) / 100 + this.Person.KMHSpeed / 10, random(990, 1010) / 900 + this.Person.KMHSpeed / 40)
                }
            }
            //------------------------------------------------------------------------------------ Person Output
            const output = {
                Position: this.Person.Position,
                HeadingDeg: this.Person.HeadingDeg,
                HeadingCard: this.Person.HeadingCard,
                KMHSpeed: this.Person.KMHSpeed,
                SpeedShift: this.Person.SpeedShift,
                ShiftData: this.Person.shiftsData[this.Person.SpeedShift],
                StepFrame: this.Person.StepFrame,
                RPM: this.Person.RPM
            }
            this.props.objectSetOutput(this.props.divID, this.props.category, output);
            this.setState({Person: output});
        }
        //----------------------------------------------------------------------------------------------- LOOP OR NOT
        setTimeout(() => {
            if (this.Person.Accelerating || this.Person.Clutching || this.Person.Motion > 0 || this.Person.Torque > 0) {
                this.persDrive()
            } else {
                this.Person.engineBusy = false;
            }
        }, 20);
    }

    persSteer = () => {
        if (this.Person.SteeringLeft || this.Person.SteeringRight) {
            let dir = 0;
            if (this.Person.SteeringLeft) {
                dir = -1
            } else if (this.Person.SteeringRight) {
                dir = 1
            }
            if (dir === 0) {
                this.Person.Steer = (Math.abs(this.Person.Steer) > 3 * this.Person.steeringStep) ? this.Person.Steer - Math.sign(this.Person.Steer) * 3 * this.Person.steeringStep : 0;
            } else {
                if (dir !== -Math.sign(this.Person.Steer)) {
                    this.Person.Steer = (Math.abs(this.Person.Steer) < Math.abs(this.Person.steeringMax) - Math.abs(this.Person.steeringStep)) ? this.Person.Steer + dir * this.Person.steeringStep : dir * this.Person.steeringMax;
                } else {
                    this.Person.Steer = (Math.abs(this.Person.Steer) > 6 * this.Person.steeringStep) ? this.Person.Steer + dir * 6 * this.Person.steeringStep : 0;
                }
            }
            this.Person.angle = this.Person.angle + this.Person.Steer * this.Person.steer_to_angle_adjustor / Math.pow(0.8, this.Person.Motion);
            if (this.Person.angle > 2 * Math.PI) {
                this.Person.angle = this.Person.angle - 2 * Math.PI;
            }
            else if (this.Person.angle < 0) {
                this.Person.angle = this.Person.angle + 2 * Math.PI;
            }
            const tempHeadingDeg = this.Person.angle * 180 / Math.PI;
            this.Person.HeadingDeg = (tempHeadingDeg / 10).toFixed(0) * 10;
            this.Person.HeadingCard = angleToCardinal(this.Person.HeadingDeg)
        }
    }

    setRpm = (rpm) => {
        const max = 24
        const rpmMaxed = (rpm < max) ? rpm : max
        let str = '';
        for (let i = 0; i < rpmMaxed; i++) {
            str += '-';
        }
        return str;
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
        this.setState({settings});
        console.log('----------------------');
        document.getElementsByTagName('body')[0].click()
    };

    renderDash = () => {
        if (!this.state.Person) {
            return null;
        }
        return (
            <div className="dash">
                <div className="HeadingGearsSpeed">
                    <div className="HeadingCard">{this.state.Person.HeadingCard}</div>
                    <div
                        className="SuperShiftSpeed">{this.Person.superShiftsData[this.Person.SuperSpeedShift].name}</div>
                    <div
                        className="ShiftSpeed">{this.state.Person.SpeedShift + ' - ' + this.Person.shiftsData[this.Person.SpeedShift].name}</div>
                    <div className="SimKMHSpeed">{this.state.Person.KMHSpeed.toFixed(0)}</div>
                    <div className="SimKMHSpeedkmh">km/h</div>
                </div>
                <div className="RpmAudioVolume">
                    <div className="RPM">{this.state.Person.RPM}</div>
                    <div className="AudioVolume">
                        <label htmlFor="generalVolume">Audio Volume</label>
                        <input
                            name="generalVolume"
                            type="range" className="slider"
                            min="0" max="2" step="0.05"
                            value={this.state.generalVolume}
                            onChange={(e) => this.setState({generalVolume: Number(e.target.value)})}
                            onInput={(e) => this.setState({generalVolume: Number(e.target.value)})}
                        />
                    </div>
                </div>
            </div>
        );
    }

    render() {
        return (
            <div className="person">
                <div className="wrapper">
                    {this.renderDash()}
                </div>
            </div>
        );
    }
}

export default Person;