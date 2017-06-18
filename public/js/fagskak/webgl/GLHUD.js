function GLHUD(board) {
    this.hudCanvas = document.createElement('canvas');
    this.resize();
    this.hudBitmap = document.getContext('2d');
    hudBitmap.font = "Normal 40px Arial";
    hudBitmap.textAlign = 'center';
    hudBitmap.fillStyle = "rgba(245,245,245,0.75)";
    hudBitmap.fillText('Initializing...', width / 2, height / 2);
}

GLHUD.prototype = {
    resize: function() {
        var boundingBox = this.board.container.getBoundingClientRect();
        hudCanvas.width = boundingBox.width;
        hudCanvas.height = boundingBox.height;
        
        
    }
}