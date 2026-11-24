
package com.eventrix.api.dto;

public record PaginationMetadata(
    int page,
    int size,
    long totalElements,
    int totalPages
) {
}
