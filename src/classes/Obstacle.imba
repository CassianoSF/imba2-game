export class Obstacle
    def constructor
        @position = {
            x: 10000 - Math.random() * 20000
            y: 10000 - Math.random() * 20000
        }
        @rotation = Math.random() * 360
        @size = 10 + Math.random() * 40

    def currentSector
        "{~~(@position.x / 1000)}|{~~(@position.y / 800)}"