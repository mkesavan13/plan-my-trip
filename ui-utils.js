// UI Utility Functions - Add these to your app
// These functions handle all UI manipulations so SDK code stays clean

// HTML element references - get all elements at the top
const videoModal = document.getElementById('video-chat-modal');
const videoLoader = document.getElementById('video-loader');
const videoChatWindow = document.getElementById('video-chat-window');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const remoteAudio = document.getElementById('remote-audio');
const startVideoChatBtn = document.getElementById('start-video-chat');
const acceptCallBtn = document.getElementById('accept-call');
const endCallBtn = document.getElementById('end-call');
const closeVideoChatBtn = document.getElementById('close-video-chat');
const muteAudioBtn = document.getElementById('mute-audio');
const muteVideoBtn = document.getElementById('mute-video');
const incomingCall = document.getElementById('incoming-call');

function showVideoLoader() {
    console.log('Showing video loader...');
    if (videoModal) videoModal.style.display = 'flex';
    if (videoLoader) videoLoader.style.display = 'flex';
    if (videoChatWindow) videoChatWindow.style.display = 'none';
}

function hideVideoLoader() {
    console.log('Hiding video loader and showing video chat...');
    if (videoLoader) videoLoader.style.display = 'none';
    if (videoChatWindow) videoChatWindow.style.display = 'block';
}

function hideVideoModal() {
    console.log('Hiding video modal...');
    if (videoModal) videoModal.style.display = 'none';
}

function toggleLocalVideo(show) {
    if (localVideo) {
        localVideo.style.display = show ? 'block' : 'none';
        console.log('Local video ' + (show ? 'shown' : 'hidden'));
    }
}

function updateMuteButton(buttonElement, isMuted, type) {
    if (!buttonElement) return;
    
    if (type === 'audio') {
        if (isMuted) {
            buttonElement.innerHTML = '<span class="icon">🔇</span><span class="label">Unmute Audio</span>';
        } else {
            buttonElement.innerHTML = '<span class="icon">🔊</span><span class="label">Mute Audio</span>';
        }
    } else if (type === 'video') {
        if (isMuted) {
            buttonElement.innerHTML = '<span class="icon">📷</span><span class="label">Unmute Video</span>';
        } else {
            buttonElement.innerHTML = '<span class="icon">📹</span><span class="label">Mute Video</span>';
        }
    }
}

function clearVideoElements() {
    console.log('Clearing video elements...');
    if (localVideo) localVideo.srcObject = null;
    if (remoteVideo) remoteVideo.srcObject = null;
    if (remoteAudio) remoteAudio.srcObject = null;
}

function setLocalVideoStream(stream) {
    if (localVideo) {
        localVideo.srcObject = stream;
        localVideo.autoplay = true;
        localVideo.muted = true;
        localVideo.volume = 0;
        localVideo.controls = false;
        localVideo.setAttribute('playsinline', 'true');
        localVideo.setAttribute('disablePictureInPicture', 'true');
        localVideo.play().catch(e => console.log('Local video play error:', e));
    }
}

function setRemoteVideoStream(stream) {
    if (remoteVideo) {
        remoteVideo.srcObject = stream;
        remoteVideo.autoplay = true;
        remoteVideo.muted = false;
        remoteVideo.volume = 1.0;
        remoteVideo.controls = false;
        remoteVideo.setAttribute('playsinline', 'true');
        remoteVideo.setAttribute('disablePictureInPicture', 'true');
        remoteVideo.play().catch(e => console.log('Remote video play error:', e));
    }
}

function setRemoteAudioStream(stream) {
    if (remoteAudio) {
        remoteAudio.srcObject = stream;
        remoteAudio.autoplay = true;
        remoteAudio.muted = false;
        remoteAudio.volume = 1.0;
        remoteAudio.play().catch(e => console.log('Remote audio play error:', e));
    }
}

function stopAllMediaStreams(localStream, localMedia) {
    console.log('Stopping all media streams...');
    
    // Stop getUserMedia stream
    if (localStream && typeof localStream.getTracks === 'function') {
        localStream.getTracks().forEach(track => {
            track.stop();
            console.log('Stopped track:', track.kind);
        });
    }
    
    // Stop Webex SDK camera stream
    if (localMedia.cameraStream) {
        try {
            // Check if it has getTracks method (regular MediaStream)
            if (typeof localMedia.cameraStream.getTracks === 'function') {
                localMedia.cameraStream.getTracks().forEach(track => {
                    track.stop();
                    console.log('Stopped camera track:', track.kind);
                });
            }
            // Check if it has stop method (Webex SDK stream object)
            else if (typeof localMedia.cameraStream.stop === 'function') {
                localMedia.cameraStream.stop();
                console.log('Stopped Webex camera stream');
            }
            // Check if it has outputStream property (Webex SDK wrapper)
            else if (localMedia.cameraStream.outputStream && typeof localMedia.cameraStream.outputStream.getTracks === 'function') {
                localMedia.cameraStream.outputStream.getTracks().forEach(track => {
                    track.stop();
                    console.log('Stopped camera output track:', track.kind);
                });
            }
        } catch (error) {
            console.log('Error stopping camera stream:', error);
        }
    }
    
    // Stop Webex SDK microphone stream
    if (localMedia.microphoneStream) {
        try {
            // Check if it has getTracks method (regular MediaStream)
            if (typeof localMedia.microphoneStream.getTracks === 'function') {
                localMedia.microphoneStream.getTracks().forEach(track => {
                    track.stop();
                    console.log('Stopped microphone track:', track.kind);
                });
            }
            // Check if it has stop method (Webex SDK stream object)
            else if (typeof localMedia.microphoneStream.stop === 'function') {
                localMedia.microphoneStream.stop();
                console.log('Stopped Webex microphone stream');
            }
            // Check if it has outputStream property (Webex SDK wrapper)
            else if (localMedia.microphoneStream.outputStream && typeof localMedia.microphoneStream.outputStream.getTracks === 'function') {
                localMedia.microphoneStream.outputStream.getTracks().forEach(track => {
                    track.stop();
                    console.log('Stopped microphone output track:', track.kind);
                });
            }
        } catch (error) {
            console.log('Error stopping microphone stream:', error);
        }
    }
    
    console.log('All media streams stopped');
}