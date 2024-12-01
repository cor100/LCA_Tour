import { AnchorModule } from './Spatial Anchors/AnchorModule';
import {
  AnchorSession,
  AnchorSessionOptions,
} from './Spatial Anchors/AnchorSession';
import { AnchorComponent } from './Spatial Anchors/AnchorComponent';
import { WorldAnchor } from './Spatial Anchors/WorldAnchor';

import { PinchButton } from './SpectaclesInteractionKit/Components/UI/PinchButton/PinchButton';

@component
export class NewScript extends BaseScriptComponent {
    @input anchorModule: AnchorModule;
    @input createAnchorButton: PinchButton;
    
    @input camera: SceneObject;
    @input prefab: ObjectPrefab;
    @input parent: SceneObject;
    
    private anchorSession?: AnchorSession;

    async onAwake() {
        this.createEvent('OnStartEvent').bind(() => {
          this.onStart();
        });
    }
    async onStart(){
        this.createAnchorButton.onButtonPinched.add(() => {
            this.createAnchor();
            print("Anchor created");
        })
        // Set up the AnchorSession options to scan for World Anchors
        const anchorSessionOptions = new AnchorSessionOptions();
        anchorSessionOptions.scanForWorldAnchors = true;
    
        // Start scanning for anchors
        this.anchorSession =
          await this.anchorModule.openSession(anchorSessionOptions);
    
        // Listen for nearby anchors
        this.anchorSession.onAnchorNearby.add(this.onAnchorNearby.bind(this));
    }

    
    private async createAnchor() {
        print("createanchor")
        // Compute the anchor position 5 units in front of user
        let toWorldFromDevice = this.camera.getTransform().getWorldTransform();
        let anchorPosition = toWorldFromDevice.mult(
          mat4.fromTranslation(new vec3(0, 0, -5))
        );
        
        // Create the anchor
        let anchor = await this.anchorSession.createWorldAnchor(anchorPosition);
        
        print(anchor +"anchor")
        // Create the object and attach it to the anchor
        this.attachObjectToAnchor(anchor);
        
        // Save the anchor so it's loaded in future sessions
        try {
          this.anchorSession.saveAnchor(anchor);
        } catch (error) {
          print('Error saving anchor: ' + error);
        }
    }
    
    public onAnchorNearby(anchor: Anchor) {
    // Invoked when a new Anchor is found
    } 
    
    private attachObjectToAnchor(anchor: WorldAnchor) {
        // Create a new object from the prefab
        let object: SceneObject = this.prefab.instantiate(this.getSceneObject());
        
        print("set parent");
        object.setParent(this.parent);
       
        
//        print("object created");
//        let fovFollowComponent = object.getComponent(
//            "Component.FOVFollow" as keyof ComponentNameMap
//        );
//
//        if (fovFollowComponent) {
//            fovFollowComponent.enabled = false;
//            print("FOV Follow disabled for the object.");
//        }
        let anchorTransform = anchor._sceneObject.getTransform();
        object.getTransform().setWorldPosition(anchorTransform.getWorldPosition());
        object.getTransform().setWorldRotation(anchorTransform.getWorldRotation());
    
        // Associate the anchor with the object by adding an AnchorComponent to the
        // object and setting the anchor in the AnchorComponent.
        let anchorComponent = object.createComponent(
          requireType("AnchorComponent") as keyof ComponentNameMap) as AnchorComponent;
        anchorComponent.anchor = anchor;
    }
    
}
