using AutoMapper;
using BSE.Data;
using BSE.DTOs;
using BSE.Entities;
using Microsoft.EntityFrameworkCore;

namespace BSE.Services;

public class BlogService : IBlogService
{
    private readonly ApplicationDbContext _context;
    private readonly IFileStorageService _fileStorageService;
    private readonly IMapper _mapper;

    public BlogService(
        ApplicationDbContext context,
        IFileStorageService fileStorageService,
        IMapper mapper)
    {
        _context = context;
        _fileStorageService = fileStorageService;
        _mapper = mapper;
    }

    public async Task<BlogResponse> CreateBlogAsync(CreateBlogRequest request, int authorId)
    {
        // Create blog entity
        var blog = new Blog
        {
            Title = request.Title,
            Content = request.Content,
            AuthorId = authorId
        };

        _context.Blogs.Add(blog);
        await _context.SaveChangesAsync();

        // Handle image uploads
        if (request.Images != null && request.Images.Count > 0)
        {
            var imageUrls = await _fileStorageService.SaveFilesAsync(request.Images, "blog-images");

            foreach (var imageUrl in imageUrls)
            {
                var blogImage = new BlogImage
                {
                    ImageUrl = imageUrl,
                    BlogId = blog.Id
                };
                _context.BlogImages.Add(blogImage);
            }

            await _context.SaveChangesAsync();
        }

        // Reload blog with author and images
        var createdBlog = await _context.Blogs
            .Include(b => b.Author)
            .Include(b => b.Images)
            .FirstAsync(b => b.Id == blog.Id);

        return _mapper.Map<BlogResponse>(createdBlog);
    }

    public async Task<PaginatedResponse<BlogResponse>> GetAllBlogsAsync(int page, int pageSize)
    {
        // Validate pagination parameters
        if (page < 1) page = 1;
        if (pageSize < 1) pageSize = 10;
        if (pageSize > 100) pageSize = 100; // Max page size

        // Get total count
        var totalCount = await _context.Blogs.CountAsync();

        // Calculate pagination
        var skip = (page - 1) * pageSize;
        var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

        // Get blogs
        var blogs = await _context.Blogs
            .Include(b => b.Author)
            .Include(b => b.Images)
            .OrderByDescending(b => b.Id)
            .Skip(skip)
            .Take(pageSize)
            .ToListAsync();

        var blogResponses = _mapper.Map<List<BlogResponse>>(blogs);

        return new PaginatedResponse<BlogResponse>
        {
            Items = blogResponses,
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize,
            TotalPages = totalPages,
            HasNextPage = page < totalPages,
            HasPreviousPage = page > 1
        };
    }

    public async Task<BlogResponse> GetBlogByIdAsync(int id)
    {
        var blog = await _context.Blogs
            .Include(b => b.Author)
            .Include(b => b.Images)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (blog == null)
        {
            throw new KeyNotFoundException($"Blog with ID {id} not found");
        }

        return _mapper.Map<BlogResponse>(blog);
    }

    public async Task<BlogResponse> UpdateBlogAsync(int id, UpdateBlogRequest request, int userId, string userRole)
    {
        var blog = await _context.Blogs
            .Include(b => b.Author)
            .Include(b => b.Images)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (blog == null)
        {
            throw new KeyNotFoundException($"Blog with ID {id} not found");
        }

        // Check authorization: only author or admin can update
        if (blog.AuthorId != userId && userRole != "Admin")
        {
            throw new UnauthorizedAccessException("You don't have permission to update this blog");
        }

        // Update blog properties
        blog.Title = request.Title;
        blog.Content = request.Content;

        // Handle new images
        if (request.NewImages != null && request.NewImages.Count > 0)
        {
            var imageUrls = await _fileStorageService.SaveFilesAsync(request.NewImages, "blog-images");

            foreach (var imageUrl in imageUrls)
            {
                var blogImage = new BlogImage
                {
                    ImageUrl = imageUrl,
                    BlogId = blog.Id
                };
                _context.BlogImages.Add(blogImage);
            }
        }

        await _context.SaveChangesAsync();

        // Reload blog to get updated data
        var updatedBlog = await _context.Blogs
            .Include(b => b.Author)
            .Include(b => b.Images)
            .FirstAsync(b => b.Id == id);

        return _mapper.Map<BlogResponse>(updatedBlog);
    }

    public async Task DeleteBlogAsync(int id, int userId, string userRole)
    {
        var blog = await _context.Blogs
            .Include(b => b.Images)
            .FirstOrDefaultAsync(b => b.Id == id);

        if (blog == null)
        {
            throw new KeyNotFoundException($"Blog with ID {id} not found");
        }

        // Check authorization: only author or admin can delete
        if (blog.AuthorId != userId && userRole != "Admin")
        {
            throw new UnauthorizedAccessException("You don't have permission to delete this blog");
        }

        // Delete associated images from storage
        foreach (var image in blog.Images)
        {
            await _fileStorageService.DeleteFileAsync(image.ImageUrl);
        }

        // Delete blog (cascade delete will handle BlogImages)
        _context.Blogs.Remove(blog);
        await _context.SaveChangesAsync();
    }
}
