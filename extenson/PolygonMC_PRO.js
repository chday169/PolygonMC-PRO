class PolygonMC {

    constructor(runtime) {
        this.runtime = runtime;
        this.tris = [];
    }

    getInfo() {
        return {
            id: 'polygonmc_pro',
            name: 'PolygonMC PRO',

            blocks: [
                {
                    opcode: 'info',
                    blockType: Scratch.BlockType.REPORTER,
                    text: 'status'
                }
            ]
        };
    }

    info() {
        return "OK loaded";
    }
}

Scratch.extensions.register(new PolygonMC());