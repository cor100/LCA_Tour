const AnchorModule = require('AnchorModule');
const {
  AnchorSession,
  AnchorSessionOptions,
} = require('./SpatialAnchors/AnchorSession');
const AnchorComponent = require('./SpatialAnchors/AnchorComponent');
const WorldAnchor = require('./SpatialAnchors/WorldAnchor');
const PinchButton = require('./SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton');

class AnchorPlacementController extends BaseScriptComponent {
  constructor() {
    super();
    this.anchorModule = null;
    this.createAnchorButton = null;
    this.camera = null;
    this.object1 = null;
    this.anchorSession = null;
  }

  async onAwake() {
    this.createEvent('OnStartEvent').bind(() => {
      this.onStart();
    });
  }

  async onStart() {
    // Add listener for button pinch event
    this.createAnchorButton.onButtonPinched.add(() => {
      this.createAnchor(this.object1);
    });

    // Set up AnchorSession options to scan for World Anchors
    const anchorSessionOptions = new AnchorSessionOptions();
    anchorSessionOptions.scanForWorldAnchors = true;

    // Start scanning for anchors
    this.anchorSession = await this.anchorModule.openSession(anchorSessionOptions);

    // Listen for nearby anchors
    this.anchorSession.onAnchorNearby.add(this.onAnchorNearby.bind(this));
  }

  onAnchorNearby(anchor) {
    // Invoked when a new Anchor is found
    print('Anchor nearby: ', anchor);
  }

  async createAnchor(targetObject) {
    if (!targetObject) {
      print("Error: Target object not assigned");
      return;
    }

    // Compute the anchor position 5 units in front of the user
    const toWorldFromDevice = this.camera.getTransform().getWorldTransform();
    const anchorPosition = toWorldFromDevice.mult(
      mat4.fromTranslation(new vec3(0, 0, -5))
    );

    // Create the anchor
    const anchor = await this.anchorSession.createWorldAnchor(anchorPosition);

    // Attach the object to the anchor
    this.attachExistingObjectToAnchor(anchor, targetObject);

    // Save the anchor for future sessions
    try {
      this.anchorSession.saveAnchor(anchor);
      print(`Anchor saved for ${targetObject.name}`);
    } catch (error) {
      print('Error saving anchor: ', error);
    }
  }

  attachExistingObjectToAnchor(anchor, targetObject) {
    if (!targetObject) {
      print("Error: Target object not assigned");
      return;
    }

    // Get or create an AnchorComponent
    let anchorComponent = targetObject.getComponent(AnchorComponent);
    if (!anchorComponent) {
      anchorComponent = targetObject.createComponent(AnchorComponent);
    }

    // Associate the object with the anchor
    anchorComponent.anchor = anchor;
  }
}

module.exports = AnchorPlacementController;
