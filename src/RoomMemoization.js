class RoomMemo {
    constructor() {
      this.roomData = new Map();
    }
  
    initRoom(roomId) {
        if (!this.roomData.has(roomId)) {
          this.roomData.set(roomId, []);
        }
        return this.roomData.get(roomId); 
    }
      
  
    addUpdateElemnt(roomId, novoElemento) {
        let room = this.roomData.get(roomId);
        if (!room) {
          room = this.initRoom(roomId);
        }
      
        const index = room.findIndex(el => el.id === novoElemento.id);
      
        if (index !== -1) {
          // Atualiza somente os campos alterados
          const atual = room[index];
          room[index] = { ...atual, ...novoElemento };
        } else {
          room.push(novoElemento);
          if (room.length > 5) {
            room.shift(); // remove o mais antigo
          }
        }
    }
      

    removeElemnt(roomId, id) {
    const room = this.roomData.get(roomId);
    if (!room) return;
    this.roomData.set(
        roomId,
        room.filter(el => el.id !== id)
    );
    }
    
    clearRoom(roomId) {
        this.roomData.set(roomId, []);
    } 

    getState(roomId) {
      return this.roomData.get(roomId) || [];
    }

    get(roomId) {
      return this.roomData.get(roomId);
    }
}
module.exports = RoomMemo;