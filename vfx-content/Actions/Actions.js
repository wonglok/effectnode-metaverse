// import slugify from "slugify";
import { getID } from "../../vfx-metaverse";

export let Actions = [
  {
    name: "Standing Waiting",
    slug: "standing-waiting",
    url: `/rpm/rpm-pose/standing-waiting.fbx`,
  },
  {
    name: "Cheering",
    slug: "cheering",
    url: `/rpm/rpm-actions/cheer.fbx`,
  },
  {
    name: "Excited",
    slug: "excited",
    url: `/rpm/rpm-actions/excited.fbx`,
  },
  {
    name: "BackFlip",
    slug: "backflip",
    url: `/rpm/rpm-actions/backflip.fbx`,
  },
  {
    name: "Bow, Quick and Formal",
    slug: "bow_quick_formal",

    url: `/rpm/rpm-actions/bow-quick-formal.fbx`,
  },
  {
    name: "Hip Hop Dance",
    slug: "hiphopdance",

    url: `/rpm/rpm-actions/dance-hiphop.fbx`,
  },
  {
    name: "Greetings",
    slug: "greetings",

    url: `/rpm/rpm-actions/greetings.fbx`,
  },
  {
    name: "Pointer 2",
    slug: "pointer2",

    url: `/rpm/rpm-actions/guesture-pointer-2.fbx`,
  },
  {
    name: "Pointer",
    slug: "pointer1",

    url: `/rpm/rpm-actions/guesture-pointer.fbx`,
  },
  {
    name: "Hand Fowrad",
    slug: "hand-forward",

    url: `/rpm/rpm-actions/hand-forward.fbx`,
  },
  {
    name: "Happy Hand",
    slug: "happy-hand",

    url: `/rpm/rpm-actions/happy-hand.fbx`,
  },
  {
    name: "Happy Idle",
    slug: "happy-idle",

    url: `/rpm/rpm-actions/happy-idle.fbx`,
  },
  {
    name: "Double Wavy",
    slug: "double-hi",

    url: `/rpm/rpm-actions/hi-wave-both-hands.fbx`,
  },
  {
    name: "MMA Idle",
    slug: "mma-idle",

    url: `/rpm/rpm-actions/mma-idle.fbx`,
  },
  {
    name: "MMA Kick",
    slug: "mma-kick",

    url: `/rpm/rpm-actions/mma-kick.fbx`,
  },
  {
    name: "MMA Kick 2",
    slug: "mma-kick-2",

    url: `/rpm/rpm-actions/mma-kick-2.fbx`,
  },
  {
    name: "MMA Warmup",
    slug: "mma-warmup",

    url: `/rpm/rpm-actions/mma-warmup.fbx`,
  },
  {
    name: "Silly Dance",
    slug: "silly-dance",

    url: `/rpm/rpm-actions/silly-dance.fbx`,
  },
  {
    name: "Spin in Place",
    slug: "spin-in-place",

    url: `/rpm/rpm-actions/spin-in-place.fbx`,
  },
  {
    name: "Hip Hop Dancing",
    slug: "hip-hop-dance-2",

    url: `/rpm/rpm-actions-locomotion/hip-hop-dancing.fbx`,
  },
  {
    name: "Standing",
    slug: "standing-lets-go",

    url: `/rpm/rpm-pose/standing.fbx`,
  },
]
  .map((e) => {
    e.id = getID();

    e.signature = e.slug;

    // slugify(, {
    //   replacement: "_", // replace spaces with replacement character, defaults to `-`
    //   remove: undefined, // remove characters that match regex, defaults to `undefined`
    //   lower: true, // convert to lower case, defaults to `false`
    //   strict: true, // strip special characters except replacement, defaults to `false`
    //   locale: "en", // language code of the locale to use
    //   trim: true, // trim leading and trailing replacement chars, defaults to `true`
    // });

    return e;
  })
  .filter((e) => e.name);
