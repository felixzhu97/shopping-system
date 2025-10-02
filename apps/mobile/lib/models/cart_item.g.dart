// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'cart_item.dart';

// **************************************************************************
// JsonSerializableGenerator
// **************************************************************************

CartItem _$CartItemFromJson(Map<String, dynamic> json) => CartItem(
  productId: json['productId'] as String,
  quantity: (json['quantity'] as num).toInt(),
  name: json['name'] as String?,
  image: json['image'] as String?,
  price: (json['price'] as num?)?.toDouble(),
  description: json['description'] as String?,
  product: json['product'] == null
      ? null
      : Product.fromJson(json['product'] as Map<String, dynamic>),
);

Map<String, dynamic> _$CartItemToJson(CartItem instance) => <String, dynamic>{
  'productId': instance.productId,
  'quantity': instance.quantity,
  'name': instance.name,
  'image': instance.image,
  'price': instance.price,
  'description': instance.description,
  'product': instance.product,
};
