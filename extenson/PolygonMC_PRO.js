(function(Scratch) {
    'use strict';

    // ------------------------------------------------------------
    // Safe expression parser (no eval, no new Function)
    // Supports: + - * / ^ ( ) numbers, x y z, and math functions
    // ------------------------------------------------------------
    class ExprParser {
        constructor(expr) {
            this.expr = expr;
            this.tokens = [];
            this.pos = 0;
            this.tokenize();
        }

        tokenize() {
            const regex = /(\d+(?:\.\d+)?(?:[eE][+-]?\d+)?|[a-zA-Z_]+|[+\-*/^()])/g;
            let m;
            while ((m = regex.exec(this.expr)) !== null) {
                let token = m[1];
                if (/^\d+(?:\.\d+)?(?:[eE][+-]?\d+)?$/.test(token)) {
                    this.tokens.push({ type: 'number', value: parseFloat(token) });
                } else if (/^[a-zA-Z_]+$/.test(token)) {
                    this.tokens.push({ type: 'identifier', value: token });
                } else {
                    this.tokens.push({ type: 'operator', value: token });
                }
            }
        }

        peek() {
            return this.pos < this.tokens.length ? this.tokens[this.pos] : null;
        }

        consume(expectedType, expectedValue) {
            const tok = this.peek();
            if (!tok) throw new Error('Unexpected end');
            if (tok.type !== expectedType) throw new Error(`Expected ${expectedType}`);
            if (expectedValue !== undefined && tok.value !== expectedValue) throw new Error(`Expected '${expectedValue}'`);
            this.pos++;
            return tok;
        }

        evaluate(x, y, z) {
            this.x = x; this.y = y; this.z = z;
            this.pos = 0;
            try {
                const result = this.parseExpr();
                if (this.peek() !== null) throw new Error('Extra tokens');
                return result;
            } catch (e) {
                return 1; // fallback on error
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
                } else break;
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
                    left = op.value === '*' ? left * right : left / right;
                } else break;
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
                throw new Error(`Unknown variable: ${name}`);
            }
            if (tok.type === 'operator' && tok.value === '(') {
                this.consume('operator', '(');
                const expr = this.parseExpr();
                this.consume('operator', ')');
                return expr;
            }
            if (tok.type === 'operator' && tok.value === '-') {
                this.consume('operator', '-');
                return -this.parseFactor();
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
                default: throw new Error(`Unknown function: ${name}`);
            }
        }
    }

    // ------------------------------------------------------------
    // Main Extension Class (same as yours, but using safe parser)
    // ------------------------------------------------------------
    class PolygonMC {
        constructor() {
            this.expr = 'x*x+y*y+z*z-0.25';
            this.parser = new ExprParser(this.expr);
            this.tris = [];
        }

        getInfo() {
            return {
                id: 'polygonmc',
                name: 'Polygon MC',
                color1: '#2d8cff',
                color2: '#1b5fbf',
                blocks: [
                    {
                        opcode: 'setFunc',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'set function [F]',
                        arguments: {
                            F: {
                                type: Scratch.ArgumentType.STRING,
                                defaultValue: 'x*x+y*y+z*z-0.25'
                            }
                        }
                    },
                    {
                        opcode: 'build',
                        blockType: Scratch.BlockType.COMMAND,
                        text: 'build polygon mesh size [N]',
                        arguments: {
                            N: {
                                type: Scratch.ArgumentType.NUMBER,
                                defaultValue: 14
                            }
                        }
                    },
                    {
                        opcode: 'count',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'triangle count'
                    },
                    {
                        opcode: 'tri',
                        blockType: Scratch.BlockType.REPORTER,
                        text: 'triangle [I] [A]',
                        arguments: {
                            I: { type: Scratch.ArgumentType.NUMBER, defaultValue: 1 },
                            A: { type: Scratch.ArgumentType.STRING, menu: 'AX' }
                        }
                    }
                ],
                menus: {
                    AX: { items: ['x', 'y', 'z'] }
                }
            };
        }

        setFunc(args) {
            this.expr = args.F;
            this.parser = new ExprParser(this.expr);
            this.tris = [];
        }

        eval(x, y, z) {
            return this.parser.evaluate(x, y, z);
        }

        interp(p1, p2, v1, v2) {
            const t = v1 / (v1 - v2);
            return [
                p1[0] + t * (p2[0] - p1[0]),
                p1[1] + t * (p2[1] - p1[1]),
                p1[2] + t * (p2[2] - p1[2])
            ];
        }

        projectAxis(p, n) {
            if (Math.abs(n[1]) > 0.7) return [p[0], p[2]];
            return [p[0], p[1]];
        }

        sortPoly(points, normal) {
            const center = [0, 0, 0];
            for (const p of points) {
                center[0] += p[0];
                center[1] += p[1];
                center[2] += p[2];
            }
            center[0] /= points.length;
            center[1] /= points.length;
            center[2] /= points.length;

            const base = points.map(p => {
                const r = [p[0] - center[0], p[1] - center[1], p[2] - center[2]];
                const proj = this.projectAxis(r, normal);
                return { p, a: Math.atan2(proj[1], proj[0]) };
            });
            base.sort((a, b) => a.a - b.a);
            return base.map(v => v.p);
        }

        triangulate(poly) {
            const tris = [];
            const n = poly.length;
            let cx = 0, cy = 0, cz = 0;
            for (const p of poly) {
                cx += p[0];
                cy += p[1];
                cz += p[2];
            }
            cx /= n; cy /= n; cz /= n;
            const center = [cx, cy, cz];
            for (let i = 0; i < n; i++) {
                tris.push([center, poly[i], poly[(i + 1) % n]]);
            }
            return tris;
        }

        build(args) {
            const N = Math.max(6, Math.floor(args.N));
            const step = 2 / (N - 1);
            const lin = [];
            for (let i = 0; i < N; i++) lin[i] = -1 + i * step;

            const fn = this.eval.bind(this);
            const edges = [
                [0,1],[0,2],[0,4],
                [1,3],[1,5],
                [2,3],[2,6],
                [3,7],
                [4,5],[4,6],
                [5,7],[6,7]
            ];

            const tris = [];
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
                }
                if (!(pos && neg)) continue;

                const poly = [];
                for (let e = 0; e < 12; e++) {
                    const a = edges[e][0], b = edges[e][1];
                    const va = val[a], vb = val[b];
                    if (va * vb < 0) {
                        poly.push(this.interp(pts[a], pts[b], va, vb));
                    }
                }
                if (poly.length < 3) continue;
                const normal = [
                    poly[1][0] - poly[0][0],
                    poly[1][1] - poly[0][1],
                    poly[1][2] - poly[0][2]
                ];
                const sorted = this.sortPoly(poly, normal);
                tris.push(...this.triangulate(sorted));
            }
            this.tris = tris;
        }

        count() {
            return this.tris.length;
        }

        tri(args) {
            const i = Math.floor(args.I) - 1;
            if (i < 0 || i >= this.tris.length) return '';
            const axis = args.A;
            let idx = 0;
            if (axis === 'y') idx = 1;
            if (axis === 'z') idx = 2;
            return this.tris[i].map(p => p[idx].toFixed(5)).join(',');
        }
    }

    Scratch.extensions.register(new PolygonMC());
})(Scratch);