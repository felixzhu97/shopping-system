import 'package:json_annotation/json_annotation.dart';
import 'product.dart';

part 'cart_item.g.dart';

@JsonSerializable()
class CartItem {
  @JsonKey(name: 'productId')
  final String productId;

  @JsonKey(name: 'quantity')
  final int quantity;

  @JsonKey(name: 'name')
  final String? name;

  @JsonKey(name: 'image')
  final String? image;

  @JsonKey(name: 'price')
  final double? price;

  @JsonKey(name: 'description')
  final String? description;

  @JsonKey(name: 'product')
  final Product? product;

  CartItem({
    required this.productId,
    required this.quantity,
    this.name,
    this.image,
    this.price,
    this.description,
    this.product,
  });

  factory CartItem.fromJson(Map<String, dynamic> json) =>
      _$CartItemFromJson(json);
  Map<String, dynamic> toJson() => _$CartItemToJson(this);

  // 计算小计
  double get subtotal {
    final productPrice = product?.price ?? price ?? 0.0;
    return productPrice * quantity;
  }

  // 复制并更新数量
  CartItem copyWith({
    String? productId,
    int? quantity,
    String? name,
    String? image,
    double? price,
    String? description,
    Product? product,
  }) {
    return CartItem(
      productId: productId ?? this.productId,
      quantity: quantity ?? this.quantity,
      name: name ?? this.name,
      image: image ?? this.image,
      price: price ?? this.price,
      description: description ?? this.description,
      product: product ?? this.product,
    );
  }

  @override
  bool operator ==(Object other) {
    if (identical(this, other)) return true;
    return other is CartItem && other.productId == productId;
  }

  @override
  int get hashCode => productId.hashCode;

  @override
  String toString() {
    return 'CartItem(productId: $productId, quantity: $quantity, name: $name)';
  }
}
