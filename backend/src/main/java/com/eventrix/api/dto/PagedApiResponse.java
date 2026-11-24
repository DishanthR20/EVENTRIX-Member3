
package com.eventrix.api.dto;

import java.util.List;

public record PagedApiResponse<T>(
    boolean success,
    String message,
    List<T> data,
    PaginationMetadata pagination
) {
}
