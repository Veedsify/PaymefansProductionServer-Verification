/**
 * Camera Diagnostics Utility
 * Helps debug camera permission and access issues
 */

export interface CameraDiagnostics {
    hasGetUserMedia: boolean;
    hasPermissionsAPI: boolean;
    permissionState?: PermissionState;
    availableDevices: MediaDeviceInfo[];
    error?: string;
}

export const runCameraDiagnostics = async (): Promise<CameraDiagnostics> => {
    const diagnostics: CameraDiagnostics = {
        hasGetUserMedia: false,
        hasPermissionsAPI: false,
        availableDevices: [],
    };

    try {
        // Check if getUserMedia is available
        diagnostics.hasGetUserMedia = !!(
            navigator.mediaDevices && navigator.mediaDevices.getUserMedia
        );

        // Check if Permissions API is available
        diagnostics.hasPermissionsAPI = !!navigator.permissions;

        // Check permission state if available
        if (diagnostics.hasPermissionsAPI) {
            try {
                const permission = await navigator.permissions.query({
                    name: 'camera' as PermissionName
                });
                diagnostics.permissionState = permission.state;
            } catch (error) {
                console.log('Permission query failed:', error);
            }
        }

        // Get available devices
        if (diagnostics.hasGetUserMedia) {
            try {
                const devices = await navigator.mediaDevices.enumerateDevices();
                diagnostics.availableDevices = devices.filter(
                    device => device.kind === 'videoinput'
                );
            } catch (error) {
                console.log('Device enumeration failed:', error);
            }
        }

    } catch (error) {
        diagnostics.error = error instanceof Error ? error.message : 'Unknown error';
    }

    return diagnostics;
};

export const printCameraDiagnostics = async (): Promise<void> => {
    const diagnostics = await runCameraDiagnostics();

    console.group('📹 Camera Diagnostics');
    console.log('Has getUserMedia:', diagnostics.hasGetUserMedia);
    console.log('Has Permissions API:', diagnostics.hasPermissionsAPI);
    console.log('Permission State:', diagnostics.permissionState || 'Unknown');
    console.log('Video Input Devices:', diagnostics.availableDevices.length);

    diagnostics.availableDevices.forEach((device, index) => {
        console.log(`  Device ${index + 1}:`, {
            deviceId: device.deviceId,
            label: device.label || 'Unknown Device',
            groupId: device.groupId,
        });
    });

    if (diagnostics.error) {
        console.error('Diagnostics Error:', diagnostics.error);
    }
    console.groupEnd();
};

export const testCameraAccess = async (): Promise<{
    success: boolean;
    error?: string;
    stream?: MediaStream;
    videoElement?: HTMLVideoElement;
}> => {
    try {
        console.log('🎥 Testing camera access...');

        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'user',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        console.log('✅ Camera stream obtained');

        // Test if we can create and attach video element
        const videoElement = document.createElement('video');
        videoElement.srcObject = stream;
        videoElement.muted = true;
        videoElement.playsInline = true;

        try {
            await videoElement.play();
            console.log('✅ Video element can play stream');

            // Wait a bit to check if video dimensions are available
            await new Promise(resolve => setTimeout(resolve, 1000));

            if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
                console.log('✅ Video dimensions available:', videoElement.videoWidth, 'x', videoElement.videoHeight);
            } else {
                console.log('⚠️  Video dimensions not yet available');
            }

        } catch (playError) {
            console.log('⚠️  Video play failed (might be OK):', playError);
        }

        console.log('✅ Camera access test successful');
        return { success: true, stream, videoElement };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('❌ Camera access test failed:', errorMessage);
        return { success: false, error: errorMessage };
    }
};

export const debugCameraSetup = async (): Promise<void> => {
    console.group('🔧 Camera Setup Debug');

    const diagnostics = await runCameraDiagnostics();
    console.log('Diagnostics:', diagnostics);

    const test = await testCameraAccess();
    console.log('Test result:', test);

    if (test.stream) {
        console.log('Stream tracks:', test.stream.getTracks().map(track => ({
            kind: track.kind,
            label: track.label,
            enabled: track.enabled,
            readyState: track.readyState
        })));

        // Clean up test stream
        test.stream.getTracks().forEach(track => track.stop());
    }

    console.groupEnd();
};
