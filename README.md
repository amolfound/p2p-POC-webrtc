# p2p-POC-webrtc

POC project

- Uses peerjs client library for WebRTC data transfer ( video chunk ) between two peers
- Peer 1 downloads and caches files from main server
- Peer 2 takes the files from peer 1
- modified videojs code to take video file chunks from an available peer instead of http server url

Steps to run
1. git clone https://github.com/amolfound/p2p-POC-webrtc.git
2. cd p2p-POC-webrtc
3. npm install
4. cd src
5. node publisherServer.js
6. Peer1 - https://localhost:4000/peer1.html
7. Play the video to cache files for peer 1
8. Peer2 - https://localhost:4000/peer2.html
9. Play the video to receive files from peer 1 via webRTC
https://peerjs.com/
