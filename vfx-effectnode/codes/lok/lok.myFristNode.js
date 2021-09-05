import { Color, Mesh, MeshBasicMaterial, SphereBufferGeometry } from "three";

export async function effect({ mini, node }) {
  let mounter = await mini.ready.mounter;
  let geo = new SphereBufferGeometry(1.5, 32, 32);
  let mat = new MeshBasicMaterial({
    color: new Color("#ff0000"),
    wireframe: true,
  });
  let mesh = new Mesh(geo, mat);
  mounter.add(mesh);

  mini.onLoop((st, dt) => {
    mesh.rotation.y += dt * 0.5;
  });

  mini.onClean(() => {
    mounter.remove(mesh);
    mesh.geometry.dispose();
    mesh.material.dispose();
  });

  let i = 0;
  let tt = setInterval(() => {
    i++;
    node.out0.pulse({
      myMessage: "firstndoe @" + i,
    });
  }, 1000);
  mini.onClean(() => {
    clearInterval(tt);
  });
}

//
