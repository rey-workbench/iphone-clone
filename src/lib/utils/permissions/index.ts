import { requestMicrophone } from './microphone';
import { requestCamera } from './camera';

export class Permissions {
    /**
     * Request microphone permission from the user
     */
    static requestMicrophone = requestMicrophone;

    /**
     * Request camera permission (for future FaceTime or Camera app)
     */
    static requestCamera = requestCamera;
}
