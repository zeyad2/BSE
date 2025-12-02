using System.ComponentModel.DataAnnotations;

namespace BSE.DTOs;

public class CreateBlogRequest
{
    [Required(ErrorMessage = "Title is required")]
    [StringLength(200, ErrorMessage = "Title cannot exceed 200 characters")]
    public string Title { get; set; } = string.Empty;

    [Required(ErrorMessage = "Content is required")]
    public string Content { get; set; } = string.Empty;

    // Images will be uploaded as multipart/form-data
    public IFormFileCollection? Images { get; set; }
}
