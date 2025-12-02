using System.ComponentModel.DataAnnotations;

namespace BSE.Entities;

public class BlogImage
{

    public int Id { get; set; }

    [Required]
    public string ImageUrl { get; set; } = string.Empty;

    [Required]
    public int BlogId { get; set; }

    [Required]
    public Blog Blog { get; set; } = null!;
}