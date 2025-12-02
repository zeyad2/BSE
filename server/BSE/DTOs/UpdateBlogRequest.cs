using System.ComponentModel.DataAnnotations;

namespace BSE.DTOs;

public class UpdateBlogRequest
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Content is required")]
    public string Content { get; set; } = string.Empty;

    // Optional: Add new images to the blog post
    public IFormFileCollection? NewImages { get; set; }
}
