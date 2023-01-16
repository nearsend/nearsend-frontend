import io from 'socket.io-client';

let socketIo: any;

export default class Socket {
  getInstance = () => {
    if (socketIo == null) {
      socketIo = io(`${import.meta.env.VITE_SOCKET_URL}`, {
        secure: true,
        reconnection: true,
        rejectUnauthorized: false,
        transports: ['websocket'],
      });

      socketIo.on('connect', () => {
        console.log('connect=', 'connect');
      });
      socketIo.on('disconnect', () => {
        console.log('------------disconnect-socket------------');
      });
    }
    return socketIo;
  };

  removeInstance = () => {
    socketIo = null;
  };
}
