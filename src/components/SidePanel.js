import React, {Component} from 'react';

class SidePanel extends Component {

    constructor() {
        super();
        this.state = {
            substate: false
        };
    }
    render() {
        return (
            <div className="SidePanel">
                <div className="title">Instructions:</div>
                <div>Just walk around on Google maps and the blue and red cameras will follow you.</div>
                <div>Try walking on the streets at 3-4 km/h or jog at 7-8 km/h.</div>
                <div>Accelerate to wanted speed and press the SpaceBar to keep going at that speed.</div>
                <br/>
                <div className="title">Operation:</div>
                <div><img src="img/arrowkeys.jpg" alt="arrow keys"/></div>
                <div>Arrow Up is your Accelerator.</div>
                <div>Steer with Left and Right Arrows</div>
                <div>SpaceBar is your Cruise Control. The speed remains constant for as long as you hold it down.</div>
                <div>There are 6 speeds but they work in a semi-automatic way. The 6 speeds are grouped into 2 super-speeds (walking and running). Use the A key for running and the Z key for walking.</div>
                <br/>
                <div className="title">How I made this:</div>
                <div>After finishing the Motorcycles demo, I thought that I can take the engine part and add a steps function that will generate a patterned count along with the horizontal movement.</div>
                <div>I constructed the walking and running patterns using Poser and I decided that a step should be 4 frames. Which means that a pattern (2 steps) should be 8 frames. 8 frames x 6 kinds of walks + 1 frame for the standing position = 49 pictures. Just like with the Motorcycles, I rotate the scene and I make a 49 frame movie for every degree. In fact I actually make 2 movies as there's a 45 deg view for the map and a horizontal one for the Street View. To that, you can add another horizontal 49 double-sized pics movie set for when the person gets very close to the camera.</div>
                <div>The cameras are made in Poser and rotated the same way as the person except pictures are taken for every degree. The 2 cameras have a function called lookAtMe() that keeps rotating the cameras towards the person. There are 2 other functions: panToMeFront() and panToMeBack() that allow the cameras to follow the person. The Red Camera has panToMeFront() enabled. This means that the Red Camera will place itself in front of the Person and stay there until the Person passes it. The Blue Camera has panToMeBack() enabled. The script places the camera close behind the Person and waits till the Person is at a certain distance.</div>
                <div>For the sounds of the foot steps, I recorded (off the internet) 3 samples of steps for each foot. Every time the person's left foot touches the ground, one of the 3 samples is played randomly with a random volume and a random frequency to break the monotony.</div>
                <div>The size of the Person in the StreetView is always the same. The size of the StreetView Picture is determined by the height and width of the DIV containing it. For now I haven't linked the size of the Person with the size of the StreetView as I couldn't determine what their resize algorithm is. So, depending on the wdith of your browser the Person might apear as a giant or as a midget or somewhere in between.</div>
                <br/>
                <div className="title">Too bad:</div>
                <div>Too bad that Google Street View does not have a tiles_loaded callback like Google maps does.</div>
                <div>Because of it, I was forced to hook the callback to another event that fires way before all tiles are loaded. The script will bug and the camera will stop working if loading is too long.</div>
                <div>Street View also stops loading tiles while rotating or has a moving marker. This is why I have to stop moving the camera and the person and even hide the person while loading. I also added a black screen that hides the Streetview while loading.</div>
                <div>Another thing to mention is that Street View is very far from being accurate. I tried to size my person compering to the height of people on the street but all images are inconsistently stretched.</div>
                <div>Last but not least, Google insists on resizing the markers according to distance and they don't do it very well. To add to this, when markers get close to the "camera" they become bigger until a certain point and then smaller and smaller for some reason. I tried to create a formula that resizes back, it works but the image becomes a little jumpy, most likely because there are 2 functions pulling on the same marker.</div>

            </div>
        );
    }
}

export default SidePanel;