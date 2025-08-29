import 'package:json_annotation/json_annotation.dart';

part 'product.g.dart';

@JsonSerializable()
class Product {
  @JsonKey(name: 'id')
  final String? id;
  final String name;
  final String? description;
  final double price;
  final double? originalPrice;
  final String? image;
  final List<String>? images;
  final String? category;
  final int? stock;
  final bool? inStock;
  final double? rating;
  final int? reviewCount;
  final DateTime? createdAt;
  final DateTime? updatedAt;

  Product({
    this.id,
    required this.name,
    this.description,
    required this.price,
    this.originalPrice,
    this.image,
    this.images,
    this.category,
    this.stock,
    this.inStock,
    this.rating,
    this.reviewCount,
    this.createdAt,
    this.updatedAt,
  });

  factory Product.fromJson(Map<String, dynamic> json) =>
      _$ProductFromJson(json);
  Map<String, dynamic> toJson() => _$ProductToJson(this);

  Product copyWith({
    String? id,
    String? name,
    String? description,
    double? price,
    double? originalPrice,
    String? image,
    List<String>? images,
    String? category,
    int? stock,
    bool? inStock,
    double? rating,
    int? reviewCount,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      originalPrice: originalPrice ?? this.originalPrice,
      image: image ?? this.image,
      images: images ?? this.images,
      category: category ?? this.category,
      stock: stock ?? this.stock,
      inStock: inStock ?? this.inStock,
      rating: rating ?? this.rating,
      reviewCount: reviewCount ?? this.reviewCount,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }

  // 获取所有图片，包括主图片
  List<String> getAllImages() {
    final allImages = <String>[];
    if (image != null && image!.isNotEmpty) {
      allImages.add(image!);
    }
    if (images != null && images!.isNotEmpty) {
      allImages.addAll(images!);
    }
    return allImages;
  }

  // 检查是否有库存
  bool get hasStock => inStock ?? (stock ?? 0) > 0;

  // 获取折扣百分比
  double? get discountPercentage {
    if (originalPrice == null || originalPrice! <= price) return null;
    return ((originalPrice! - price) / originalPrice! * 100).roundToDouble();
  }

  @override
  String toString() {
    return 'Product(id: $id, name: $name, price: $price, category: $category)';
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is Product && other.id == id;
  }

  @override
  int get hashCode => id.hashCode;
}
