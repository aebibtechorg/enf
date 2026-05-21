import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/user.dart';
import '../../../core/api/api_client.dart';

final usersProvider = FutureProvider<List<User>>((ref) async {
  final response = await apiClient.get('/api/users');
  return (response.data as List).map((e) => User.fromJson(e)).toList();
});
