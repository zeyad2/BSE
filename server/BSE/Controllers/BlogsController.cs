using System.Security.Claims;
using BSE.DTOs;
using BSE.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace BSE.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BlogsController : ControllerBase
{
    private readonly IBlogService _blogService;
    private readonly ILogger<BlogsController> _logger;

    public BlogsController(IBlogService blogService, ILogger<BlogsController> logger)
    {
        _blogService = blogService;
        _logger = logger;
    }

    /// <summary>
    /// Create a new blog post (requires authentication)
    /// </summary>
    [Authorize]
    [HttpPost]
    [ProducesResponseType(typeof(BlogResponse), StatusCodes.Status201Created)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<BlogResponse>> CreateBlog([FromForm] CreateBlogRequest request)
    {
        try
        {
            var userId = GetUserId();
            var response = await _blogService.CreateBlogAsync(request, userId);
            return CreatedAtAction(nameof(GetBlogById), new { id = response.Id }, response);
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to create blog");
            return BadRequest(new ErrorResponse
            {
                Message = ex.Message,
                StatusCode = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error creating blog");
            return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
            {
                Message = "An unexpected error occurred",
                StatusCode = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get all blog posts with pagination (public access)
    /// </summary>
    [HttpGet]
    [ProducesResponseType(typeof(PaginatedResponse<BlogResponse>), StatusCodes.Status200OK)]
    public async Task<ActionResult<PaginatedResponse<BlogResponse>>> GetAllBlogs(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10)
    {
        try
        {
            var response = await _blogService.GetAllBlogsAsync(page, pageSize);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving blogs");
            return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
            {
                Message = "An unexpected error occurred",
                StatusCode = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Get a specific blog post by ID (public access)
    /// </summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BlogResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BlogResponse>> GetBlogById(int id)
    {
        try
        {
            var response = await _blogService.GetBlogByIdAsync(id);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Blog with ID {BlogId} not found", id);
            return NotFound(new ErrorResponse
            {
                Message = ex.Message,
                StatusCode = StatusCodes.Status404NotFound
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving blog with ID {BlogId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
            {
                Message = "An unexpected error occurred",
                StatusCode = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Update a blog post (requires authentication, only author or admin)
    /// </summary>
    [Authorize]
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(BlogResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<ActionResult<BlogResponse>> UpdateBlog(int id, [FromForm] UpdateBlogRequest request)
    {
        try
        {
            var userId = GetUserId();
            var userRole = GetUserRole();
            var response = await _blogService.UpdateBlogAsync(id, request, userId, userRole);
            return Ok(response);
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Blog with ID {BlogId} not found", id);
            return NotFound(new ErrorResponse
            {
                Message = ex.Message,
                StatusCode = StatusCodes.Status404NotFound
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized update attempt on blog {BlogId}", id);
            return StatusCode(StatusCodes.Status403Forbidden, new ErrorResponse
            {
                Message = ex.Message,
                StatusCode = StatusCodes.Status403Forbidden
            });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Failed to update blog {BlogId}", id);
            return BadRequest(new ErrorResponse
            {
                Message = ex.Message,
                StatusCode = StatusCodes.Status400BadRequest
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error updating blog {BlogId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
            {
                Message = "An unexpected error occurred",
                StatusCode = StatusCodes.Status500InternalServerError
            });
        }
    }

    /// <summary>
    /// Delete a blog post (requires authentication, only author or admin)
    /// </summary>
    [Authorize]
    [HttpDelete("{id}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status403Forbidden)]
    [ProducesResponseType(typeof(ErrorResponse), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteBlog(int id)
    {
        try
        {
            var userId = GetUserId();
            var userRole = GetUserRole();
            await _blogService.DeleteBlogAsync(id, userId, userRole);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            _logger.LogWarning(ex, "Blog with ID {BlogId} not found", id);
            return NotFound(new ErrorResponse
            {
                Message = ex.Message,
                StatusCode = StatusCodes.Status404NotFound
            });
        }
        catch (UnauthorizedAccessException ex)
        {
            _logger.LogWarning(ex, "Unauthorized delete attempt on blog {BlogId}", id);
            return StatusCode(StatusCodes.Status403Forbidden, new ErrorResponse
            {
                Message = ex.Message,
                StatusCode = StatusCodes.Status403Forbidden
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unexpected error deleting blog {BlogId}", id);
            return StatusCode(StatusCodes.Status500InternalServerError, new ErrorResponse
            {
                Message = "An unexpected error occurred",
                StatusCode = StatusCodes.Status500InternalServerError
            });
        }
    }

    private int GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }
        return userId;
    }

    private string GetUserRole()
    {
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;
        if (string.IsNullOrEmpty(userRole))
        {
            throw new UnauthorizedAccessException("User role not found in token");
        }
        return userRole;
    }
}
