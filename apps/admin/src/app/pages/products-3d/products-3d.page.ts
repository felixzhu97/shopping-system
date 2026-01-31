import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { ApiService, Product } from '../../core/api/api.service';
import { AuthService } from '../../core/auth/auth.service';
import { MODEL_ASSET_BY_KEY, MODEL_ASSETS, type ModelAsset } from '../../core/three/model-assets';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

type ProductVisual = {
  id: string;
  object: THREE.Object3D;
};

type LoadedModel = {
  scene: THREE.Object3D;
  scale: number;
};

@Component({
  selector: 'app-products-3d-page',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-3d.page.html',
  styleUrl: './products-3d.page.scss',
})
export class Products3dPage implements OnInit, OnDestroy {
  private readonly api = inject(ApiService);
  private readonly auth = inject(AuthService);
  private readonly gltfLoader = new GLTFLoader();

  private readonly defaultModelKey = MODEL_ASSETS[0]?.key ?? '';

  @ViewChild('canvasHost', { static: true })
  private readonly canvasHost!: ElementRef<HTMLDivElement>;

  protected readonly loading = signal<boolean>(false);
  protected readonly error = signal<string>('');
  protected readonly modelLoading = signal<boolean>(false);
  protected readonly modelError = signal<string>('');
  protected readonly products = signal<Product[]>([]);
  protected readonly search = signal<string>('');
  protected readonly selectedProductId = signal<string>('');
  protected readonly activeModelKey = signal<string>('');
  protected readonly activeModelLabel = signal<string>('');

  protected readonly apiBaseUrl = computed(() => this.auth.apiBaseUrl);

  protected readonly filteredProducts = computed(() => {
    const q = this.search().trim().toLowerCase();
    if (!q) return this.products();
    return this.products().filter(p => {
      const text = `${p.name ?? ''} ${p.category ?? ''} ${p.description ?? ''}`.toLowerCase();
      return text.includes(q);
    });
  });

  protected readonly selectedProduct = computed(() => {
    const id = this.selectedProductId();
    if (!id) return undefined;
    return this.products().find(p => this.getId(p) === id);
  });

  private renderer: THREE.WebGLRenderer | undefined;
  private scene: THREE.Scene | undefined;
  private camera: THREE.PerspectiveCamera | undefined;
  private controls: OrbitControls | undefined;
  private animationId: number | undefined;
  private resizeObserver: ResizeObserver | undefined;

  private readonly raycaster = new THREE.Raycaster();
  private readonly pointer = new THREE.Vector2();

  private stageGroup: THREE.Group | undefined;

  private currentVisual: ProductVisual | undefined;
  private readonly modelCache = new Map<string, LoadedModel>();
  private modelRequestId = 0;

  private readonly focusTarget = new THREE.Vector3();
  private readonly focusCameraPosition = new THREE.Vector3();
  private hasFocus = false;

  ngOnInit(): void {
    this.initThree();
    this.refresh();
  }

  ngOnDestroy(): void {
    this.destroyThree();
  }

  refresh(): void {
    this.error.set('');
    this.loading.set(true);
    this.api.getProducts(this.apiBaseUrl()).subscribe({
      next: (items) => {
        this.products.set(items);
        const first = items[0];
        if (first) this.selectedProductId.set(this.getId(first));
        this.rebuildStage(items);
      },
      error: (e: unknown) => this.error.set(this.extractErrorMessage(e) || 'Failed to load products'),
      complete: () => this.loading.set(false),
    });
  }

  setSearch(value: string): void {
    this.search.set(value);
  }

  selectById(id: string): void {
    if (!id) return;
    this.selectedProductId.set(id);
    this.rebuildStage(this.products());
  }

  private initThree(): void {
    const host = this.canvasHost.nativeElement;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 2.5;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#f3f2f2');
    scene.fog = new THREE.Fog('#f3f2f2', 10, 34);

    const camera = new THREE.PerspectiveCamera(55, this.safeAspect(host), 0.1, 200);
    camera.position.set(0, 2.2, 10);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 3;
    controls.maxDistance = 16;
    controls.target.set(0, 1.2, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.45);
    keyLight.position.set(7, 12, 6);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    keyLight.shadow.camera.near = 0.1;
    keyLight.shadow.camera.far = 60;
    keyLight.shadow.radius = 4;
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.55);
    fillLight.position.set(-7, 8, -5);
    scene.add(fillLight);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.ShadowMaterial({ opacity: 0.18 }),
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const stageGroup = new THREE.Group();
    scene.add(stageGroup);

    const onPointerMove = (event: PointerEvent) => this.onPointerMove(event);
    const onPointerDown = (event: PointerEvent) => this.onPointerDown(event);
    renderer.domElement.addEventListener('pointermove', onPointerMove);
    renderer.domElement.addEventListener('pointerdown', onPointerDown);
    (renderer.domElement as unknown as { __sfPointerMove?: unknown }).__sfPointerMove = onPointerMove;
    (renderer.domElement as unknown as { __sfPointerDown?: unknown }).__sfPointerDown = onPointerDown;

