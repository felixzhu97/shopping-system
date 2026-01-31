export type ModelAsset = {
  key: string;
  label: string;
  url: string;
};

export const MODEL_ASSETS: ModelAsset[] = [
  {
    key: 'arnt_shoes_-_ulv_whussuphaterz',
    label: 'Arnt Shoes',
    url: '/models/arnt_shoes_-_ulv_whussuphaterz/scene.gltf',
  },
  {
    key: 'camera_canon_eos_400d',
    label: 'Canon EOS 400D Camera',
    url: '/models/camera_canon_eos_400d/scene.gltf',
  },
  {
    key: 'desk_lamp',
    label: 'Desk Lamp',
    url: '/models/desk_lamp/scene.gltf',
  },
  {
    key: 'office_electronics_desk_fan_retro',
    label: 'Retro Desk Fan',
    url: '/models/office_electronics_desk_fan_retro/scene.gltf',
  },
  {
    key: 'pepsi_bottle',
    label: 'Pepsi Bottle',
    url: '/models/pepsi_bottle/scene.gltf',
  },
  {
    key: 'rayban_sunglasses',
    label: 'Ray-Ban Sunglasses',
    url: '/models/rayban_sunglasses/scene.gltf',
  },
  {
    key: 'woody_toy_story',
    label: 'Woody (Toy Story)',
    url: '/models/woody_toy_story/scene.gltf',
  },
];

export const MODEL_ASSET_BY_KEY = new Map(MODEL_ASSETS.map(a => [a.key, a]));

