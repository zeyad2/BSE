using BSE.DTOs;

namespace BSE.Services;

public interface IBlogService
{
    Task<BlogResponse> CreateBlogAsync(CreateBlogRequest request, int authorId);
    Task<PaginatedResponse<BlogResponse>> GetAllBlogsAsync(int page, int pageSize);
    Task<BlogResponse> GetBlogByIdAsync(int id);
    Task<BlogResponse> UpdateBlogAsync(int id, UpdateBlogRequest request, int userId, string userRole);
    Task DeleteBlogAsync(int id, int userId, string userRole);
}
