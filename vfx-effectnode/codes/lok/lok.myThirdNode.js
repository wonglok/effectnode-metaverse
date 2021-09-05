import { Color, Mesh, MeshBasicMaterial, SphereBufferGeometry } from "three";

export async function effect({ mini, node }) {
  let mounter = await mini.ready.mounter;
  let geo = new SphereBufferGeometry(2, 32, 32);
  let mat = new MeshBasicMaterial({
    color: new Color("#ffff00"),
    wireframe: true,
  });
  let mesh = new Mesh(geo, mat);
  mounter.add(mesh);

  mini.onLoop((st, dt) => {
    mesh.rotation.y += dt * 0.5;
  });

  mini.onClean(() => {
    mounter.remove(mesh);
  });
}
