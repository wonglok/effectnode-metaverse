import {
  Box3,
  Clock,
  Line3,
  Matrix4,
  Mesh,
  MeshLambertMaterial,
  Object3D,
  Vector3,
} from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
export class MapNPC {
  constructor({ collider, startAt = new Vector3(0, 0, 0), Now }) {
    this.collider = collider;
    const scale = 1;
    const radius = 1.3 * scale;
    const width = 1 * scale;
    const height = 2 * scale;
    const depth = 1 * scale;
    const player = new Mesh(
      new RoundedBoxGeometry(width, height, depth, 8, radius),
      new MeshLambertMaterial({ transparent: true, opacity: 1 })
    );
    player.geometry.translate(0, -radius, 0);
    player.castShadow = true;

    player.capsuleInfo = {
      radius: radius,
      segment: new Line3(new Vector3(), new Vector3(0, -1.0, 0.0)),
    };
    this.player = player;

    player.position.copy(startAt);
    if (startAt.y <= 1) {
      player.position.y += 1;
    }

    // player.position.y += 5;

    player.geometry.computeBoundingBox();
    player.collider = new Box3().copy(player.geometry.boundingBox);

    const avatarDir = new Vector3();
    const playerVelocity = new Vector3(0, 0, 0);
    // const upVector = new Vector3(0, 1, 0);
    const tempVector = new Vector3();
    const tempVector2 = new Vector3();
    const tempBox = new Box3();
    const tempMat = new Matrix4();
    const tempSegment = new Line3();
    const rotationCopier = new Object3D();
    let playerIsOnGround = true;

    function updatePlayer({ delta, player }) {
      // fall down
      playerVelocity.y += delta * -9.8;

      player.position.addScaledVector(playerVelocity, delta);

      if (player.position.y <= -50) {
        // player.position.y = 0;
        player.position.copy(startAt);
        Now.goingTo.copy(startAt);
        Now.goingTo.z += 1;
        playerVelocity.y = 0.0;
      }

      avatarDir.copy(Now.goingTo).sub(player.position);
      avatarDir.y = 0;
      const size = avatarDir.length();
      avatarDir.normalize();
      avatarDir.y = 0;

      avatarDir.multiplyScalar(Now.avatarSpeed);

      if (size >= 0.1) {
        // 0.1
        player.position.addScaledVector(avatarDir, 0.04);
        Now.avatarMode = "running";
      } else {
        Now.avatarMode = "standing";
      }

      player.updateMatrixWorld();

      // adjust player position based on collisions
      const capsuleInfo = player.capsuleInfo;
      tempBox.makeEmpty();
      tempMat.copy(collider.matrixWorld).invert();
      tempSegment.copy(capsuleInfo.segment);

      // get the position of the capsule in the local space of the collider
      tempSegment.start.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);
      tempSegment.end.applyMatrix4(player.matrixWorld).applyMatrix4(tempMat);

      // get the axis aligned bounding box of the capsule
      tempBox.expandByPoint(tempSegment.start);
      tempBox.expandByPoint(tempSegment.end);

      tempBox.min.addScalar(-capsuleInfo.radius);
      tempBox.max.addScalar(capsuleInfo.radius);

      collider.geometry.boundsTree.shapecast(collider, {
        intersectsBounds: (box) => box.intersectsBox(tempBox),

        intersectsTriangle: (tri) => {
          // check if the triangle is intersecting the capsule and adjust the
          // capsule position if it is.
          const triPoint = tempVector;
          const capsulePoint = tempVector2;

          const distance = tri.closestPointToSegment(
            tempSegment,
            triPoint,
            capsulePoint
          );
          if (distance < capsuleInfo.radius) {
            const depth = capsuleInfo.radius - distance;
            const direction = capsulePoint.sub(triPoint).normalize();

            tempSegment.start.addScaledVector(direction, depth);
            tempSegment.end.addScaledVector(direction, depth);
          }
        },
      });

      // get the adjusted position of the capsule collider in world space after checking
      // triangle collisions and moving it. capsuleInfo.segment.start is assumed to be
      // the origin of the player model.
      const newPosition = tempVector;
      newPosition.copy(tempSegment.start).applyMatrix4(collider.matrixWorld);

      // check how much the collider was moved
      const deltaVector = tempVector2;
      deltaVector.subVectors(newPosition, player.position);

      // adjust the player model
      player.position.copy(newPosition);

      //
      Now.avatarAt.copy(player.position);
      // Now.avatarAt.y += 0.1;

      rotationCopier.position.copy(player.position);
      rotationCopier.lookAt(
        //
        Now.goingTo.x,
        player.position.y,
        Now.goingTo.z
      );

      Now.avatarRot.x = rotationCopier.rotation.x;
      Now.avatarRot.y = rotationCopier.rotation.y;
      Now.avatarRot.z = rotationCopier.rotation.z;

      // if the player was primarily adjusted vertically we assume it's on something we should consider gound
      playerIsOnGround =
        deltaVector.y > Math.abs(delta * playerVelocity.y * 0.25);

      if (!playerIsOnGround) {
        deltaVector.normalize();
        playerVelocity.addScaledVector(
          deltaVector,
          -deltaVector.dot(playerVelocity)
        );
        //
      } else {
        playerVelocity.set(0, 0, 0);
      }
    }

    const steps = 3;
    const clock = new Clock();

    this.onSimulate = () => {
      let dt = clock.getDelta();
      if (dt >= 1 / 24) {
        dt = 1 / 24;
      }

      for (let i = 0; i < steps; i++) {
        updatePlayer({ delta: dt / steps, player });
      }
    };
  }
}
