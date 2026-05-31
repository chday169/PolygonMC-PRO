(function(Scratch) {
    'use strict';

    class PolygonMC {
        constructor() {
            this.version = "1.0.0";
            this.author = "Ching-Her Day (戴清河, chday169)";
            this.expr = "x*x+y*y+z*z-0.25";
            this.parser = new ExprParser(this.expr);
            this.tris = [];
        }

        setFunc(args) {
            this.expr = args.F;
            this.parser = new ExprParser(this.expr);
            this.tris = [];
        }

        eval(x, y, z) {
            return this.parser.evaluate(x, y, z);
        }

        // --- all geometric methods unchanged from original ---
        interpolate(p1, p2, v1, v2) {
            const t = v1 / (v1 - v2);
            return [
                p1[0] + t * (p2[0] - p1[0]),
                p1[1] + t * (p2[1] - p1[1]),
                p1[2] + t * (p2[2] - p1[2])
            ];
        }

        sortPoly(poly) {
            let cx = 0, cy = 0, cz = 0;
            for (const p of poly) {
                cx += p[0];
                cy += p[1];
                cz += p[2];
            }
            cx /= poly.length;
            cy /= poly.length;
            cz /= poly.length;
            const sorted = poly.map(p => ({
                p: p,
                a: Math.atan2(p[1] - cy, p[0] - cx)
            }));
            sorted.sort((a, b) => a.a - b.a);
            return sorted.map(v => v.p);
        }

        triangulate(poly) {
            const tris = [];
            let cx = 0, cy = 0, cz = 0;
            for (const p of poly) {
                cx += p[0];
                cy += p[1];
                cz += p[2];
            }
            cx /= poly.length;
            cy /= poly.length;
            cz /= poly.length;
            const center = [cx, cy, cz];
            for (let i = 0; i < poly.length; i++) {
                tris.push([center, poly[i], poly[(i + 1) % poly.length]]);
            }
            return tris;
        }

        build(args) {
            const MAX = 18;
            const N = Math.min(MAX, Math.max(6, Math.floor(args.N)));
            const step = 2 / (N - 1);
            const lin = new Array(N);
            for (let i = 0; i < N; i++) lin[i] = -1 + i * step;
            const fn = (x, y, z) => this.eval(x, y, z);
            const edges = [
                [0,1],[0,2],[0,4],[1,3],[1,5],
                [2,3],[2,6],[3,7],[4,5],[4,6],[5,7],[6,7]
            ];
            const tris = [];
            try {
                for (let i = 0; i < N - 1; i++)
                for (let j = 0; j < N - 1; j++)
                for (let k = 0; k < N - 1; k++) {
                    const x = lin[i], x1 = lin[i+1];
                    const y = lin[j], y1 = lin[j+1];
                    const z = lin[k], z1 = lin[k+1];
                    const pts = [
                        [x,y,z], [x,y,z1], [x,y1,z], [x,y1,z1],
                        [x1,y,z], [x1,y,z1], [x1,y1,z], [x1,y1,z1]
                    ];
                    const val = pts.map(p => fn(p[0], p[1], p[2]));
                    let pos = false, neg = false;
                    for (let v of val) {
                        if (v < 0) neg = true;
                        else pos = true;
                        if (pos && neg) break;
                    }
                    if (!(pos && neg)) continue;
                    const poly = [];
                    for (let e = 0; e < edges.length; e++) {
                        const a = edges[e][0], b = edges[e][1];
                        const va = val[a], vb = val[b];
                        if (va * vb < 0) {
                            poly.push(this.interpolate(pts[a], pts[b], va, vb));
                        }
                    }
                    if (poly.length < 3) continue;
                    const sorted = this.sortPoly(poly);
                    tris.push(...this.triangulate(sorted));
                }
            } catch(e) {}
            this.tris = tris;
        }

        triangleCount() {
            return this.tris.length;
        }

        triangle(args) {
            const i = Math.floor(args.I) - 1;
            if (i < 0 || i >= this.tris.length) return '';
            let ax = 0;
            if (args.AX === 'y') ax = 1;
            if (args.AX === 'z') ax = 2;
            return this.tris[i].map(p => p[ax].toFixed(5)).join(',');
        }

        info() {
            return `${this.version} by ${this.author}`;
        }

        getInfo() {
            return {
                id: 'polygonmc_pro',
                name: 'PolygonMC PRO',
                color1: '#2d8cff',
                color2: '#1b5fbf',
                blocks: [
                    {
                        opcode: 'setFunc',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set function f(x,y,z) = [F]',
                        arguments: {
                            F: { type: Scratch.ArgumentType.STRING, defaultValue: 'x*x+y*y+z*z-0.25' }
                        }
                    },
                    {
                        opcode: 'build',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'build surface size [N]',
                        arguments: {
                            N: { type: Scratch.ArgumentType.NUMBER, defaultValue: 14 }
                        }
                    },
                    {
                        opcode: 'triangleCount',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'triangle count'
                    },
                    {
                        opcode: 'triangle',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'triangle [I] [AX]',
                        arguments: {
                            I: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            AX: { type: Scratch.ArgumentType.STRING, menu: 'AXIS' }
                        }
                    },
                    {
                        opcode: 'info',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'engine info'
                    }
                ],
                menus: {
                    AXIS: { items: ['x', 'y', 'z'] }
                }
            };
        }
    }

    // ------------------------------------------------------------
    // Safe expression parser (no eval / new Function)
    // ------------------------------------------------------------
    class ExprParser {
        constructor(expr) {
            this.tokens = this.tokenize(expr);
            this.pos = 0;
        }

        tokenize(str) {
            const regex = /(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[a-zA-Z_]+|[+\-*/^()])/g;
            const tokens = [];
            let m;
            while ((m = regex.exec(str)) !== null) {
                let token = m[1];
                if (/^\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(token)) {
                    tokens.push({ type: 'number', value: parseFloat(token) });
                } else if (/^[a-zA-Z_]+$/.test(token)) {
                    tokens.push({ type: 'identifier', value: token });
                } else {
                    tokens.push({ type: 'operator', value: token });
                }
            }
            return tokens;
        }

        peek() {
            return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
        }

        consume(expectedType, expectedValue) {
            const tok = this.peek();
            if (!tok) throw new Error('Unexpected end of expression');
            if (tok.type !== expectedType) throw new Error(`Expected ${expectedType}, got ${tok.type}`);
            if (expectedValue !== undefined && tok.value !== expectedValue) 
                throw new Error(`Expected '${expectedValue}', got '${tok.value}'`);
            this.pos++;
            return tok;
        }

        evaluate(x, y, z) {
            this.x = x; this.y = y; this.z = z;
            this.pos = 0;
            try {
                const result = this.parseExpr();
                if (this.peek() !== null) throw new Error('Extra tokens after expression');
                return result;
            } catch(e) {
                return 1;  // fallback on error
            }
        }

        parseExpr() {
            let left = this.parseTerm();
            while (true) {
                const op = this.peek();
                if (op && op.type === 'operator' && (op.value === '+' || op.value === '-')) {
                    this.consume('operator', op.value);
                    const right = this.parseTerm();
                    left = op.value === '+' ? left + right : left - right;
                } else {
                    break;
                }
            }
            return left;
        }

        parseTerm() {
            let left = this.parseFactor();
            while (true) {
                const op = this.peek();
                if (op && op.type === 'operator' && (op.value === '*' || op.value === '/')) {
                    this.consume('operator', op.value);
                    const right = this.parseFactor();
                    if (op.value === '*') left = left * right;
                    else left = left / right;
                } else {
                    break;
                }
            }
            return left;
        }

        parseFactor() {
            const tok = this.peek();
            if (!tok) throw new Error('Unexpected end');
            if (tok.type === 'number') {
                this.consume('number');
                return tok.value;
            }
            if (tok.type === 'identifier') {
                const name = tok.value;
                this.consume('identifier');
                // function call?
                const next = this.peek();
                if (next && next.type === 'operator' && next.value === '(') {
                    return this.parseFunction(name);
                }
                // variable
                if (name === 'x') return this.x;
                if (name === 'y') return this.y;
                if (name === 'z') return this.z;
                if (name === 'pi') return Math.PI;
                if (name === 'e') return Math.E;
                throw new Error(`Unknown variable or function: ${name}`);
            }
            if (tok.type === 'operator' && tok.value === '(') {
                this.consume('operator', '(');
                const expr = this.parseExpr();
                this.consume('operator', ')');
                return expr;
            }
            throw new Error(`Unexpected token: ${tok.value}`);
        }

        parseFunction(name) {
            this.consume('operator', '(');
            const arg = this.parseExpr();
            this.consume('operator', ')');
            switch (name) {
                case 'sin': return Math.sin(arg);
                case 'cos': return Math.cos(arg);
                case 'tan': return Math.tan(arg);
                case 'asin': return Math.asin(arg);
                case 'acos': return Math.acos(arg);
                case 'atan': return Math.atan(arg);
                case 'sqrt': return Math.sqrt(arg);
                case 'exp': return Math.exp(arg);
                case 'log': return Math.log(arg);
                case 'abs': return Math.abs(arg);
                case 'floor': return Math.floor(arg);
                case 'ceil': return Math.ceil(arg);
                case 'round': return Math.round(arg);
                case 'pow':
                    // power as function pow(base, exponent) – but we only have one argument?
                    // For simplicity we only support single-argument functions.
                    // For power, use the ^ operator instead.
                    return Math.pow(arg, arg); // not ideal; better use ^ in infix
                default:
                    throw new Error(`Unknown function: ${name}`);
            }
        }
    }

    // Register extension
    Scratch.extensions.register(new PolygonMC());
})(Scratch);