// The converter replaces __ASSET_DATA__ with packed, engine-native mesh data.
(() => {
  "use strict";
  const BL = window.BL;
  const ART = BL.satsMasonArt.body;
  const EQUIPMENT = BL.satsMasonArt.equipment;
  const { moved, merge, lathe, tube } = BL.models;
  const { createNode, addChild } = BL.scene;
  // Decode once per character template; clones share the authored geometry.
  const bytes = (text) => {
    const size = text.length * 3 / 4 - (text.endsWith("==") ? 2 : text.endsWith("=") ? 1 : 0), out = new Uint8Array(size);
    const digit = (c) => c >= 65 && c <= 90 ? c - 65 : c >= 97 && c <= 122 ? c - 71 : c >= 48 && c <= 57 ? c + 4 : c === 43 ? 62 : c === 47 ? 63 : 0;
    let at = 0;
    for (let i = 0; i < text.length; i += 4) {
      const n = digit(text.charCodeAt(i)) * 262144 + digit(text.charCodeAt(i+1)) * 4096 + digit(text.charCodeAt(i+2)) * 64 + digit(text.charCodeAt(i+3));
      if (at < size) out[at++] = n >>> 16;
      if (at < size) out[at++] = n >>> 8 & 255;
      if (at < size) out[at++] = n & 255;
    }
    return out;
  };
  const geometry = (name, source = ART.parts) => {
    const p = source[name], q = new Uint16Array(bytes(p.v).buffer), n = new Int8Array(bytes(p.n).buffer), c = bytes(p.c), e = bytes(p.e);
    const verts = new Array(q.length), normals = new Array(n.length), faces = new Array(q.length / 9);
    for (let i = 0; i < q.length; i++) { const axis = i % 3; verts[i] = p.min[axis] + q[i] / 65535 * (p.max[axis] - p.min[axis]); normals[i] = n[i] / 127; }
    for (let i = 0; i < faces.length; i++) faces[i] = { i: [i*3,i*3+1,i*3+2], color: [c[i*3],c[i*3+1],c[i*3+2]], emissive: e[i] / 255 };
    return { verts, normals, faces, lines: [] };
  };
  // Cross-sections give the ash bas a continuous, flat, curved silhouette.
  const slab = (rows, depth, color, z = 0) => {
    rows=rows.slice().sort((a,b)=>a[0]-b[0]);
    const geo = { verts: [], faces: [], lines: [] }, rgb = BL.math.hexToRgb(color);
    for (const [y,l,r] of rows) geo.verts.push(l,y,z-depth/2,r,y,z-depth/2,l,y,z+depth/2,r,y,z+depth/2);
    const face = (i,c=rgb) => geo.faces.push({ i, color:c, emissive:0 });
    for (let i=0;i<rows.length-1;i++) {
      const a=i*4,b=a+4;
      face([a+2,a+3,b+3,b+2]); face([a,b,b+1,a+1]);
      face([a,a+2,b+2,b]); face([a+1,b+1,b+3,a+3]);
    }
    face([0,1,3,2]); const n=(rows.length-1)*4; face([n,n+2,n+3,n+1]);
    return geo;
  };
  const cord = (points,radius,color) => tube({ path(t) {
    const at=t*(points.length-1), i=Math.min(points.length-2,Math.floor(at)), f=at-i,a=points[i],b=points[i+1];
    return {x:a[0]+(b[0]-a[0])*f,y:a[1]+(b[1]-a[1])*f,z:a[2]+(b[2]-a[2])*f};
  }, radius:()=>radius, rings:points.length*3, segments:6, colorFn:()=>color });
  const chisel = (point=false) => {
    const pieces=[lathe({profile:[[0,-.068],[.020,-.068],[.025,-.062],[.026,-.05],[.018,-.037],[.016,.17],[.013,.20],[0,.21]],segments:8,color:"#525f61"}),
      lathe({profile:[[0,-.069],[.019,-.069],[.025,-.062],[.025,-.056]],segments:16,color:"#aab0aa"})];
    if(point) pieces.push(lathe({profile:[[.014,.17],[.011,.205],[.004,.255],[0,.275]],segments:8,color:"#a7b2b3"}));
    else pieces.push(slab([[.17,-.015,.015],[.225,-.027,.027],[.26,-.029,.029]],.010,"#b3bdbb"));
    const result=merge(...pieces);
    // Restrained forging variation, worn striking cap and polished working edge.
    for(let i=0;i<result.faces.length;i++) {
      const f=result.faces[i],mix=.94+.09*Math.sin(i*13.3);
      f.color=f.color.map(c=>Math.round(c*mix));
    }
    return result;
  };
  const sliotar = () => {
    const r=.036, profile=[];
    for(let i=0;i<=16;i++){const t=i*Math.PI/16;profile.push([r*Math.sin(t),-r*Math.cos(t)]);}
    const skin=lathe({profile,segments:32,color:"#ece3c8"}); skin.smooth=true;
    const pieces=[skin];
    for(let half=0;half<2;half++) {
      const points=[];
      for(let i=0;i<=64;i++){const t=i*Math.PI/32, a=t+half*Math.PI/2;
        points.push([Math.cos(a)*r,Math.sin(a)*r*.82,Math.sin(a)*r*.57*(half?-1:1)]);}
      pieces.push(cord(points,.0018,"#b69b70"));
      for(let i=0;i<32;i++){const a=i*Math.PI/16+half*Math.PI/2;
        const x=Math.cos(a)*r,y=Math.sin(a)*r*.82,z=Math.sin(a)*r*.57*(half?-1:1);
        pieces.push(cord([[x-.0015,y,z-.0025],[x+.0015,y,z+.0025]],.00065,"#6c5b43"));}
    }
    const result=merge(...pieces);
    result.normals=[];
    for(let i=0;i<result.verts.length;i+=3) {
      if(i<skin.verts.length) {
        const n=Math.hypot(result.verts[i],result.verts[i+1],result.verts[i+2]);
        result.normals.push(result.verts[i]/n,result.verts[i+1]/n,result.verts[i+2]/n);
      } else result.normals.push(0,0,0);
    }
    return result;
  };
  BL.characters.add({
    handle: "SatsMason", joined: 1791072000, lastCommit: 1791072000,
    look: { height: 1.3, bald: true, noBrow: true, noPupils: true, face: "none", skin: "#6c6655", hair: "#4c5040", fur: "#595c49" },
    dress: {
      gear(k) {
        k.root.position.y = ART.baseY;
        for (const key of ["torso", "armR", "armL", "legR", "legL"]) {
          k.parts[key].geometry = geometry(key);
          const p = ART.parts[key].pivot;
          k.parts[key].position.x = p[0]; k.parts[key].position.y = p[1]; k.parts[key].position.z = p[2];
          k.parts[key].scale.x = k.parts[key].scale.y = k.parts[key].scale.z = 1;
        }
        k.parts.fingersR.visible = k.parts.fingersL.visible = false;
      },
      skull(k) {
        const open = geometry("head"), p = ART.parts.head;
        const closed = { ...open, faces: open.faces.map((f,i) => p.eyes.includes(i) ? { ...f, color: [67,66,49], emissive: 0 } : f) };
        k.headGeometry = { open, closed, portrait: open };
        return true;
      },
      eyes() { return true; },
      headgear(k) {
        const p = ART.parts.head.pivot;
        k.parts.head.position.x = p[0]; k.parts.head.position.y = p[1]; k.parts.head.position.z = p[2];
      },
      club: () => {
        const tools=[{id:"hurley",label:"Hurley",geometry:geometry("hurley",EQUIPMENT)},{id:"hammer",label:"Thor-style hammer",geometry:geometry("hammer",EQUIPMENT)},
          {id:"trowel",label:"Trowel",geometry:geometry("trowel",EQUIPMENT),carry:{x:1.65,z:.22}},{id:"chisel",label:"Flat chisel",geometry:chisel()},
          {id:"point",label:"Point chisel",geometry:chisel(true)}];
        return {default:tools[0].geometry,gold:tools[0].geometry,tools,rest:{x:Math.PI-.12,z:.06},carry:{x:Math.PI-.16,z:.06}};
      },
      extras(k) {
        const leather={bib:geometry("apronBib",EQUIPMENT),skirts:[geometry("apronR",EQUIPMENT),geometry("apronL",EQUIPMENT)]};
        addChild(k.parts.torso,createNode({geometry:leather.bib}));
        k.parts.apronFlaps=leather.skirts.map((geo,i)=>{
          const x=k.parts[i===0?"legR":"legL"].position.x;
          return createNode({position:{x,y:-.24,z:.35},geometry:moved(geo,-x,.24,-.35)});
        });
        addChild(k.parts.torso,...k.parts.apronFlaps);
        const tools=k.tools;
        k.parts.toolStowed=tools.map((tool,i)=>createNode({geometry:tool.geometry,
          position:i===0?{x:-.21,y:-.27,z:-.46}:i===1?{x:-.49,y:-.47,z:.34}:i===2?{x:.25,y:.035,z:.40}:{x:i===3?-.21:-.11,y:-.02,z:.41},
          rotation:i===0?{x:.06,y:0,z:-.40}:i===1?{x:.03,y:0,z:-.10}:{x:Math.PI,y:0,z:i===2?-.12:.03}}));
        addChild(k.parts.torso,...k.parts.toolStowed);
        const mount=[cord([[-.28,-.12,.39],[-.42,-.17,.40],[-.52,-.26,.37],[-.52,-.29,.31],[-.46,-.29,.30],[-.42,-.17,.40]],.012,"#60422f")];
        for(const t of [.16,.43]) {
          const x=-.21+Math.sin(.4)*t,y=-.27+Math.cos(.4)*t,z=-.46;
          mount.push(cord([[x-.025,y+.022,z+.02],[x-.028,y-.022,z-.02],[x+.028,y-.022,z-.02],[x+.025,y+.022,z+.02]],.009,"#66432c"),
            cord([[x,y,z+.02],[x,y+.01,z+.15]],.016,"#523722"));
        }
        addChild(k.parts.torso,createNode({geometry:merge(...mount)}));
        k.parts.ballHeld=createNode({geometry:sliotar(),position:{x:0,y:-.625*k.h,z:.15*k.h}});
        k.parts.ballStowed=createNode({geometry:k.parts.ballHeld.geometry,position:{x:.35,y:-.18,z:.40}});
        addChild(k.parts.armL,k.parts.ballHeld);addChild(k.parts.torso,k.parts.ballStowed);
        addChild(k.parts.torso,createNode({geometry:cord([[.31,-.15,.39],[.32,-.215,.435],[.38,-.215,.435],[.39,-.15,.39]],.014,"#63452f")}));
      }
    }
  });
})();