    const resizeObserver = new ResizeObserver(() => this.resize());
    resizeObserver.observe(host);

    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.controls = controls;
    this.resizeObserver = resizeObserver;
    this.stageGroup = stageGroup;

    this.animate();
  }

  private destroyThree(): void {
    if (this.animationId) cancelAnimationFrame(this.animationId);
    this.animationId = undefined;

    const renderer = this.renderer;
    if (renderer) {
      const anyCanvas = renderer.domElement as unknown as {
        __sfPointerMove?: (event: PointerEvent) => void;
        __sfPointerDown?: (event: PointerEvent) => void;
      };
      if (anyCanvas.__sfPointerMove) renderer.domElement.removeEventListener('pointermove', anyCanvas.__sfPointerMove);
      if (anyCanvas.__sfPointerDown) renderer.domElement.removeEventListener('pointerdown', anyCanvas.__sfPointerDown);

      renderer.dispose();
      const parent = renderer.domElement.parentElement;
      if (parent) parent.removeChild(renderer.domElement);
    }

    this.controls?.dispose();
    this.resizeObserver?.disconnect();

    if (this.currentVisual) this.disposeObject(this.currentVisual.object);
    for (const entry of this.modelCache.values()) this.disposeObject(entry.scene);
    this.modelCache.clear();
    this.currentVisual = undefined;

    this.scene = undefined;
    this.camera = undefined;
    this.controls = undefined;
    this.renderer = undefined;
    this.resizeObserver = undefined;
    this.stageGroup = undefined;
  }

  private animate(): void {
    const renderer = this.renderer;
    const scene = this.scene;
    const camera = this.camera;
    const controls = this.controls;
    const stageGroup = this.stageGroup;
    if (!renderer || !scene || !camera || !controls || !stageGroup) return;

    this.animationId = requestAnimationFrame(() => this.animate());

    controls.update();

    if (this.hasFocus) {
      const target = controls.target;
      target.lerp(this.focusTarget, 0.08);
      camera.position.lerp(this.focusCameraPosition, 0.08);
      const remaining =
        target.distanceTo(this.focusTarget) + camera.position.distanceTo(this.focusCameraPosition);
      if (remaining < 0.02) this.hasFocus = false;
    }

    renderer.render(scene, camera);
  }

  private rebuildStage(items: Product[]): void {
    const selectedId = this.selectedProductId();
    const targetId = selectedId || this.getId(items[0] ?? {});
    if (!targetId) return;
    void this.renderProduct(targetId, items);
  }

  private async renderProduct(productId: string, items: Product[]): Promise<void> {
    const stageGroup = this.stageGroup;
    if (!stageGroup) return;

    const product = items.find(p => this.getId(p) === productId);
    const modelKey = this.resolveModelKeyForProduct(product);
    const asset = MODEL_ASSET_BY_KEY.get(modelKey) ?? MODEL_ASSET_BY_KEY.get(this.defaultModelKey);
    if (!asset) return;

    this.activeModelKey.set(asset.key);
    this.activeModelLabel.set(asset.label);

    const requestId = ++this.modelRequestId;
    this.modelError.set('');
    this.modelLoading.set(true);

    try {
      const loaded = await this.ensureModelLoaded(asset);
      if (requestId !== this.modelRequestId) return;
      if (!this.stageGroup) return;

      while (stageGroup.children.length) stageGroup.remove(stageGroup.children[0] as THREE.Object3D);
      if (this.currentVisual) this.disposeObject(this.currentVisual.object);
      this.currentVisual = undefined;

      const object = this.createProductInstance(loaded, productId);
      object.position.set(0, 0, 0);
      stageGroup.add(object);
      this.currentVisual = { id: productId, object };

      this.focusOnObject(object);
    } catch {
      if (requestId !== this.modelRequestId) return;
      this.modelError.set(`Failed to load 3D model "${asset.key}". Verify assets under apps/admin/public/models/${asset.key}/`);
    } finally {
      if (requestId === this.modelRequestId) this.modelLoading.set(false);
    }
  }

  private onPointerMove(event: PointerEvent): void {
    const renderer = this.renderer;
    const camera = this.camera;
    if (!renderer || !camera) return;
    const rect = renderer.domElement.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -(((event.clientY - rect.top) / rect.height) * 2 - 1);
  }

  private onPointerDown(event: PointerEvent): void {
    if (event.button !== 0) return;
    const renderer = this.renderer;
    const camera = this.camera;
    const stageGroup = this.stageGroup;
    if (!renderer || !camera || !stageGroup) return;

    this.raycaster.setFromCamera(this.pointer, camera);
    const hits = this.raycaster.intersectObjects(stageGroup.children, true);
    const hit = hits[0];
    const id = this.getHitProductId(hit?.object);
    if (!id) return;
    this.selectById(id);
  }

  private focusOnObject(object: THREE.Object3D): void {
    const camera = this.camera;
    const controls = this.controls;
    if (!camera || !controls) return;

    const box = new THREE.Box3().setFromObject(object);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());

    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const fov = THREE.MathUtils.degToRad(camera.fov);
    const fitDist = maxDim / (2 * Math.tan(fov / 2));
    const direction = new THREE.Vector3(1, 0.6, 1).normalize();

    this.focusTarget.copy(center);
    this.focusCameraPosition.copy(center).add(direction.multiplyScalar(fitDist * 2.2));
    this.hasFocus = true;
  }

  private resize(): void {
    const host = this.canvasHost.nativeElement;
    const renderer = this.renderer;
    const camera = this.camera;
    if (!renderer || !camera) return;
    const width = Math.max(host.clientWidth, 1);
    const height = Math.max(host.clientHeight, 1);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  }

  private safeAspect(host: HTMLElement): number {
    const w = Math.max(host.clientWidth, 1);
    const h = Math.max(host.clientHeight, 1);
    return w / h;
  }

  private getId(value: { id?: string; _id?: string }): string {
    return value.id || value._id || '';
  }

  private resolveModelKeyForProduct(product: Product | undefined): string {
    const explicitKey = product?.modelKey?.trim();
    if (explicitKey && MODEL_ASSET_BY_KEY.has(explicitKey)) return explicitKey;

    const name = (product?.name ?? '').toLowerCase();
    const category = (product?.category ?? '').toLowerCase();
    const image = (product?.image ?? '').toLowerCase();
    const haystack = `${name} ${category} ${image}`;

    for (const asset of MODEL_ASSETS) {
      if (image.includes(asset.key)) return asset.key;
    }

    if (/(ray[-\s]?ban|sunglass)/.test(haystack)) return 'rayban_sunglasses';
    if (/(pepsi|bottle)/.test(haystack)) return 'pepsi_bottle';
    if (/(camera|canon|eos)/.test(haystack)) return 'camera_canon_eos_400d';
    if (/(lamp|light)/.test(haystack)) return 'desk_lamp';
    if (/(fan|retro)/.test(haystack)) return 'office_electronics_desk_fan_retro';
    if (/(woody|toy\s*story)/.test(haystack)) return 'woody_toy_story';
    if (/(shoe|shoes|sneaker)/.test(haystack)) return 'arnt_shoes_-_ulv_whussuphaterz';

    return this.defaultModelKey;
  }

  private computeNormalizeScale(model: THREE.Object3D): number {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z, 0.001);
    const target = 1.8;
    return target / maxDim;
  }

  private ensureModelLoaded(asset: ModelAsset): Promise<LoadedModel> {
    const cached = this.modelCache.get(asset.key);
    if (cached) return Promise.resolve(cached);

    return new Promise((resolve, reject) => {
      this.gltfLoader.load(
        asset.url,
        (gltf) => {
          const entry: LoadedModel = {
            scene: gltf.scene,
            scale: this.computeNormalizeScale(gltf.scene),
          };
          this.modelCache.set(asset.key, entry);
          resolve(entry);
        },
        undefined,
        () => reject(new Error('Model load failed')),
      );
    });
  }

  private createProductInstance(model: LoadedModel, productId: string): THREE.Object3D {
    const instance = model.scene.clone(true) as THREE.Object3D;
    instance.scale.setScalar(model.scale);
    instance.traverse((node) => {
      node.userData = { ...node.userData, productId };
      const mesh = node as unknown as THREE.Mesh;
      if (!(mesh as unknown as { isMesh?: boolean }).isMesh) return;

      if (mesh.geometry) mesh.geometry = mesh.geometry.clone();
      const material = mesh.material as unknown as THREE.Material | THREE.Material[] | undefined;
      if (material) mesh.material = Array.isArray(material) ? material.map(m => m.clone()) : material.clone();

      mesh.castShadow = true;
      mesh.receiveShadow = false;
    });
    const box = new THREE.Box3().setFromObject(instance);
    const lift = -box.min.y;
    if (Number.isFinite(lift) && lift > 0) instance.position.y += lift;
    return instance;
  }

  private getHitProductId(object: THREE.Object3D | undefined): string {
    let node: THREE.Object3D | null | undefined = object;
    while (node) {
      const id = (node.userData as { productId?: string } | undefined)?.productId;
      if (typeof id === 'string' && id) return id;
      node = node.parent;
    }
    return '';
  }

  private disposeObject(object: THREE.Object3D): void {
    object.traverse((node) => {
      const mesh = node as THREE.Mesh;
      const geometry = (mesh as unknown as { geometry?: THREE.BufferGeometry }).geometry;
      const material = (mesh as unknown as { material?: THREE.Material | THREE.Material[] }).material;
      if (geometry) geometry.dispose();
      if (material) {
        if (Array.isArray(material)) material.forEach(m => m.dispose());
        else material.dispose();
      }
    });
  }

  private extractErrorMessage(e: unknown): string {
    if (!e || typeof e !== 'object') return '';
    const anyError = e as { error?: unknown; message?: unknown };
    const body = anyError.error as { message?: unknown } | undefined;
    if (body && typeof body.message === 'string') return body.message;
    if (typeof anyError.message === 'string') return anyError.message;
    return '';
  }
}

