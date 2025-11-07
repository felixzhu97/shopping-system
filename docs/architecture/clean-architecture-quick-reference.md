# 整洁架构快速参考指南

## 核心原则速记

```
依赖方向：外层 → 内层
业务逻辑：内层（Domain + Application）
框架代码：外层（Infrastructure）
```

## 目录层次说明

### 1. Domain（领域层）- 最内层

**职责：**

- 定义业务实体（Entity）
- 定义值对象（Value Object）
- 定义仓储接口（Repository Interface）
- 定义领域服务接口（Domain Service Interface）

**规则：**

- ✅ 纯 TypeScript，无框架依赖
- ✅ 不依赖任何外部库（除了基础类型）
- ✅ 可以独立测试
- ❌ 不能依赖 Infrastructure 层

**示例：**

```typescript
// domain/entities/Product.ts
export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number
  ) {
    if (price < 0) {
      throw new Error('价格不能为负数');
    }
  }
}

// domain/repositories/IProductRepository.ts
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
  save(product: Product): Promise<void>;
}
```

### 2. Application（应用层）

**职责：**

- 实现用例（Use Case）
- 定义 DTO（Data Transfer Object）
- 协调领域对象和基础设施

**规则：**

- ✅ 依赖 Domain 层接口
- ✅ 实现业务用例
- ✅ 可以依赖 Application 层接口（如 ILogger）
- ❌ 不能依赖 Infrastructure 层实现

**示例：**

```typescript
// application/use-cases/product/GetProductsUseCase.ts
export class GetProductsUseCase {
  constructor(
    private productRepository: IProductRepository, // 依赖接口
    private logger: ILogger
  ) {}

  async execute(query: { category?: string }): Promise<Product[]> {
    if (query.category) {
      return this.productRepository.findByCategory(query.category);
    }
    return this.productRepository.findAll();
  }
}
```

### 3. Infrastructure（基础设施层）

**职责：**

- 实现仓储接口
- 实现 HTTP 控制器
- 实现外部服务
- 数据库连接和模型

**规则：**

- ✅ 实现 Domain 层定义的接口
- ✅ 依赖 Application 层的用例
- ✅ 可以依赖框架（Express、Mongoose 等）
- ❌ 不能定义业务逻辑

**示例：**

```typescript
// infrastructure/persistence/mongodb/repositories/ProductRepository.ts
export class ProductRepository implements IProductRepository {
  constructor(private productModel: Model<ProductDocument>) {}

  async findById(id: string): Promise<Product | null> {
    const doc = await this.productModel.findById(id);
    return doc ? ProductMapper.toDomain(doc) : null;
  }
}

// infrastructure/http/express/controllers/ProductController.ts
export class ProductController {
  constructor(private getProductsUseCase: GetProductsUseCase) {}

  async getAllProducts(req: Request, res: Response) {
    const products = await this.getProductsUseCase.execute({
      category: req.query.category as string,
    });
    res.json(products);
  }
}
```

### 4. Presentation（表示层）- 可选

**职责：**

- 格式化响应数据
- 序列化/反序列化
- 错误格式化

## 文件命名规范

### 接口命名

- 接口以 `I` 开头：`IProductRepository`
- 用例以 `UseCase` 结尾：`GetProductsUseCase`
- DTO 以 `Dto` 结尾：`CreateProductDto`

### 文件组织

```
domain/
  entities/
    Product.ts          # 实体类
  repositories/
    IProductRepository.ts  # 接口
  value-objects/
    Money.ts            # 值对象

application/
  use-cases/
    product/
      GetProductsUseCase.ts
  dto/
    product/
      CreateProductDto.ts

infrastructure/
  persistence/
    mongodb/
      repositories/
        ProductRepository.ts  # 实现
      models/
        ProductModel.ts      # 数据库模型
```

## 依赖注入模式

### 方式 1：构造函数注入（推荐）

```typescript
// UseCase
export class GetProductsUseCase {
  constructor(private productRepository: IProductRepository) {}
}

// Controller
export class ProductController {
  constructor(private getProductsUseCase: GetProductsUseCase) {}
}

// 容器配置
container.bind<IProductRepository>('IProductRepository').to(ProductRepository);
container.bind<GetProductsUseCase>('GetProductsUseCase').to(GetProductsUseCase);
```

