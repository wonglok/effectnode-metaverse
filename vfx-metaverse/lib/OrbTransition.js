import {
  BackSide,
  CubeCamera,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PlaneBufferGeometry,
  Scene,
  SphereBufferGeometry,
  sRGBEncoding,
  TextureLoader,
  WebGLCubeRenderTarget,
} from "three";

class Plane {
  constructor({ shader, link, at }) {
    let size = 100;
    this.geo = new PlaneBufferGeometry(size, size, 2, 2);
    let texture = new TextureLoader().load(link);
    this.material = new MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      map: texture,
      side: BackSide,
    });

    //
    this.mesh = new Mesh(this.geo, this.material);

    this.group = new Object3D();
    this.group.add(this.mesh);
    if (at === "px") {
      this.group.position.x = size * 0.5 * 1.0;
      this.group.rotation.y = Math.PI * 0.5 * 1.0;
    } else if (at === "nx") {
      this.group.position.x = size * 0.5 * -1.0;
      this.group.rotation.y = Math.PI * 0.5 * -1.0;
    } else if (at === "py") {
      this.group.position.y = size * 0.5 * 1.0;
      this.group.rotation.x = Math.PI * 0.5 * -1.0;
    } else if (at === "ny") {
      this.group.position.y = size * 0.5 * -1.0;
      this.group.rotation.x = Math.PI * 0.5 * 1.0;
    }
    if (at === "pz") {
      this.group.position.z = size * 0.5 * 1.0;
      this.group.rotation.y = Math.PI * 0.5 * 4.0;
    } else if (at === "nz") {
      this.group.position.z = size * 0.5 * -1.0;
      this.group.rotation.y = Math.PI * 0.5 * -2.0;
    }
  }
}

class Sky {
  constructor({ links, shader }) {
    let group = new Object3D();
    this.group = group;

    this.fliper = new Object3D();
    this.fliper.rotation.z = Math.PI;
    this.fliper.rotation.y = Math.PI;
    this.group.add(this.fliper);

    var at = ["px", "nx", "py", "ny", "pz", "nz"];

    this.planes = links.map((link, i) => {
      let plane = new Plane({
        shader,
        link: link.url,
        at: at[i],
      });
      return plane;
    });

    this.planes.forEach((plane) => {
      this.fliper.add(plane.group);
      return plane;
    });
  }
}

class SphereDisplay {
  constructor({ envMap }) {
    // // Create car
    var geo = new SphereBufferGeometry(5, 42, 42);
    var material = new MeshBasicMaterial({
      color: 0xffffff,
      envMap,
      side: BackSide,
    });
    var mesh = new Mesh(geo, material);
    this.mesh = mesh;
    this.group = new Object3D();
    this.group.add(mesh);
  }
}

/*
`https://res.cloudinary.com/htdjnmcsz/image/upload/v1557820567/zngndtrninocunhymquz.png`,
`https://res.cloudinary.com/htdjnmcsz/image/upload/v1557820567/kpyurwejhva9yd65fsjk.png`,
`https://res.cloudinary.com/htdjnmcsz/image/upload/v1557820567/qrdjxy3xe5bxbuotsshz.png`,
`https://res.cloudinary.com/htdjnmcsz/image/upload/v1557820567/resdrnerd9n3fhjuxltv.png`,
`https://res.cloudinary.com/htdjnmcsz/image/upload/v1557820567/ta8ggppgiyiuwykkmnjc.png`,
`https://res.cloudinary.com/htdjnmcsz/image/upload/v1557820567/epuaxw3fkdvftl5pmfwv.png`
*/
export class OrbTransition {
  constructor({ mini, renderer, mounter, shader, links, resolution = 512 }) {
    this.renderer = renderer;
    this.shader = shader;
    this.scene = new Scene();

    this.group = new Object3D();

    // background skybox
    this.backGroundGroup = new Object3D();
    this.group.add(this.backGroundGroup);

    // visible object
    this.foreGroundGroup = new Object3D();
    // this.group.add(this.foreGroundGroup)

    mounter.add(this.foreGroundGroup);

    this.sky = new Sky({
      links,
      shader: this.shader,
    });
    //
    this.backGroundGroup.add(this.sky.group);
    this.renderTarget = new WebGLCubeRenderTarget(resolution, {
      encoding: sRGBEncoding,
    });
    this.cubecam = new CubeCamera(1, 3000, this.renderTarget);
    this.group.add(this.cubecam);

    this.sphere = new SphereDisplay({
      envMap: this.cubecam.renderTarget.texture,
    });

    this.foreGroundGroup.add(this.sphere.group);

    this.animate = () => {};
    this.scene.add(this.group);

    this.preCapture = () => {
      this.backGroundGroup.visible = true;
      this.foreGroundGroup.visible = false;
    };
    this.capture = () => {
      this.animate();
      this.cubecam.update(this.renderer, this.scene);
    };
    this.postCapture = () => {
      this.backGroundGroup.visible = false;
      this.foreGroundGroup.visible = true;
    };

    mini.onLoop(() => {
      this.preCapture();
      this.capture();
      this.postCapture();
    });
  }
}
