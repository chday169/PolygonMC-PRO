📦 PolygonMC PRO

Implicit 3D Surface Engine for TurboWarp / Scratch

by Ching-Her Day (戴清河, chday169)

🌐 Overview

PolygonMC PRO is a TurboWarp / Scratch custom extension for rendering implicit 3D surfaces defined by:

f(x,y,z)=0

It converts mathematical functions into 3D polygon meshes in real-time using a lightweight polygon reconstruction method.

🚀 Features
✔ Supports any implicit function f(x,y,z)
✔ No lookup tables (simplified MC-style pipeline)
✔ Polygon reconstruction with sorting
✔ Stable triangulation (no degenerate “line artifacts”)
✔ TurboWarp Desktop compatible
✔ Safe function execution (no direct eval usage)
✔ Lightweight and fast for Scratch environment
📸 Concept

The engine extracts surfaces from scalar fields:

f(x,y,z) < 0   → inside
f(x,y,z) > 0   → outside

Then reconstructs the boundary surface using:

cube → edge intersections → polygon → triangulation
🧪 Example Functions
🔵 Sphere
x*x + y*y + z*z - 0.25
🟣 Torus
(Math.sqrt(x*x + y*y) - 0.6)**2 + z*z - 0.1*0.1
🌊 Wave Field
Math.sin(3*x) + Math.cos(3*y) + z
🧬 Gyroid-like structure
Math.sin(x*3)*Math.cos(y*3) +
Math.sin(y*3)*Math.cos(z*3) +
Math.sin(z*3)*Math.cos(x*3)
🎮 Scratch / TurboWarp Blocks
📌 Set Function
set function f(x,y,z) = [expression]
📌 Build Mesh
build surface size [N]
📌 Get Results
triangle count
triangle [i] [x/y/z]
engine info
⚙️ Installation
🔹 TurboWarp Desktop
Open TurboWarp Desktop
Go to Extensions
Click Custom Extension

Select:

PolygonMC_PRO.js
🔹 TurboWarp Web

You can also load via URL (if hosted):

Add Extension → Custom Extension → URL
⚠️ Performance Notes
Recommended mesh size: 6 – 18
Values above 18 may cause slowdowns in Scratch environment
TurboWarp Desktop performs significantly better than browser Scratch
🧠 Technical Notes

PolygonMC PRO uses:

Implicit surface sampling
Cube-edge intersection detection
Polygon centroid-based triangulation
Angle sorting (atan2 projection)
Safe JS function compilation via new Function()

It avoids full Marching Cubes lookup tables for simplicity and Scratch compatibility.

🔬 Limitations
Not a full Marching Cubes implementation
No GPU acceleration
No adaptive sampling
Approximate polygon topology in complex fields
Designed for educational + experimental use
📁 File Structure
PolygonMC_PRO.js   → main extension
README.md          → documentation
👤 Author

Ching-Her Day
戴清河 (chday169)

Research interests:

Implicit geometry (SDF / scalar fields)
MCA_WLTNT geometric systems
Real-time voxel / polygon reconstruction
Scratch / TurboWarp computational graphics
📜 License

MIT License (recommended)

🌟 Future Work

Planned upgrades:

GPU-style batch evaluation
Edge caching optimization
Real-time rotation support
Metaball blending system
Export to OBJ / STL
MCA_WLTNT advanced pipeline integration
💬 Final Note

PolygonMC PRO is designed as a bridge between mathematical implicit surfaces and Scratch/TurboWarp visualization, enabling students and researchers to explore 3D geometry interactively.