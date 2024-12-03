import { AnchorModule } from './SpatialAnchors/AnchorModule';
import {
  AnchorSession,
  AnchorSessionOptions,
} from './SpatialAnchors/AnchorSession';
import { AnchorComponent } from './SpatialAnchors/AnchorComponent';
import { WorldAnchor } from './SpatialAnchors/WorldAnchor';

import { PinchButton } from './SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';

@component
export class MainScript extends BaseScriptComponent {
  @input anchorModule: AnchorModule;
  @input createAnchorButton: PinchButton;

  @input camera: SceneObject;
  @input object1: SceneObject; 

  private anchorSession?: AnchorSession;

  async onAwake() {
    this.createEvent('OnStartEvent').bind(() => {
      this.onStart();
    });
  }

  async onStart() {
    this.createAnchorButton.onButtonPinched.add(() => {
      this.createAnchor(this.object1);
    });

    // Set up the AnchorSession options to scan for World Anchors
    const anchorSessionOptions = new AnchorSessionOptions();
    anchorSessionOptions.scanForWorldAnchors = true;

    // Start scanning for anchors
    this.anchorSession =
      await this.anchorModule.openSession(anchorSessionOptions);

    // Listen for nearby anchors
    this.anchorSession.onAnchorNearby.add(this.onAnchorNearby.bind(this));
  }

  public onAnchorNearby(anchor: Anchor) {
    // Invoked when a new Anchor is found
//      this.attachExistingObjectToAnchor(anchor, this.object1);
  }

  private async createAnchor(targetObject: SceneObject) {
    // Compute the anchor position 5 units in front of user
    let toWorldFromDevice = this.camera.getTransform().getWorldTransform();
    let anchorPosition = toWorldFromDevice.mult(
      mat4.fromTranslation(new vec3(0, 0, -5))
    );

    // Create the anchor
    let anchor = await this.anchorSession.createWorldAnchor(anchorPosition);

    // Create the object and attach it to the anchor
    this.attachExistingObjectToAnchor(anchor, targetObject);

    // Save the anchor so it's loaded in future sessions
    try {
        this.anchorSession.saveAnchor(anchor);
        print("Anchor saved for ${targetObject.name}");
    } catch (error) {
      print('Error saving anchor: ' + error);
    }
  }

  private attachExistingObjectToAnchor(anchor: WorldAnchor, targetObject: SceneObject) {
    // Create a new object from the prefab
//    let object: SceneObject = this.prefab.instantiate(this.getSceneObject());
//    object.setParent(this.getSceneObject());
    if (!targetObject){
            print("error: Target object not assigned")
            return;
        }
    // Associate the anchor with the object by adding an AnchorComponent to the
    // object and setting the anchor in the AnchorComponent.
    let anchorComponent = targetObject.getComponent(requireType("AnchorComponent") as keyof ComponentNameMap) as AnchorComponent;    
    if (!anchorComponent){
        anchorComponent = targetObject.createComponent(requireType("AnchorComponent") as keyof ComponentNameMap) as AnchorComponent;
    }
//    let anchorComponent = object.createComponent(
//      requireType('AnchorComponent')
//    );
    anchorComponent.anchor = anchor;
  }
}