## HAW Challenge

Visit under [abenjamins.com](abenjamins.com)

This is my entry as the programming task for the digital reality masters programme at the HAW.


### Approach
I set myself the challenge to not rely on frameworks like unity, as I have used it in the past and have heard good things about three.js.
This demonstration is meant to show my coding abilities, rather then my skills in 3d modelling or in game development engines like unity. 

To keep the project flexible, I decided to split the game logic and the control logic into two separate parts. 
The game just receives input from either the keyboard, or later the face tracking.

As the app should be web-based, I decided on using TypeScript, which is a version of JavaScript which implements some form of type security, and makes programming and debugging a lot easier.

During the development, I often faced the limitations of JavaScript, primarily in Closure. 
Most modern development frameworks have some kind of state management and data flow principles.
I solved the data flow problem at least partially, by dispatching custom events.
```
  let event = new CustomEvent(CustomGameEvents.ControlInput, {
      detail: { dir },
    });
  document.dispatchEvent(event);
```

### Face tracking (control logic)
For the face tracking controls, I closely followed the youtube videos of ["Web dev simplified"](https://www.youtube.com/watch?v=CVClHLwv-4I).
The face-api library is also available as a nodejs module, which made installation easy, as my project is setup as a [ViteJs](https://vitejs.dev/) server, which runs on top of nodejs-
I am using pretrained models for the face tracking, they are also provided in the [project files](https://github.com/WebDevSimplified/Face-Detection-JavaScript) of Web dev simplified.

Face-Api provides built in tracing for the tracking data, but since I wanted more granular control and had to mirror the video anyways, I have decided to write a custom bounding box drawing function.

Abstracting the control logic from a keyboard seemed intuitive, so I have created two trigger zones in which the user can move their head to steer either left or right.

### Game logic 
I won't explain the game logic too much here, as I have documented the code quite extensively, but not using a game framework meant that I had to implement even the most basic logic myself. 
Accelerating the boat smoothly required a custom acceleration logic, spawning and hitting enemies had to be managed and collision detection with invisible bounding boxes had to be implemented. 


### What would I do differently now
Using the center of the face as the "trigger" for facetracking seemed intuitive in the beginning, but after several test users tried the game, 
I noticed that the users would try to steer by tilting their head, rather than moving side to side. This could be solved if the nose (which is tracked by face-api) is used as the trigger.

The trigger based approach, like keeping a button pressed either on or of, could also be improved. In a new approach, I would calculate the distance of the face from the center to either left or right, and use that value as the speed/acceleration. 
The trigger steering makes small maneuvers difficult, as the user has to "press" the trigger zone really quickly. 
If the distance from the center relates to the speed, the user can make small adjustments.

Basing the project on pure TypeScript did seem like a good idea initially, but the shortcomings of pure JavaScript were too severe. 
State management is very difficult, since the variables are spread over several files, programming paradigms like functional programming were basically impossible and 
three.js is built in an outdated way. 
Should I build a three.js application again, I would definitely use a framework like Reactjs or Vuejs to have a component based element tree and a solid state management.
But even then, a game framework like Unity or Unreal would probably be the best choice in the end, as they are purpose built and come with a proper physics system as well as 
unit based logic like colliders and events.  

There are many things that I had in mind, but just didn't had the time to implement. I am looking forward to working on 
digital reality projects together with you. 

#### Other sources

[water texture](https://3dtextures.me/2017/12/28/water-001/)

[boat model](https://sketchfab.com/3d-models/fishing-boat-e07c8b9cc38543879a4e2fe145e62df6)

[heart model](https://sketchfab.com/3d-models/heart-9e18b3a1d41e458ab38c44c336e2841d)

[rubber duck model](https://www.cgtrader.com/free-3d-models/sports/toy/rubber-duck-b31f3585-0347-4532-bd92-7ddea6107d0d)

[beer can](https://www.cgtrader.com/free-3d-models/food/beverage/generic-beverage-can)

[skybox textures](https://kindaw.itch.io/skybox-textures)



