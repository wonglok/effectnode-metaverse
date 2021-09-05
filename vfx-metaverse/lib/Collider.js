import { Mesh, MeshBasicMaterial, Raycaster, Vector2 } from "three";
import { BufferGeometryUtils } from "three/examples/jsm/utils/BufferGeometryUtils";
import { SkeletonUtils } from "three/examples/jsm/utils/SkeletonUtils";
import { MeshBVH } from "three-mesh-bvh";

export class Collider {
  constructor({ floor, scene }) {
    this.floor = floor;
    this.raycaster = new Raycaster();
    this.scene = scene;

    const collider = this.makeCollider();
    this.collider = collider;
    this.preview = collider;
  }

  makeCollider() {
    const { scene, floor } = this;

    const environment = SkeletonUtils.clone(floor);

    const geometries = [];

    environment.updateMatrixWorld();
    environment.traverse((c) => {
      if (c.geometry && !c.userData.skipFloor) {
        const cloned = c.geometry.clone();

        cloned.applyMatrix4(c.matrixWorld);

        for (const key in cloned.attributes) {
          if (key === "position" || key === "index") {
          } else {
            cloned.deleteAttribute(key);
          }
        }

        geometries.push(cloned);
      }
    });

    scene.traverse((it) => {
      if (
        it &&
        it.geometry &&
        it.userData &&
        it.userData.isFloor &&
        it.material.userData.isFloor
      ) {
        const cloned = it.geometry.clone();
        it.updateMatrixWorld();

        cloned.applyMatrix4(it.matrixWorld);
        for (const key in cloned.attributes) {
          if (key !== "position") {
            cloned.deleteAttribute(key);
          }
        }
        geometries.push(cloned);
      }
    });

    const mergedGeometry = BufferGeometryUtils.mergeBufferGeometries(
      geometries,
      false
    );

    mergedGeometry.boundsTree = new MeshBVH(mergedGeometry);

    const collider = new Mesh(
      mergedGeometry,
      new MeshBasicMaterial({ color: 0xff0000 })
    );
    collider.userData.skipFloor = 1;
    collider.material.wireframe = true;
    collider.material.opacity = 1;
    collider.material.transparent = true;
    collider.updateMatrixWorld();

    return collider;
  }

  static queryHover({ scene }) {
    const source = [];

    scene.traverse((it) => {
      if (
        it.geometry &&
        it.userData &&
        !it?.material?.userData?.discard &&
        (it?.userData?.isHoverable ||
          it?.material?.userData?.isFloor ||
          it?.userData?.isFloor ||
          it?.userData?.hint ||
          it?.userData?.website) &&
        typeof it?.userData?.skipFloor === "undefined"
      ) {
        source.push(it);
      }
    });

    return source;
  }

  //
  scanCenter({ camera, scene, center = new Vector2(0, 0) }) {
    // this.center = new Vector2(0, 0);

    const { raycaster, collider } = this;

    raycaster.setFromCamera(center, camera);

    // let hit = collider.geometry.boundsTree.raycastFirst(
    //   collider,
    //   raycaster,
    //   raycaster.ray
    // );

    const result = [];

    let source = Collider.queryHover({ scene });

    raycaster.intersectObjects(source, false, result);
    const hit = result[0];

    if (hit) {
      return hit;
    } else {
      return false;
    }
  }
}
