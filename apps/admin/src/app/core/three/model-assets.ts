export type ModelAsset = {
  key: string;
  label: string;
  url: string;
};

export const MODEL_ASSETS: ModelAsset[] = [
  {
    key: '2016_rolls-royce_dawn',
    label: '2016 Rolls-Royce Dawn',
    url: '/models/2016_rolls-royce_dawn/scene.gltf',
  },
  {
    key: 'airpod_max',
    label: 'AirPods Max',
    url: '/models/airpod_max/scene.gltf',
  },
  {
    key: 'apple_airtag',
    label: 'Apple AirTag',
    url: '/models/apple_airtag/scene.gltf',
  },
  {
    key: 'apple_mac_mini_m1',
    label: 'Apple Mac mini (M1)',
    url: '/models/apple_mac_mini_m1/scene.gltf',
  },
  {
    key: 'apple_vision_pro',
    label: 'Apple Vision Pro',
    url: '/models/apple_vision_pro/scene.gltf',
  },
  {
    key: 'apple_watch_ultra_-_orange',
    label: 'Apple Watch Ultra (Orange)',
    url: '/models/apple_watch_ultra_-_orange/scene.gltf',
  },
  {
    key: 'arnt_shoes_-_ulv_whussuphaterz',
    label: 'Arnt Shoes',
    url: '/models/arnt_shoes_-_ulv_whussuphaterz/scene.gltf',
  },
  {
    key: 'book_open',
    label: 'Open Book',
    url: '/models/book_open/scene.gltf',
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
    key: 'female_bag',
    label: 'Bag',
    url: '/models/female_bag/scene.gltf',
  },
  {
    key: 'headphones',
    label: 'Headphones',
    url: '/models/headphones/scene.gltf',
  },
  {
    key: 'intel_cpu',
    label: 'Intel CPU',
    url: '/models/intel_cpu/scene.gltf',
  },
  {
    key: 'macbook_pro_m3_16_inch_2024',
    label: 'MacBook Pro (M3, 16-inch, 2024)',
    url: '/models/macbook_pro_m3_16_inch_2024/scene.gltf',
  },
  {
    key: 'mercedes-benz_maybach_2022',
    label: 'Mercedes-Benz Maybach (2022)',
    url: '/models/mercedes-benz_maybach_2022/scene.gltf',
  },
  {
    key: 'nvidia_geforce_rtx_3090_-_gpu',
    label: 'NVIDIA GeForce RTX 3090 GPU',
    url: '/models/nvidia_geforce_rtx_3090_-_gpu/scene.gltf',
  },
  {
    key: 'office_electronics_desk_fan_retro',
    label: 'Retro Desk Fan',
    url: '/models/office_electronics_desk_fan_retro/scene.gltf',
  },
  {
    key: 'one_ring',
    label: 'One Ring',
    url: '/models/one_ring/scene.gltf',
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
    key: 'rolls-royce_silver_cloud_ii__www.vecarz.com',
    label: 'Rolls-Royce Silver Cloud II',
    url: '/models/rolls-royce_silver_cloud_ii__www.vecarz.com/scene.gltf',
  },
  {
    key: 'woody_toy_story',
    label: 'Woody (Toy Story)',
    url: '/models/woody_toy_story/scene.gltf',
  },
];

export const MODEL_ASSET_BY_KEY = new Map(MODEL_ASSETS.map(a => [a.key, a]));