### 方式 2：工厂模式

```typescript
export class UseCaseFactory {
  static createGetProductsUseCase(): GetProductsUseCase {
    const repository = new ProductRepository(ProductModel);
    return new GetProductsUseCase(repository);
  }
}
```

## 测试策略

### Domain 层测试（单元测试）

```typescript
describe('Product Entity', () => {
  it('should throw error when price is negative', () => {
    expect(() => new Product('1', 'Test', -10)).toThrow('价格不能为负数');
  });
});
```

### Application 层测试（使用 Mock）

```typescript
describe('GetProductsUseCase', () => {
  it('should return products by category', async () => {
    const mockRepository: IProductRepository = {
      findByCategory: jest.fn().mockResolvedValue([...])
    };
    const useCase = new GetProductsUseCase(mockRepository);
    const result = await useCase.execute({ category: 'electronics' });
    expect(result).toHaveLength(5);
  });
});
```

### Infrastructure 层测试（集成测试）

```typescript
describe('ProductRepository', () => {
  it('should find product by id', async () => {
    const repository = new ProductRepository(ProductModel);
    const product = await repository.findById('123');
    expect(product).toBeDefined();
  });
});
```

## 重构检查清单

### 重构前

- [ ] 识别当前代码中的业务逻辑
- [ ] 识别框架依赖
- [ ] 编写测试覆盖现有功能

### 重构步骤

- [ ] 创建 Domain 层实体和接口
- [ ] 创建 Application 层用例
- [ ] 创建 Infrastructure 层实现
- [ ] 重构 Controller 为薄层
- [ ] 添加依赖注入
- [ ] 更新测试

### 重构后验证

- [ ] 所有测试通过
- [ ] 业务逻辑可以独立测试
- [ ] 没有循环依赖
- [ ] 代码符合依赖规则

## 常见问题

### Q: 应该在哪里放置验证逻辑？

**A:**

- 业务规则验证 → Domain Entity
- 输入格式验证 → Infrastructure Validator
- 用例参数验证 → Application UseCase

### Q: 错误处理应该在哪里？

**A:**

- 领域错误 → Domain 层定义错误类
- 用例错误 → Application 层处理
- HTTP 错误 → Infrastructure Controller 处理

### Q: 如何避免过度设计？

**A:**

- 小项目可以合并 Application 和 Domain
- 简单 CRUD 可以简化用例
- 根据项目规模调整层次深度

## 迁移示例：Product 模块

### 步骤 1：创建 Domain 层

```typescript
// domain/entities/Product.ts
export class Product {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly price: number,
    public readonly category: string
  ) {
    this.validate();
  }

  private validate() {
    if (this.price < 0) {
      throw new DomainError('价格不能为负数');
    }
  }
}

// domain/repositories/IProductRepository.ts
export interface IProductRepository {
  findById(id: string): Promise<Product | null>;
  findByCategory(category: string): Promise<Product[]>;
  findAll(): Promise<Product[]>;
  save(product: Product): Promise<void>;
}
```

### 步骤 2：创建 Application 层

```typescript
// application/use-cases/product/GetProductsUseCase.ts
export class GetProductsUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(query: { category?: string }): Promise<Product[]> {
    if (query.category) {
      return this.productRepository.findByCategory(query.category);
    }
    return this.productRepository.findAll();
  }
}
```

### 步骤 3：创建 Infrastructure 层

```typescript
// infrastructure/persistence/mongodb/repositories/ProductRepository.ts
export class ProductRepository implements IProductRepository {
  constructor(private productModel: Model<ProductDocument>) {}

  async findByCategory(category: string): Promise<Product[]> {
    const docs = await this.productModel.find({ category });
    return docs.map(ProductMapper.toDomain);
  }
}

// infrastructure/http/express/controllers/ProductController.ts
export class ProductController {
  constructor(private getProductsUseCase: GetProductsUseCase) {}

  async getAllProducts(req: Request, res: Response) {
    const products = await this.getProductsUseCase.execute({
      category: req.query.category as string,
    });
    res.json(products);
  }
}
```

## 参考资源

- [Clean Architecture 详细文档](./clean-architecture-refactoring.md)
- [目录结构对比](./directory-structure-comparison.md)
