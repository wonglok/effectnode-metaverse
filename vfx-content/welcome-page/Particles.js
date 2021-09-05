export function Particles() {
  let { get } = useThree();
  let ref = useRef();
  let { mini } = useMiniEngine();

  let o3d = useMemo(() => {
    let mm = new Mesh();

    let eART = new EnergyArt({
      renderer: get().gl,
      onClean: mini.onClean,
      onLoop: mini.onLoop,
    });

    return eART.out.o3d;
  }, []);

  useEffect(() => {
    let mounter = ref.current;

    if (mounter) {
      mounter.add(o3d);
    }
    return () => {
      if (mounter) {
        mounter.remove(o3d);
      }
    };
  }, [o3d]);

  return <group scale={0.03} ref={ref}></group>;
}
