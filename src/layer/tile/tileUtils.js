import { Point, Pixel } from '@/geometry';

export default {

    getTileCenterOffset(pixel) {
        const tileSize = this.getSize();

        return {
            x: tileSize / 2 - pixel.x % tileSize,
            y: 0,
            z: tileSize / 2 - pixel.y % tileSize
        }
    },

    // 获取瓦片坐标
    getTilePoint(pixel) {
        let x = Math.ceil(pixel.x / 256) - 1;
        let y = Math.ceil(pixel.y / 256) - 1;

        return new Point(x, y);
    },

    getSize() {
        return 256;
    },

    minZoom: 3,

    getBounds(mapInstance) {

    },

    getTileQueue(tilePoint, mapSize, zoom, offset) {
        const { width, height } = mapSize;
        const tileSize = this.getSize();

        const halfX = Math.floor(width / tileSize / 2);
        const startX = tilePoint.x - halfX;
        const endX = tilePoint.x + halfX;

        const halfY = Math.floor(height / tileSize / 2);
        const startY = tilePoint.y + halfY;
        const endY = tilePoint.y - halfY;

        const queue = [];

        for (let y = startY; y >= endY; y--) {
            for (let x = startX; x <= endX; x++) {
                const coords = new Pixel(x, y, zoom);
                coords._x = (x - startX) * tileSize - width / 2 + offset.x;
                coords._y = -1 - offset.y;
                coords._z = (startY - y) * tileSize - height / 2 - offset.z;
                queue.push(coords);
            }
        }

        return queue;
    },

    tilesQueue: [],

    fadeInAnimId: null,

    clearTransition(clearQueue = false) {
        cancelAnimationFrame(this.fadeInAnimId);
        if (clearQueue) {
            this.tilesQueue = [];
        }
    },

    fadeIn(tile, next) {
        this.clearTransition();
        this.tilesQueue.push(tile);

        const anim = () => {
            let done = true;
            this.tilesQueue.forEach((tile) => {
                if (tile.material.opacity < 1) {
                    tile.material.opacity += 0.02;
                    done = false;
                }
            });

            if (done === false) {
                next();
                this.fadeInAnimId = requestAnimationFrame(anim);
            }
            else {
                this.clearTransition();
            }
        }

        anim();
    },

    fadeOut(tiles, next) {
        const anim = () => {
            let done = true;

            tiles.forEach((tileInstance) => {
                if (tileInstance.getTile().material.opacity > 0) {
                    tileInstance.getTile().material.opacity -= 0.02;
                    done = false;
                }
                else {
                    if (!tileInstance.isDestory) {
                        next(tileInstance);
                    }
                }
            });

            if (done === false) {
                this.fadeoutAnimId = requestAnimationFrame(anim);
            }
            else {
                cancelAnimationFrame(this.fadeoutAnimId);
            }
        }

        anim();
    }
}
