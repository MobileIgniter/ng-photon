# ngPhoton AngularJS Wrapper for SoftAP.js #

## Lay of the Land ##

There's an Ionic scaffolding app that has ngPhoton implemented and a simple walkthrough to connect to a Photon (no instructions or anything, so the user has to know to put the Photon into listening mode, get on the Photon's WiFi, etc). You can find that in `/demo`.

The actual library is in `/lib`. `ngPhoton.min.js` is all you need to include, as it has `rsa.min.js` included with it.

## How to use ##

Make sure you include ngPhoton.min.js in your index.html file (or wherever your Javascript files are loaded).

ngPhoton defines its own module (ngPhoton) in your Angular app, so you'll have to remember to add the dependency to your app. After that, you can include the service wherever you need. All of ngPhoton's functions return promises.

Basically, you need to do 3 things:

1. `ngPhoton.deviceInfo()` will tell you whether or not you can talk to the Photon. It'll give you its deviceID.
2. `ngPhoton.scan()` will give you a list of Access Points the Photon can see. You should display these to the user in some way that lets them select which network to connect to. You can check whether or not it's a secured network by inspecting the `sec` property.
3. `ngPhoton.connect({accessPoint, password})` will do 3 things for you: 1) get the device's PublicKey (which isn't actually needed but the Photon needs you to do it), 2) configure the Photon with the wireless info you provided (including password), and 3) tell the Photon to connect to the network.

## Caveats ##

Also your Photon needs to be running firmware version 0.4.4 or better. You can read more about flashing firmware [here](https://github.com/spark/firmware) (it's pretty easy).

## Questions? Comments? Concerns? ##

We'll be adding a "How to Contribute" once we have this on Github and Bower and it's all tidied up. For now, feel free to email [me@bradorego.com](mailto:me@bradorego.com) with any questions/etc. Thanks!
