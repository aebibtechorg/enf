class PaginatedState<T> {
  final List<T> items;
  final int page;
  final bool isLoading;
  final bool hasNextPage;
  final String? error;

  PaginatedState({
    this.items = const [],
    this.page = 1,
    this.isLoading = false,
    this.hasNextPage = true,
    this.error,
  });

  PaginatedState<T> copyWith({
    List<T>? items,
    int? page,
    bool? isLoading,
    bool? hasNextPage,
    String? error,
  }) {
    return PaginatedState<T>(
      items: items ?? this.items,
      page: page ?? this.page,
      isLoading: isLoading ?? this.isLoading,
      hasNextPage: hasNextPage ?? this.hasNextPage,
      error: error ?? this.error,
    );
  }
}
