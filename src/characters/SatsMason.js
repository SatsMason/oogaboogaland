(() => {
  "use strict";
  const BL = window.BL;
  const { box, lathe, ring, merge, forward, cached } = BL.models;
  const { createNode, addChild } = BL.scene;

  const hatGeometry = cached(() => merge(
    lathe({ profile: [[0.34, 0], [0.35, 0.035], [0.31, 0.055], [0.285, 0.08]], segments: 18, color: "#302a1d" }),
    lathe({ profile: [[0.285, 0.08], [0.275, 0.22], [0.23, 0.31], [0.12, 0.355], [0, 0.365]], segments: 18, color: "#403925" }),
    ring({ r: 0.286, thickness: 0.032, y: 0.095, segments: 18, color: "#171813" }),
    box({ w: 0.075, h: 0.085, d: 0.025, color: "#9b6a32", offset: { x: 0, y: 0.1, z: 0.292 } }),
    box({ w: 0.04, h: 0.05, d: 0.028, color: "#15140f", offset: { x: 0, y: 0.1, z: 0.305 } }),
    box({ w: 0.12, h: 0.025, d: 0.08, color: "#526238", offset: { x: -0.18, y: 0.34, z: 0.04 } }),
    box({ w: 0.09, h: 0.02, d: 0.06, color: "#687447", offset: { x: 0.16, y: 0.345, z: -0.02 } })
  ));

  const hurleyGeometry = (h) => {
    const wood = "#8a5b31", edge = "#593a21";
    return merge(
      box({ w: 0.075 * h, h: 0.82 * h, d: 0.055 * h, color: wood, offset: { y: 0.25 * h } }),
      box({ w: 0.105 * h, h: 0.15 * h, d: 0.07 * h, color: edge, offset: { y: -0.22 * h } }),
      box({ w: 0.22 * h, h: 0.18 * h, d: 0.075 * h, color: wood, offset: { x: -0.055 * h, y: -0.32 * h } }),
      box({ w: 0.16 * h, h: 0.09 * h, d: 0.08 * h, color: edge, offset: { x: -0.1 * h, y: -0.415 * h } })
    );
  };

  const sliotarGeometry = (h) => forward(lathe({
    profile: [[0, -0.055 * h], [0.043 * h, -0.038 * h], [0.057 * h, 0], [0.043 * h, 0.038 * h], [0, 0.055 * h]],
    segments: 12,
    color: "#d8d0bd"
  }), { x: 0, y: 0, z: 0 });

  BL.characters.add({
    handle: "SatsMason",
    joined: 1791072000,
    lastCommit: 1791072000,
    look: {
      height: 1.3,
      belly: 1.28,
      bald: true,
      noBrow: true,
      noPupils: true,
      face: "none",
      skin: "#252522",
      hair: "#171714",
      fur: "#252522",
      portrait: { min: [-2, -5, -2], max: [8, 10, 9] }
    },
    dress: {
      torso(k, v) {
        const rock = k.color("#292a27"), dark = k.color("#171815"), ember = k.color("#ff7a18"), emberDk = k.color("#c9460c");
        v.fill(-1, 9, 0, 8, -1, 6, k.jit(rock, dark, 0.28));
        for (const [x, y, z] of [[4,7,6],[4,6,6],[3,5,6],[5,5,6],[2,4,6],[6,4,6],[3,3,6],[5,3,6],[1,2,5],[7,2,5],[4,1,5]]) v.set(x,y,z,(x+y)%2?ember:emberDk);
        // Block-built Bitcoin mark: B spine, bowls and the two currency strokes.
        for (const [x,y] of [[3,2],[3,3],[3,4],[3,5],[3,6],[4,6],[5,6],[5,5],[4,4],[5,4],[5,3],[5,2],[4,2],[2,7],[4,7],[2,1],[4,1]]) v.set(x,y,7,ember);
        k.headEmissive = { [ember]: 1, [emberDk]: 0.7 };
      },
      gear(k) {
        const rock = k.color("#292a27"), dark = k.color("#171815"), ember = k.color("#ff7a18"), moss = k.color("#56613b");
        const arm = BL.models.makeVox();
        // Oversized, broken-rock forearms and fists. Missing corner cells keep the silhouette craggy.
        arm.fill(-2, 4, 0, 11, -2, 4, k.jit(rock, dark, 0.3));
        for (const [x,y,z] of [[-2,11,-2],[4,11,4],[-2,8,4],[4,6,-2],[-2,2,-2],[4,1,4]]) arm.del(x,y,z);
        arm.fill(-3, 5, 0, 2, -3, 5, k.jit(rock, dark, 0.34));
        for (const [x,y,z] of [[0,10,4],[1,9,4],[-1,7,4],[2,6,4],[1,5,4],[0,3,4],[-1,2,4]]) arm.set(x,y,z,ember);
        for (const [x,y,z] of [[-2,10,2],[3,8,3],[-1,4,-2]]) arm.set(x,y,z,moss);
        const geo = k.vg(arm, { x: -1.5 * k.u, y: -11 * k.u, z: -1.5 * k.u }, { [ember]: 0.95 });
        k.parts.armR.geometry = k.parts.armL.geometry = geo;

        // Rebuild the legs in the same volcanic material so no flesh palette remains.
        const leg = BL.models.makeVox();
        leg.fill(-1, 4, 0, 6, -1, 4, k.jit(rock, dark, 0.3));
        leg.fill(-2, 5, 0, 1, -2, 6, k.jit(rock, dark, 0.34));
        for (const [x,y,z] of [[1,6,4],[2,5,4],[0,4,4],[3,3,4],[2,2,5],[1,1,6]]) leg.set(x,y,z,ember);
        for (const [x,y,z] of [[-1,5,2],[4,2,1]]) leg.set(x,y,z,moss);
        const legGeo = k.vg(leg, { x: -1.5 * k.u, y: -5 * k.u, z: -2.5 * k.u }, { [ember]: 0.9 });
        k.parts.legR.geometry = k.parts.legL.geometry = legGeo;
      },
      skull(k, v) {
        const rock = k.color("#292a27"), dark = k.color("#151613"), beard = k.color("#1a1a17"), ember = k.color("#ff7a18"), moss = k.color("#56613b");
        v.fill(-1, 7, 0, 6, -1, 6, k.jit(rock, dark, 0.32));
        for (const [x,y,z] of [[-1,6,1],[7,5,0],[0,1,-1],[6,0,1]]) v.del(x,y,z);
        for (const [x,y,z] of [[0,5,5],[1,4,5],[6,5,4],[5,1,5]]) v.set(x,y,z,ember);
        v.set(-1,5,2,moss); v.set(7,4,1,moss);
        v.fill(0, 6, -3, 1, 4, 7, k.jit(beard, dark, 0.25));
        v.fill(1, 5, -5, -4, 5, 7, k.jit(beard, dark, 0.3));
        v.set(0,-5,6,beard); v.set(6,-5,6,beard); v.set(3,-6,6,beard);
        return true;
      },
      eyes(k, v) {
        const ember = k.color("#ff8a1c"), hot = k.color("#ffd06a");
        for (const x of [1,5]) { v.set(x,3,6,ember); v.set(x,3,7,hot); k.eyeCells.push([x,3]); }
        k.lid = k.color("#191a17");
        k.headEmissive = { [ember]: 1, [hot]: 1.35 };
        return true;
      },
      hatY: (k) => 0.76 * k.h,
      headgear(k) {
        addChild(k.parts.head, createNode({ scale: { x: k.h, y: k.h, z: k.h }, position: { y: 0.02 * k.h }, geometry: hatGeometry() }));
      },
      club: (k) => ({ default: hurleyGeometry(k.h), gold: hurleyGeometry(k.h), rest: { x: 0.18, z: 0.08 }, carry: { x: 0.72, z: 0.05 } }),
      extras(k) {
        const h = k.h;
        addChild(k.root, createNode({ position: { x: 0.22 * h, y: 0.33 * h, z: 0.15 * h }, scale: { x: 1, y: 1, z: 1 }, geometry: sliotarGeometry(h) }));
      }
    }
  });
})();
