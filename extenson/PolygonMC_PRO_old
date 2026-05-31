(function(Scratch){
'use strict';

class PolygonMC {

    constructor(){

        this.version = "1.0.0";
        this.author = "Ching-Her Day (戴清河, chday169)";

        this.expr = "x*x+y*y+z*z-0.25";

        this.fn = (x,y,z)=>x*x+y*y+z*z-0.25;

        this.tris = [];
    }

    //--------------------------------------------------
    // SAFE FUNCTION COMPILER
    //--------------------------------------------------
    buildFn(expr){

        try{

            this.fn = new Function(
                'x','y','z',
                `
                try{
                    return (${expr});
                }catch(e){
                    return 1;
                }
                `
            );

        }catch(e){

            this.fn = (x,y,z)=>1;
        }
    }

    //--------------------------------------------------
    getInfo(){

        return {

            id:'polygonmc_pro',

            name:'PolygonMC PRO',

            color1:'#2d8cff',
            color2:'#1b5fbf',

            blocks:[

                {
                    opcode:'setFunc',
                    blockType:Scratch.BlockType.COMMAND,
                    text:'set function f(x,y,z) = [F]',
                    arguments:{
                        F:{
                            type:Scratch.ArgumentType.STRING,
                            defaultValue:'x*x+y*y+z*z-0.25'
                        }
                    }
                },

                {
                    opcode:'build',
                    blockType:Scratch.BlockType.COMMAND,
                    text:'build surface size [N]',
                    arguments:{
                        N:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:14
                        }
                    }
                },

                {
                    opcode:'triangleCount',
                    blockType:Scratch.BlockType.REPORTER,
                    text:'triangle count'
                },

                {
                    opcode:'triangle',
                    blockType:Scratch.BlockType.REPORTER,
                    text:'triangle [I] [AX]',
                    arguments:{
                        I:{
                            type:Scratch.ArgumentType.NUMBER,
                            defaultValue:1
                        },
                        AX:{
                            type:Scratch.ArgumentType.STRING,
                            menu:'AXIS'
                        }
                    }
                },

                {
                    opcode:'info',
                    blockType:Scratch.BlockType.REPORTER,
                    text:'engine info'
                }
            ],

            menus:{
                AXIS:{
                    items:['x','y','z']
                }
            }
        };
    }

    //--------------------------------------------------
    setFunc(args){

        this.expr = args.F;

        this.buildFn(this.expr);

        this.tris = [];
    }

    //--------------------------------------------------
    eval(x,y,z){
        return this.fn(x,y,z);
    }

    //--------------------------------------------------
    interpolate(p1,p2,v1,v2){

        const t = v1/(v1-v2);

        return [
            p1[0] + t*(p2[0]-p1[0]),
            p1[1] + t*(p2[1]-p1[1]),
            p1[2] + t*(p2[2]-p1[2])
        ];
    }

    //--------------------------------------------------
    sortPoly(poly){

        const c=[0,0,0];

        for(const p of poly){
            c[0]+=p[0];
            c[1]+=p[1];
            c[2]+=p[2];
        }

        c[0]/=poly.length;
        c[1]/=poly.length;
        c[2]/=poly.length;

        const sorted = poly.map(p=>{

            const dx=p[0]-c[0];
            const dy=p[1]-c[1];

            return {
                p,
                a: Math.atan2(dy,dx)
            };
        });

        sorted.sort((a,b)=>a.a-b.a);

        return sorted.map(v=>v.p);
    }

    //--------------------------------------------------
    triangulate(poly){

        const tris=[];

        let cx=0,cy=0,cz=0;

        for(const p of poly){
            cx+=p[0];
            cy+=p[1];
            cz+=p[2];
        }

        cx/=poly.length;
        cy/=poly.length;
        cz/=poly.length;

        const center=[cx,cy,cz];

        for(let i=0;i<poly.length;i++){

            tris.push([
                center,
                poly[i],
                poly[(i+1)%poly.length]
            ]);
        }

        return tris;
    }

    //--------------------------------------------------
    build(args){

        const MAX = 18;

        const N = Math.min(
            MAX,
            Math.max(6, Math.floor(args.N))
        );

        const step = 2/(N-1);

        const lin = new Array(N);

        for(let i=0;i<N;i++)
            lin[i] = -1 + i*step;

        const fn = (x,y,z)=>this.fn(x,y,z);

        const edges = [
            [0,1],[0,2],[0,4],
            [1,3],[1,5],
            [2,3],[2,6],
            [3,7],
            [4,5],[4,6],
            [5,7],[6,7]
        ];

        const tris = [];

        try{

            for(let i=0;i<N-1;i++)
            for(let j=0;j<N-1;j++)
            for(let k=0;k<N-1;k++){

                const x=lin[i],x1=lin[i+1];
                const y=lin[j],y1=lin[j+1];
                const z=lin[k],z1=lin[k+1];

                const pts=[
                    [x,y,z],
                    [x,y,z1],
                    [x,y1,z],
                    [x,y1,z1],
                    [x1,y,z],
                    [x1,y,z1],
                    [x1,y1,z],
                    [x1,y1,z1]
                ];

                const val=[
                    fn(...pts[0]),
                    fn(...pts[1]),
                    fn(...pts[2]),
                    fn(...pts[3]),
                    fn(...pts[4]),
                    fn(...pts[5]),
                    fn(...pts[6]),
                    fn(...pts[7])
                ];

                let pos=false,neg=false;

                for(let v of val){
                    if(v<0) neg=true;
                    else pos=true;
                    if(pos&&neg) break;
                }

                if(!(pos&&neg)) continue;

                const poly=[];

                for(let e=0;e<12;e++){

                    const a=edges[e][0];
                    const b=edges[e][1];

                    const va=val[a];
                    const vb=val[b];

                    if(va*vb<0){

                        poly.push(
                            this.interpolate(
                                pts[a],
                                pts[b],
                                va,
                                vb
                            )
                        );
                    }
                }

                if(poly.length<3) continue;

                const sorted = this.sortPoly(poly);

                tris.push(
                    ...this.triangulate(sorted)
                );
            }

        }catch(e){}

        this.tris = tris;
    }

    //--------------------------------------------------
    triangleCount(){
        return this.tris.length;
    }

    //--------------------------------------------------
    triangle(args){

        const i = Math.floor(args.I)-1;

        if(i<0 || i>=this.tris.length)
            return '';

        let ax=0;
        if(args.AX==='y') ax=1;
        if(args.AX==='z') ax=2;

        return this.tris[i]
            .map(p=>p[ax].toFixed(5))
            .join(',');
    }

    //--------------------------------------------------
    info(){
        return `${this.version} by ${this.author}`;
    }
}

Scratch.extensions.register(
    new PolygonMC()
);

})(Scratch);